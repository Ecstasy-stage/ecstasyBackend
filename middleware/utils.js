const firebase = require('./firebase_admin.js');
const { sendNotification, postSilentNotification } = require('./notifications');
const admin = require('firebase-admin');
const { parsePhoneNumber } = require('libphonenumber-js')
const {sendLoginSuccessEmail} = require('./sendEmail');



class Utils {

    static async loadSmallUser(identifier) {
        const database = admin.database()
        const ref = database.ref().child("SMALL-USER").child(identifier)
        
        var user = await ref.once('value', snapshot => { return snapshot.val() })
        user = user.toJSON()
        if (user !== null) {
            user.id = ref.key
            return user
        }
    }

    static async loadUser(identifier) {
        const database = admin.database()
        const ref = database.ref().child("USER").child(identifier)
        
        var user = await ref.once('value', snapshot => { return snapshot.val() })
        user = user.toJSON()
        if (user !== null) {
            user.id = ref.key
            return user
        }
       
        
    }

    static async loadSmallUsers(identifiers) {
        var users = []
        
        for (var index in identifiers) {
            const user = await Utils.loadSmallUser(identifiers[index])
            if (user !== undefined) {
                users.push(user)
            }
            
        }
    
        return users
    }
    
    static async loadUsers(identifiers) {
        var users = []
        
        for (var index in identifiers) {
            const user = await Utils.loadUser(identifiers[index])
            if (user !== undefined) {
                users.push(user)
            }
            
        }
    
        return users
    }
    
    static async sendFriendRequest(userIdentifier, friendIdentifier) {
        
        const user = await Utils.loadUser(userIdentifier)
        const friend = await Utils.loadUser(friendIdentifier)
        
        const userRef = admin.database().ref().child("USER").child(user.id).child("friendrns")
        userRef.once('value').then(snapshot => {
            const count = snapshot.hasChildren() ? snapshot.numChildren() : 0
            const body = {
                'id': friendIdentifier,
                'name': friend.name,
                //'phonenumber': friend.phonenumber,
                'photo': friend.photourl,
                'type': 'S'
            }
            
            const newRef = userRef.child(String(count))
            newRef.set(body)
        })
    
        const friendRef = admin.database().ref().child("USER").child(friend.id).child("friendrns")
        friendRef.once('value').then(snapshot => {
            const count = snapshot.hasChildren() ? snapshot.numChildren() : 0
            const body = {
                'id': userIdentifier,
                'name': user.name,
                //'phonenumber': user.phonenumber,
                'photo': user.photourl,
                'type': 'R'
            }
    
            const newRef = friendRef.child(String(count))
            newRef.set(body)
        })

        postSilentNotification(friendIdentifier, 'Friend request', 'You got a new friend request from ' + user.name)
        sendNotification('Friend request', 'You got a new friend request from ' + user.name, friendIdentifier)


        return friend
    }
    

    static async acceptFriendRequest(userIdentifier, friendIdentifier) {
        const userBasic = admin.database().ref().child("USER").child(userIdentifier)
        const user = userBasic.child("friendrns")

        user.orderByChild('id').equalTo(friendIdentifier).once('child_added', async function(snapshot) {
            const userFriend = userBasic.child('friends')
            var body = snapshot.val()
            const friendId = body.id
            delete body.type

            await userFriend.child(friendId).set(body)
    
            snapshot.ref.remove()
        })
    
        const friendBasic = admin.database().ref().child("USER").child(friendIdentifier)
        const friend = friendBasic.child("friendrns")
        friend.orderByChild('id').equalTo(userIdentifier).once('child_added', async function(snapshot) {
            const userFriend = friendBasic.child('friends')
            var body = snapshot.val()
            const friendId = body.id
            delete body.type

            await userFriend.child(friendId).set(body)
    
            snapshot.ref.remove()
        })
        // const friends = await Utils.friendsIdentifier(userIdentifier)
        // friends.forEach(element => {
        //     console.log("friend is: " + element);
        // });

        const loadedUser = await Utils.loadUser(userIdentifier)
        postSilentNotification(friendIdentifier, 'New friend', loadedUser.name + ' has accepted your request')
        sendNotification('New friend', loadedUser.name + ' has accepted your request', friendIdentifier)
    }
    
    static async denyFriendRequest(userIdentifier, friendIdentifier) {
        const userBasic = admin.database().ref().child("USER").child(userIdentifier)
        const user = userBasic.child("friendrns")
        user.orderByChild('id').equalTo(friendIdentifier).once('child_added', function(snapshot) {
            snapshot.ref.remove()
        })
    
        const friendBasic = admin.database().ref().child("USER").child(friendIdentifier)
        const friend = friendBasic.child("friendrns")
        friend.orderByChild('id').equalTo(userIdentifier).once('child_added', function(snapshot) {
            snapshot.ref.remove()
        })
    }
    

    // static async usersFrom`  Number(identifiers, number) {
    //     const ref = admin.database().ref().child('USER').orderByChild('phonenumber').equalTo(number)
    //     //const ref = admin.database().ref().child('ALLUSER').orderByChild('phonenumber').equalTo(number)
    //     const snapshot = await ref.once('value')
    //     var newUsers = []
    //     snapshot.forEach(childSnapshot => {
    //         var customUser = childSnapshot.toJSON()
    //              customUser.id = childSnapshot.key
                
