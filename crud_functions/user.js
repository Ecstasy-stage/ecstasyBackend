const admin = require("../middleware/firebase_admin");



//===========================Global functions==============================

const findRef = type => {
    return admin.database().ref(type);
}


//=======================CREATE Queries=====================================

class createQuery {

    static async login(userId, type, name, photourl) {
        const ref = findRef("USER/" + userId);
        const snapshot = await ref.once('value');

        if (snapshot.exists() && snapshot.hasChildren()) {
            return await Utils.updateUser(userId, type);
        } else {
            await createQuery.createUser(userId, type, name, photourl)
            .then(() => {
                return true;
            })
            .catch( err => {
                return "error";
            })
        }
    }

    static async createUser(userId, type, name, photourl) {

        const ref = findRef("USER/" + userId);
        ref.set({
            'admirerscount': '0',
            'followerscount': '0',
            'id': userId,
            'name': name,
            'username': "@" + name.split(' ').join('').toLowerCase(),
            'phonenumber': '',
            'photourl': photourl,
            'sharescount': '0',
            'type': type
        });
      
        const secondRef = findRef('ALLUSER');
        const snapshot = await secondRef.once('value')
        const number = String(snapshot.numChildren())
        secondRef.child(number).set({
            'id': userId,
            'name': name,
            'phonenumber': '',
            'photo': photourl
        });

        const smallRef = findRef('SMALL-USER');
        smallRef.child(userId).set({
            'name': name,
            'photourl': photourl,
            'username': "@" + name.split(' ').join('').toLowerCase()
        });     
    }
};


//===========================UPDATE Queries=================================

class updateQuery {

    static async updateUser(userId, type) {
        const ref = findRef("USER/" + userId)
        const snapshot = await ref.once('value')
        const object = snapshot.toJSON()
        return (object.type == type);
    }

    static async editProfile(user) {
        const userId = user.userId;
        const name = user.name;
        const username = user.username;
        const bio = user.bio;
        const number = user.number;

        const ref = findRef("USER/" + userId);
        const allRefKey = (await findRef("ALLUSER").orderByChild("id").equalTo(userId).once("value")).key;
        const allRef = findRef("ALLUSER/" + allRefKey);

        if(name !== undefined) {
            ref.update({
                "name": name
            });
            allRef.update({
                "name": name
            });
        }
        if(username !== undefined) {
            ref.update({
                "username": username
            });
        }
        if(bio !== undefined) {
            ref.update({
                "bio": bio
            });
        }
        if(number !== undefined) {
            if (number !== '') {
                await Utils.validateNumber(number, userId)
                .then( res => {
                    if(!res) {
                        return false;
                    } else {
                        try {
                            const newNumber = parsePhoneNumber(number).nationalNumber
                            ref.update({"phonenumber": newNumber})
                            generalRef.update({"phonenumber": newNumber})
                        } catch (err) {
                            ref.update({"phonenumber": number})
                            generalRef.update({"phonenumber": number})
                        }
                    }
                });
            } else {
                ref.update({'phonenumber': ''})
                generalRef.update({'phonenumber': ''})
            }
        }

        const smallUser = findRef("SMALL-USER/" + userId);

        if (name !== undefined) {
            smallUser.update({'name': name})
        }
        if (username !== undefined) {
            smallUser.update({'username': username})
        }
    }

}

//====================READ Queries=====================================

class readQuery {
    static async loadUserById(userId) {
        const ref = findRef("USER/" + userId);
        const snap = await ref.once("value");
        const user = snap.toJSON();
        return user;
    }

    static async loadSmallUser(userId) {
        const ref = findRef("SMALL-USER/" + userId);
        var user = await ref.once("value").val();

        user = user.toJSON();
        user.id = ref.key;
        return user;
    }
}



module.exports = { createQuery, readQuery, updateQuery };