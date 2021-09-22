const admin = require("../middleware/firebase_admin");
const { readQuery: userReadQuery } = require("./user");

const { parsePhoneNumber } = require("libphonenumber-js");

const findRef = type => {
    return admin.database().ref(type);
}

class readQuery {

    static async friendRequests(userId) {
        const friendRequest = []
        const ref = findRef("USER/" + userId + "/friendrns");
        const snapshot = await ref.once('value');
        
        if (snapshot.exists() == false) {
            return []
        }
        
        let val = snapshot.val();
        let keys = Object.keys(val);

        keys.forEach(key => {
            friendRequest.push(val[key]);
        });

        return friendRequest
    }

    static async friendsIdentifier(userId) {

        const basicRef = findRef("USER/" + userId);
        const basicSnapshot = await basicRef.once('value');

        if (basicSnapshot.hasChild('friends') == false) {
            return [];
        }

        const ref = basicRef.child("friends")
        if (ref.exists == false) {
            return []
        }

        const snapshot = await ref.once('value');

        var friends = JSON.stringify(snapshot)
        var obj = JSON.parse(friends)
        
        if (friends == undefined || friends == null) {
            return []
        }

        const identifiers = []
        for(var key in obj) {
            identifiers.push(key)
        }

        return identifiers
    }

    static async cannotBeFriends(userId) {
        var requests = await readQuery.friendRequests(userId);
        var friends = await readQuery.friendsIdentifier(userId);

        if (requests == undefined || requests == null) {
            requests = []
        }
        
        if (friends == undefined || friends == null) {
            friends = []
        }
        requests = requests.map(request => request.id);
        friends.forEach(friend => {
            requests.push(friend);
        });

        requests.push(userId);
        return requests;
    }


    static async usersFromNumbers(identifiers, numbers) {

        const users = [];

        const ref = findRef('USER');
        const snapshot = await ref.once('value');
        
        snapshot.forEach( snap => {
            let phonenumber = snap.val().phonenumber;
            if(phonenumber != '' && phonenumber != undefined) {
                if(numbers.has(phonenumber)) {
                    let id = snap.val().id;

                    if(!identifiers.includes(id)) {
                        let data = snap.toJSON();
                        users.push(data);
                    }
                }
            }
        });

        return users;
    }

    
    static async loadUserFriends(userId) {
        const friendIds = [];
        const friendsRef = findRef("USER/" + userId + "/friends");
        const snapshots = await friendsRef.once("value");
        const friendsVal = snapshots.val();
        if(friendsVal == undefined) {
            return [];
        }
        snapshots.forEach( snap => {
            friendIds.push(snap.val().id);
        })

        const friends = [];
        friendIds.forEach( async friendId => {
            let val = await userReadQuery.loadSmallUser(friendId);
            friends.push(val);
        })

        return friends;
    }

}


class deleteQuery {

    static async deleteFriend(userId, friendId) {

        const userRef = findRef("USER/" + userId + "/friends").orderByChild("id").equalTo(friendId);
        const userSnapshot = await userRef.once("value");
        
        if(userSnapshot.exists()) {
            userSnapshot.ref.remove();
        }
    
        const friendRef = findRef("USER/" + friendId + "/friends").orderByChild("id").equalTo(userId);
        const friendSnapshot = await friendRef.once("value");

        if(friendSnapshot.exists) {
            friendSnapshot.ref.remove();
        }
    }
}



module.exports = { readQuery, deleteQuery };