    //              if (identifiers.includes(customUser.id) == false) {
    //                  newUsers.push(customUser)
    //              }
    //     })
        
    //     return newUsers
    // }


    static async userFromUniversalNumber(number, identifier) {
        var users = []
        // const defaultUsers = await Utils.usersFromNumber([identifier], number)
        // defaultUsers.forEach(user => users.push(user))
        
        try {
            const nationalNumber = parsePhoneNumber(number).nationalNumber
            if (nationalNumber !== undefined) {
                var nationalFriends = await Utils.usersFromNumber([identifier], nationalNumber)
                nationalFriends.forEach(user => users.push(user))
            } else {
                const defaultUsers = await Utils.usersFromNumber([identifier], number)
        defaultUsers.forEach(user => users.push(user))
            }
        } catch {
            console.log('error', users)
            return users
        }

        return users
    }


    // check if number is already existing in anothers account return true if not...

    static async validateNumber(number, identifier) {
        var nationalNumber

        try {
            nationalNumber =  parsePhoneNumber(number).nationalNumber
        } catch (err) {
            let num = number
            // if(number.length > 10) {
            //     num = number.substring(number.length - 10)
            // }
            
            // if (num.charAt(0) == '0') {

            //     while(num.charAt(0) == '0') {
            //         num = num.slice(1)
            //     }

            // }

            nationalNumber = num
        }
        const ref = admin.database().ref().child('USER').orderByChild('phonenumber').equalTo(number)
        const snap = await ref.once('value')
        if(snap.exists()) {
            return false
        } else {
            return true
        }
    }

    static async userFromNumber(identifiers, number) {
        const ref = admin.database().ref().child('USER').orderByChild('phonenumber').equalTo(number)
        const snap = await ref.once('value')
        var user
        if(snap.exists()) {
            let data = snap.toJSON()
            for (let key in data) {
                // console.log('key is: ', key);
                if ( !identifiers.includes(key)) {
                    console.log(key);
                    user = data[key]
                }
            }
        }
        return user
    }

    static async usersFromNumbers(identifiers, numbers) {
        // console.time('label')
        // const users = []
        // // console.log('running users from number function...');
        // for(let i in numbers) {
        //     let number = numbers[i]
        //     // console.log('num is: ', number);
        //     var friend = await Utils.userFromNumber(identifiers, number)
            
        //     if (friend != undefined) {
        //         // console.log('friend : ', friend)
        //         users.push(friend)
        //     }
        // }
        // // console.log('ending function users from numbers..');
        // // console.timeEnd('label')
        // return users

        const users = []

        const ref = admin.database().ref().child('USER')
        const snapshot = await ref.once('value')
        
        snapshot.forEach(snap => {
            let phonenumber = snap.val().phonenumber
            if(phonenumber != '' && phonenumber != undefined) {
                if(numbers.has(phonenumber)) {
                    let id = snap.val().id
                    if(!identifiers.includes(id)) {
                        let data = snap.toJSON()
                        users.push(data)
                    }
                }
            }
        })

        return users
    }


    // static async usersFromNumbers(identifiers, numbers) {
    //     var users = []
    //     for (var number in numbers) {
    //         const simpleNumber = numbers[number]
            
    //         var friends = await Utils.usersFromNumber(identifiers, simpleNumber)
    //         try {
    //             const nationalNumber =  parsePhoneNumber(simpleNumber).nationalNumber
    //             if (nationalNumber !== undefined) {
    //                 var nationalFriends = await Utils.usersFromNumber(identifiers, nationalNumber)
    //                 nationalFriends.forEach(friend => {
    //                     if (friends.includes(friend) == false) {
    //                         friends.push(friend)
    //                     }   
    //                 })
    //             }
    //         } catch {
    //             console.log('error')
    //         }
            
            
    //         if (friends.toJSON !== null) {
    //             friends.forEach(friend => { users.push(friend) })
    //         }
            
    //     }
    //     return users
    // }
    
    static async friendRequests(identifier) {
        const friendRequest = []
        var ref = admin.database().ref().child("USER").child(identifier).child("friendrns")
        if (ref.exists == false) {
            return []
        }
        const snapshot = await ref.once('value')
        
        let val = snapshot.val()
        if(val !== null) {
            let keys = Object.keys(val)
    
            keys.forEach(key => {
                friendRequest.push(val[key]);
            })
    
        }
        return friendRequest;
    }
    
    static async friendsIdentifier(identifier) {

        const basicRef = admin.database().ref().child("USER").child(identifier)
        const basicSnapshot = await basicRef.once('value')

        if (basicSnapshot.hasChild('friends') == false) {
            return []
        }

        const ref = basicRef.child("friends")
        if (ref.exists == false) {
            return []
        }

        const snapshot = await ref.once('value')
    
        // var friends = snapshot.toJSON()
        // var obj = JSON.parse(friends)
        // var res = []
        // for(var key in obj) 
        //     res.push(key)
        // console.log("friends in identifier1: " + res);

        var friends = JSON.stringify(snapshot)
        var obj = JSON.parse(friends)
        
        if (friends == undefined || friends == null) {
            return []
        }

        const identifiers = []
        for(var key in obj) {
            identifiers.push(key)
        }


        // friends = Array(friends)
        // console.log("friends in identifier2: " + friends);
        //Extract friends' identifier
        // const identifiers = friends.map(value => value.id)
        return identifiers
    }
    
    static async cannotBeFriends(identifier) {
        var requests = await Utils.friendRequests(identifier)
        var friends = await Utils.friendsIdentifier(identifier)
        if (requests == undefined || requests == null) {
            requests = []
        }
        
        if (friends == undefined || friends == null) {
            friends = []
        }
        requests = requests.map(request => request.id)
        friends.forEach(friend => {
            requests.push(friend)
        })
        requests.push(identifier)
        return requests
    }
    
    static async deleteFriend(userIdentifier, friendIdentifier) {
        const ref = admin.database().ref().child("USER")
        const userRef = ref.child(userIdentifier).child("friends").orderByChild('id').equalTo(friendIdentifier)
        const userSnapshot = await userRef.once('child_added')
        if (userSnapshot.exists) {
            userSnapshot.ref.remove()
        }
    
        const friendRef = ref.child(friendIdentifier).child("friends").orderByChild('id').equalTo(userIdentifier)
        const friendSnapshot = await friendRef.once('child_added')
        if (friendSnapshot.exists) {
            friendSnapshot.ref.remove()
        }
        // const friends = await Utils.friendsIdentifier(userIdentifier)
        // friends.forEach(element => {
        //     console.log("friend is: " + element);
        // });
    }
    
    static async videosFromUser(userIdentifier) {
        const ref = admin.database().ref().child("USER").child(userIdentifier).child('videolist')
        if (ref.exists == false) {
            return []
        }
        var videos = []
        const snapshot = await ref.once('value')
        snapshot.forEach(child => {
            videos.push(child.toJSON())
        })
        return videos
    }
    
    static async friendVideos(userIdentifier) {
        var videos = []
        const loadedFriendsIdentifier = await Utils.friendsIdentifier(userIdentifier)
        
        for (var index in loadedFriendsIdentifier) {
            const newVideos = await Utils.videosFromUser(loadedFriendsIdentifier[index])
            newVideos.forEach(video => {
                videos.push(video)
            })
        }
        return videos
    }
    
    // find user friends and return their recently shared 5 videos in an array....
    static async sharedVideoIdentifiers(userIdentifier) {

        var finalValues = new Map();

        // get all friends id.....
        const friendIdentifiers = await Utils.friendsIdentifier(userIdentifier)

        // for each friend......find their recent 5 shared videos...
        for (var index in friendIdentifiers) {


            const friendIdentifier = friendIdentifiers[index]

            const ref = admin.database().ref(`USER/${friendIdentifier}/sharedvideos`).limitToLast(5);
            const snapshot = await ref.once('value')
            
            
            var recentSharedVideos = snapshot.val()
            
            if(recentSharedVideos == undefined || recentSharedVideos == null) {
                continue;
            }

            for(let i in recentSharedVideos) {
                let video = recentSharedVideos[i];
                // console.log('vid', video);
                let videoOwner = video.videoOwner;
                let vnum = video.vnum;
                if(finalValues.has(videoOwner)) {
                    let currData = finalValues.get(videoOwner);
                    if(currData.has(vnum)) {
                        let currVidData = currData.get(vnum);
                        // console.log('has vnum');
                        currVidData.sharedBy.add(friendIdentifier);
                        // console.log(currVidData.sharedBy);

                    } else {
                        // console.log('no vnum');
                        let data = {
                            "sharedBy": new Set().add(friendIdentifier)
                        }
                        currData.set(vnum, data);
                    }
                } else {
                    // console.log('no owner');
                    let newVnum = new Map();
                    let data = {
                        "sharedBy": new Set().add(friendIdentifier)
                    }
                    newVnum.set(vnum, data);
                    finalValues.set(videoOwner, newVnum);
                }
                
            }
        }
        return finalValues
    }

    // return videos shared by user's friends.....
    static async sharedVideos(userIdentifier) {
        
        // shared videos data...
        var sharedVideosData = await Utils.sharedVideoIdentifiers(userIdentifier)
        
        // for each shared video....load video data....
        sharedVideosData.forEach((value, key) => {
            let videoOwner = key;
            value.forEach(async (vnumData, vnumKey) => {
                let vnum = vnumKey;
                let videoData = await Utils.loadVideoByVnum(videoOwner, vnum);
                vnumData.videoData = videoData;
            })
        })
        return sharedVideosData;
    }

    // load video data of given user's video.......
    static async loadVideoByVnum(ownerIdentifier, vnum) {

        const ref = admin.database().ref(`USER/${ownerIdentifier}/videolist/${vnum}`);
        const snapshot = await ref.once('value')
        if (snapshot.exists()) {
            return snapshot.toJSON();
        }
        
        return null;
        
    }

    // load user's admiring(following) list...
    static async loadAdmiringIdentifier(userIdentifier) {
        const ref = admin.database().ref('USER').child(userIdentifier).child('admiring')
        
        if (ref.exists == false) {
            return []
        }
        const snapshot = await ref.once('value')
    
        const admirings = snapshot.val()
        if (admirings == undefined || admirings == null) {
            return []
        }
        //Extract friends' identifier
        const identifiers = admirings.map(value => value.id)
        return identifiers
    }

    // load 5 recent videos of user..........
    static async loadRecentVideos(videoOwner, sharedVideos) {
        const ref = admin.database().ref(`USER/${videoOwner}/videolist`).limitToLast(5);
        const snapshots = await ref.once('value');
        if(snapshots.exists()) {
            snapshots.forEach(snap => {
                let vnum = snap.val().vnum
                // console.log('vnum', vnum);
                if(sharedVideos.has(videoOwner)) {
                    let currData = sharedVideos.get(videoOwner);
                    if(!currData.has(vnum)) {
                        let data = {
                            "sharedBy": new Set(),
                            "videoData": snap.val()
                        }
                        currData.set(vnum, data);
                    }
                } else {
                    let newVnum = new Map();
                    let data = {
                        "sharedBy": new Set(),
                        "videoData": snap.val()
                    }
                    newVnum.set(vnum, data);
                    sharedVideos.set(videoOwner, newVnum);
                }
            })
        }
        return sharedVideos;
    }

    static async admiringVideos(userIdentifier, sharedVideos) {

        const admiringsIdentifiers = await Utils.loadAdmiringIdentifier(userIdentifier)

        for(let i in admiringsIdentifiers) {
            let videoOwner = admiringsIdentifiers[i];
            sharedVideos = await Utils.loadRecentVideos(videoOwner, sharedVideos);
        }
    
        return sharedVideos
    }

    static async loadThumbnail(userIdentifier) {
        var videos = []
        console.log('runn');
        const sharedVideos = await Utils.sharedVideos(userIdentifier)
        

        const admiringVideos = await Utils.admiringVideos(userIdentifier, sharedVideos)
        
        videos = Array.from(admiringVideos)

        videos.map(arr => {
            let videoData = admiringVideos.get(arr[0])
            arr[1] = {}
            videoData.forEach((value, key) => {
                arr[1][key] = value;
                arr[1][key].sharedBy = [...arr[1][key].sharedBy]
            })
            return arr;
        })
        

        return videos;
    }
    
    static async likeVideo(userIdentifier, videoOwner, videoNumber) {
        
        const userRef = admin.database().ref().child("USER").child(videoOwner)
        const likeDislike = userRef.child('likedislike').child(String(videoNumber)).child('likedby')
        likeDislike.push({"id": userIdentifier})
    
        const likeRef = userRef.child('videolist').child(String(videoNumber))
        const snapshot = await likeRef.once('value')
        var likes = Number(snapshot.toJSON().likes)
        if (likes == undefined) {
            likes = "0"
        }
        likeRef.update({"likes": String(likes + 1)})
    }
    
    static async deleteVideoLike(userIdentifier, videoOwner, videoNumber) {
        const userRef = admin.database().ref().child("USER").child(videoOwner)
        const likeDislike = userRef.child('likedislike').child(String(videoNumber)).child('likedby').orderByChild('id').equalTo(userIdentifier)
        const likeDislikeSnapshot = await likeDislike.once('child_added')
        likeDislikeSnapshot.ref.remove()
    
        const likeRef = userRef.child('videolist').child(String(videoNumber))
        const snapshot = await likeRef.once('value')
        var likes = Number(snapshot.toJSON().likes)
        if (likes == undefined) {
            likes = "1"
        }
        likeRef.update({"likes": String(likes - 1)})
    }
    
    static async dislikeVideo(userIdentifier, videoOwner, videoNumber) {
        
        const userRef = admin.database().ref().child("USER").child(videoOwner)
        const likeDislike = userRef.child('likedislike').child(String(videoNumber)).child('dislikedby')
        likeDislike.push({"id": userIdentifier})
    
        const dislikeRef = userRef.child('videolist').child(String(videoNumber))
        const snapshot = await dislikeRef.once('value')
        var dislikes = Number(snapshot.toJSON().dislikes)
        if (dislikes == undefined) {
            dislikes = "0"
        }
        dislikeRef.update({"dislikes": String(dislikes + 1)})
    }
    
    static async deleteVideoDislike(userIdentifier, videoOwner, videoNumber) {
        
        const userRef = admin.database().ref().child("USER").child(videoOwner)
        const likeDislike = userRef.child('likedislike').child(String(videoNumber)).child('dislikedby').orderByChild('id').equalTo(userIdentifier)
        const likeDislikeSnapshot = await likeDislike.once('child_added')
        likeDislikeSnapshot.ref.remove()
    
        const dislikeRef = userRef.child('videolist').child(String(videoNumber))
        const snapshot = await dislikeRef.once('value')
        var dislikes = Number(snapshot.toJSON().dislikes)
        if (dislikes == undefined) {
            dislikes = "1"
        }
        dislikeRef.update({"dislikes": String(dislikes - 1)})
    }
    
    static async likesVideo(userIdentifier, videoOwner, videoNumber) {
        const ref = admin.database().ref().child('USER').child(videoOwner).child("likedislike").child(String(videoNumber)).child('likedby')
        if (ref.exists == false) {
            return false
        }
        const snapshot = await ref.once('value')
        const values = snapshot.toJSON()
    
        for (var childSnapshot in values) {
            
            if (values[childSnapshot].id) {
                return true
            }
        }
        return false
    
    }
    
    static async dislikesVideo(userIdentifier, videoOwner, videoNumber) {
        const ref = admin.database().ref().child('USER').child(videoOwner).child("likedislike").child(String(videoNumber)).child('dislikedby')
        if (ref.exists == false) {
            return false
        }
        const snapshot = await ref.once('value')
        const values = snapshot.toJSON()
    
        for (var childSnapshot in values) {
            
            if (values[childSnapshot].id) {
                return true
            }
        }
        return false
    
    }

    static async usersFromName(name, identifier) {
        var users = []
        const ref = admin.database().ref('USER').orderByChild('name').startAt(name).endAt(name + '\uf8ff')
        
        const snapshot = await ref.once('value')
        
        snapshot.forEach(childSnapshot => {
            var user = childSnapshot.toJSON()
            user.id = childSnapshot.key
            if (user.id !== identifier) {
                users.push(user)
            }
            
        })
        return users
    }

    static async admire(userIdentifier, admireIdentifier) {
        const globalUserRef = admin.database().ref('USER')
        const userRef = globalUserRef.child(userIdentifier).child('admiring')
        const snapshot = await userRef.once('value')
        userRef.child(String(snapshot.numChildren())).set({'id': admireIdentifier})

        const admireRef = globalUserRef.child(admireIdentifier)
        const admireSnapshot = await admireRef.once('value')
        var admireCount = admireSnapshot.toJSON().admirerscount
        if (admireCount == undefined) {
            admireCount = '0'
        }
        admireRef.update({'admirerscount': String(Number(admireCount) + 1)})

        const admiringRef = admireRef.child('admirers')
        const admiringSnapshot = await admiringRef.once('value')
        admiringRef.child(String(admiringSnapshot.numChildren())).set({'id': userIdentifier})
    }

    static async removeAdmire(userIdentifier, admireIdentifier) {
        const ref = admin.database().ref().child("USER")
        const admiringRef = ref.child(userIdentifier).child("admiring").orderByChild('id').equalTo(admireIdentifier)
        const admiringSnapshot = await admiringRef.once('child_added')
        if (admiringSnapshot.exists) {
            admiringSnapshot.ref.remove()
        }
    
        const admirersRef = ref.child(admireIdentifier).child("admirers").orderByChild('id').equalTo(userIdentifier)
        const admirersSnapshot = await admirersRef.once('child_added')
        if (admirersSnapshot.exists) {
            admirersSnapshot.ref.remove()
        }

        const admiringCountRef = ref.child(admireIdentifier)
        const countSnapshot = await admiringCountRef.once('value')
        var count = Number(countSnapshot.toJSON().admirerscount)
        if (count == undefined) {
            count = "0"
        }
        admiringCountRef.update({"admirerscount": String(count - 1)})
    }

    static async videosFromName(title, currentUser) {
        const name = title.toLowerCase()
        var videos = []
        const snapshot = await admin.database().ref('USER').once('value')
        snapshot.forEach(snapshot => {
            const videolist = snapshot.toJSON().videolist
            if (videolist != undefined) {
                for (var element in videolist) {
                    const video = videolist[element]

                    if (video !== undefined && video.title != undefined) {
                        const title = video.title.toLowerCase()
                        if (title.startsWith(name) && video.id !== currentUser) {
                            videos.push(video)
                        }   
                    }
                }
                
            }
            
        })
        //.orderByChild('videolist').startAt(name).endAt(name + '\uf8ff')
        
    
        return videos
    }

    static async updateWatchedVideos(userIdentifier, videoOwner, videoNumber) {
        const ref = admin.database().ref('USER')
        const userRef = ref.child(userIdentifier)
        const vidRef = ref.child(videoOwner).child('videolist').child(videoNumber)
        const watchRef = userRef.child('watchedVideo')
        
        // update views on video....
        const vidSnap = await vidRef.once('value')

        if(vidSnap == null) {
            return 'Something went wrong'
        }
        let views = Number(vidSnap.toJSON().view)
        vidRef.update({'view': String(views + 1)})

        
        // update watched video for user...
        const watchSnap = await watchRef.once('value')

        // if watchedVideo exist in user ref....
        if(watchSnap.exists()) {
            const vid = watchRef.child(videoOwner)
            const vidOwnerSnap = await vid.once('value')

            // if videoOwner exist in watchedVideo... 
            if(vidOwnerSnap.exists()) {
                const vidnum = vid.child(videoNumber)
                const vidnumSnap = await vidnum.once('value')

                // if videoNumber exist in videoOwner in watchedVideo...
                if(vidnumSnap.exists()) {
                    let currCount = Number(vidnumSnap.toJSON().watchCount)
                    vidnum.update({'watchCount': String(currCount + 1)})
                } else {
                    vid.child(videoNumber).set({
                        "watchCount": "1"
                    })
                }
            } else {
                watchRef.child(videoOwner + '/' + videoNumber).set({
                    "watchCount": "1"
                })
            }
        } else {
            userRef.child('watchedVideo/' + videoOwner + '/' + videoNumber).set({
                "watchCount": "1"
            })
        }
        return 'success'
    }


// fetch all videos available.........
    static async videos(currentUser) {
        var videos = []

        const ref = admin.database().ref("USER");
        const snapshots = await ref.once('value');

        snapshots.forEach(snap => {
            let videolist = snap.val().videolist;
            if(videolist != undefined) {
                videolist.forEach(video => {
                    videos.push(video)
                })
            }
        })

        // stores video owner id...
        // const identifierVideosId = []

        // // stores data as {videoOwnerId: [videoNumber]}..
        // const identifierVideosNumber = []

        // const watchedVideo = []

        // const watchedVideosSnapshot = await admin.database().ref('USER').child(currentUser).child('watchedVideo').once('value')
        // if(watchedVideosSnapshot.exists()) {
        //     watchedVideosSnapshot.forEach(snap => {
        //         var id = snap.key
        //         identifierVideosId.push(id);
        //         const vnumArr = []
        //         let data = snap.val()
        //         for(let idx in data) {
        //             vnumArr.push(idx)
        //         }
        //         identifierVideosNumber.push({
        //             [id]: vnumArr
        //         })
        //         // console.log('t1:', identifierVideosId);
        //         // console.log('t2:', identifierVideosNumber);
        //     })
        // }

        // const snapshot = await admin.database().ref('USER').once('value')
        // snapshot.forEach(snapshot => {
        //     const videolist = snapshot.toJSON().videolist
        //     if (videolist != undefined) {
        //         for (var element in videolist) {
        //             const video = videolist[element]
        //             const videoId = video.id
        //             const videoNumber = element

        //             if (video !== undefined && video.title != undefined && videoId !== currentUser) {
        //                 if(identifierVideosId.includes(videoId)) {
        //                     let i = identifierVideosId.indexOf(videoId)
        //                     if(!identifierVideosNumber[i][videoId].includes(videoNumber)) {
        //                         videos.push(video)
        //                     }
        //                     else {
        //                         watchedVideo.push(video)
        //                     }
        //                 } else {
        //                     videos.push(video)
        //                 }
        //             }
        //         }
                
        //     }
            
        // })
        // watchedVideo.forEach(video => {
        //     videos.push(video)
        // })
        return videos
    }

    static async login(id, type, name, photourl) {
        const ref = admin.database().ref('USER').child(id)
        const snapshot = await ref.once('value')
        if (snapshot.exists() && snapshot.hasChildren()) {
            return await Utils.updateUser(id, type)
        } else {
            Utils.createUser(id, type, name, photourl)
        }
    }

    static async createUser(id, type, name, photourl) {

        const ref = admin.database().ref('USER').child(id)
        ref.set({
            'admirerscount': '0',
            'followerscount': '0',
            'id': id,
            'name': name,
            'username': name.split(' ').join('').toLowerCase(),
            'phonenumber': '',
            'photourl': photourl,
            'sharescount': '0',
            'type': type
          })
      
          const secondRef = admin.database().ref('ALLUSER')
          const snapshot = await secondRef.once('value')
          const number = String(snapshot.numChildren())
          secondRef.child(number).set({
            'id': id,
            'name': name,
            'phonenumber': '',
            'photo': photourl
          })
          const smallRef = admin.database().ref('SMALL-USER')
          smallRef.child(id).set({
            'name': name,
            'photourl': photourl,
            'username': name.split(' ').join('').toLowerCase()
          })

        //   var email = 
        //   sendLoginSuccessEmail(email, name);
          
    }

    static async updateUser(id, type) {
        const ref = admin.database().ref('USER').child(id)
        const snapshot = await ref.once('value')
        const object = snapshot.toJSON()
        return (object.type == type)
    }

    // update db with user who shared video and increment share count....

    static async shareVideo(userIdentifier, videoOwnerIdentifier, videoNumber, caption, commentIdentifier) {
        let user = await admin.database().ref().child(`USER/${userIdentifier}`).once('value')
        const username = user.val().username
        const ownerRef = admin.database().ref('USER').child(videoOwnerIdentifier)
        const sharedByRef = ownerRef.child('sharedby').child(videoNumber).child(commentIdentifier)
        sharedByRef.set(userIdentifier)

        const commentsRef = ownerRef.child('comments').child(videoNumber)
        
        commentsRef.push({
            'comments': caption,
            'dislikes': '0',
            'id': userIdentifier,
            'likes': '0',
            'username': username
        })

        const sharesCountRef = ownerRef.child('videolist').child(videoNumber)
        const countSnapshot = await sharesCountRef.once('value')
        const sharesCount = Number(countSnapshot.toJSON().shares)
        sharesCountRef.update({'shares': String(sharesCount + 1)})

        const userRef = admin.database().ref('USER').child(userIdentifier).child('sharedvideos')
        const userSnapshot = await userRef.once('value')
        userRef.child(String(userSnapshot.numChildren())).set({'videoOwner': videoOwnerIdentifier, 'vnum': videoNumber})
    }

    static async replyToComment(userIdentifier, videoOwnerIdentifier, videoNumber, commentIdentifier, caption) {
        const ref = admin.database().ref('USER').child(videoOwnerIdentifier).child('comments').child(videoNumber).child(commentIdentifier).child('subcomments')
        ref.push({
            'comments': caption,
            'id': userIdentifier,
            'dislikes': '0',
            'likes': '0'
        })

        const comment = await admin.database().ref('USER').child(videoOwnerIdentifier).child('comments').child(videoNumber).child(commentIdentifier).once('value')
        postSilentNotification(comment.toJSON().id, 'New reply', comment.toJSON().comments)
        sendNotification('New reply', comment.toJSON().comments, comment.toJSON().id)
    }

    static async likeComment(userIdentifier, videoOwner, videoNumber, commentIdentifier) {
        
        const ref = admin.database().ref('USER').child(videoOwner).child('comments').child(videoNumber).child(commentIdentifier)
        const likeDislike = ref.child('likedby')
        likeDislike.push().set({"id": userIdentifier})
    
        //const likeRef = userRef.child('videolist').child(String(videoNumber))
        const snapshot = await ref.once('value')
        var likes = Number(snapshot.toJSON().likes)
        if (likes == undefined) {
            likes = "0"
        }
        ref.update({"likes": String(likes + 1)})

        const uid = snapshot.toJSON().id
        const comments = snapshot.toJSON().comments
        postSilentNotification(uid, 'Captions like', comments)
        sendNotification('Captions like', comments, uid)
    }
    
    static async deleteCommentLike(userIdentifier, videoOwner, videoNumber, commentIdentifier) {
        
        const ref = admin.database().ref('USER').child(videoOwner).child('comments').child(videoNumber).child(commentIdentifier)
        const likeDislike = ref.child('likedby').orderByChild('id').equalTo(userIdentifier)
        const likeDislikeSnapshot = await likeDislike.once('child_added')
        likeDislikeSnapshot.ref.remove()
    
        const snapshot = await ref.once('value')
        var likes = Number(snapshot.toJSON().likes)
        if (likes == undefined) {
            likes = "1"
        }
        ref.update({"likes": String(likes - 1)})
    }
    //Delete video
    static async deleteVideo(videoOwner, videoNumber) {
        const ref = admin.database().ref('USER').child(videoOwner).child('videolist').child(videoNumber)
        const snapshot = await ref.once('value')

        const videoUrl = snapshot.toJSON().url
        let mainUrl = videoUrl.slice(81)

        let index = mainUrl.indexOf("%2F")
        var userIdentifier = mainUrl.substring(0, index) 

        var index1 = mainUrl.indexOf("?")
        var videoFileName = mainUrl.substring(index + 3, index1)

        const storageItem = admin.storage().bucket().file('Videos/' + userIdentifier + '/' + videoFileName)
       
        await storageItem.delete()
        console.log('deletedVideo from Storage')
        ref.remove()
        console.log('deleted reference')
    }

    static async dislikeComment(userIdentifier, videoOwner, videoNumber, commentIdentifier) {
        
        const ref = admin.database().ref('USER').child(videoOwner).child('comments').child(videoNumber).child(commentIdentifier)
        const likeDislike = ref.child('dislikedby')
        likeDislike.push().set({"id": userIdentifier})
    
        const snapshot = await ref.once('value')
        var dislikes = Number(snapshot.toJSON().dislikes)
        if (dislikes == undefined) {
            dislikes = "0"
        }
        ref.update({"dislikes": String(dislikes + 1)})
    }
    
    static async deleteCommentDislike(userIdentifier, videoOwner, videoNumber, commentIdentifier) {
        
        const ref = admin.database().ref('USER').child(videoOwner).child('comments').child(videoNumber).child(commentIdentifier)
        const likeDislike = ref.child('dislikedby').orderByChild('id').equalTo(userIdentifier)
        const likeDislikeSnapshot = await likeDislike.once('child_added')
        likeDislikeSnapshot.ref.remove()
    
        const snapshot = await ref.once('value')
        var dislikes = Number(snapshot.toJSON().dislikes)
        if (dislikes == undefined) {
            dislikes = "1"
        }
        ref.update({"dislikes": String(dislikes - 1)})
    }
    
    static async likesComment(userIdentifier, videoOwner, videoNumber, commentIdentifier) {
        const ref = admin.database().ref('USER').child(videoOwner).child('comments').child(videoNumber).child(commentIdentifier).child('likedby')
        if (ref.exists == false) {
            return false
        }
        const snapshot = await ref.once('value')
        const values = snapshot.val()

        for (var index in values) {
            const child = values[index]

            if (child.id == userIdentifier) {
                return true
            }
        }
        return false
    
    }
    
    static async dislikesComment(userIdentifier, videoOwner, videoNumber, commentIdentifier) {
        const ref = admin.database().ref('USER').child(videoOwner).child('comments').child(videoNumber).child(commentIdentifier).child('dislikedby')
        if (ref.exists == false) {
            return false
        }
        const snapshot = await ref.once('value')
        const values = snapshot.val()
    
        for (var index in values) {
            const child = values[index]

            if (child.id == userIdentifier) {
                return true
            }
        }
        return false
    
    }

    static async loadVideoComments(videoOwner, videoNumber) {
        const ref = admin.database().ref('USER').child(videoOwner).child('comments').child(videoNumber)
        const snapshot = await ref.once('value')
        var comments = []
        snapshot.forEach(child => {
            var comment = child.toJSON()
            // console.log(comment);
            comment.commentID = child.key

            comments.push(comment)
        })
        return comments
    }


static async updateImage(req) {

    const BusBoy = require("busboy");
    const path = require("path");
    const os = require("os");
    const fs = require("fs");
/*

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    var saveTo = path.join('.', filename);
    console.log('Uploading: ' + saveTo);
    file.pipe(fs.createWriteStream(saveTo));
  });*/

    var busboy = new BusBoy({ headers: req.headers });

    let imageToBeUploaded = {};
    let imageFileName;
  
    //let uid = req.user.uid;
    let uid = 'Cx7ujWk8odhOvoKgbDjfKp1utdH3';
    let generatedToken = Math.random().toString(36).substring(7);


    busboy.on("file", function(fieldname, file, filename, encoding, mimetype) {

        console.log(fieldname, file, filename, encoding, mimetype);

        if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
            return "Wrong file type submitted";
        }
    
        
        const imageExtension = filename.split(".")[filename.split(".").length - 1];  
        console.log("Image Extension "+imageExtension)
   
        imageFileName = `${uid}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFileName)
    
        imageToBeUploaded = { filepath, mimetype };
        file.pipe(fs.createWriteStream(filepath));
    });

    busboy.on("finish", () => {

        admin
        .storage()
        .bucket()
        .upload(imageToBeUploaded.filepath, {
            resumable: false,
            destination: 'profileImages/' + imageFileName,
            metadata:{
                metadata: {
                    contentType: imageToBeUploaded.mimetype,
                    firebaseStorageDownloadTokens: generatedToken,
                    },
            },
        })
        .then(async () => {
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/theatronfinal.appspot.com/o/profileImages%2F${imageFileName}?alt=media&token=${generatedToken}`;

            //Change url
            admin.database().ref('USER').child(uid).update({'photourl': imageUrl})

            const smallUser = admin.database().ref().child("SMALL-USER").child(req.user.uid)
            smallUser.update({'photourl': imageUrl})
            console.log(req.user.uid)
            const generalQuery = admin.database().ref().child('ALLUSER').orderByChild('id').equalTo(req.user.uid)
            const key = (await generalQuery.once('child_added')).key
  
            const generalRef = admin.database().ref().child('ALLUSER').child(key)
            generalRef.update({'photo': imageUrl})

            return imageUrl
        })
        .catch((err) => {
            console.log(err)
            return "something went wrong";
        });
    });
    busboy.end(req.rawBody);

}

static async pendingVideo() {
    const ref = admin.database().ref('PENDING_VIDEOS')
    const snapshot = await ref.once('value')
    var video = []
    snapshot.forEach(child => {
        var item = child

        child.forEach(snap => {
            const value = snap.toJSON()
            value.vid = snap.key
            value.complexVid = child.key + "-" + snap.key
            video.push(value)
        })
        
    })

    return video
}


    // static async uploadThumbnail(userIdentifier, headers) {

    //     const busboy = new Busboy({headers: headers})

    //     let thumbnail = {}
    //     let thumbnailFileName

    //     let uid = userIdentifier
    //     let generatedToken = Math.random().toString(36).substring(7)

    //     busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    //         console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
            
    //         if(mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
    //             return "Wrong file type submitted"
    //         }

    //         const thumbnailExtension = filename.split(".")[filename.split(".").length - 1]
    //         thumbnailFileName = `${uid}.${thumbnailExtension}`
    //         const filePath = path.join(os.tmpdir(), thumbnailFileName)

    //         thumbnail = {filePath, mimetype}
    //         file.pipe(fs.createWriteStream(filePath))
    //     });

    //     busboy.on("finish", () => {
    //         admin.storage().bucket()
    //         .upload(thumbnail.filePath, {
    //             resumable: false,
    //             destination: 'thumbnails/' + thumbnailFileName,
    //             metadata: {
    //                 contentType: thumbnail.mimetype,
    //                 firebaseStorageDownloadTokens: generatedToken
    //             }
    //         })
    //         .then(async () => {
    //             const imageUrl = `https://firebasestorage.googleapis.com/v0/b/theatronfinal.appspot.com/o/thumbanails%2F${thumbnailFileName}?alt=media&token=${generatedToken}`
    //         })
    //         .catch(err => {
    //             console.log(err);
    //         })
    //     })

    //     return imageUrl
    // }


    //======Delete friend request by user===================

    static async deleteFriendRequest(userId, friendId) {
        
        // delete request from user data...
        const userRef = admin.database().ref(`USER/${userId}/friendrns`).orderByChild('id').equalTo(friendId)
        const userSnap = await userRef.once('value')
        console.log(userSnap.val());
        userSnap.ref.remove();

        // delete request from friend data...
        const friendRef = admin.database().ref(`USER/${friendId}/friendrns`).orderByChild('id').equalTo(userId)
        const friendSnap = await friendRef.once('value')
        friendSnap.ref.remove();

    }
    

}



module.exports = { Utils }
