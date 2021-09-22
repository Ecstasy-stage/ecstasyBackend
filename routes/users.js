var admin = require("firebase-admin");
const firebase = require('../middleware/firebase_admin');

const express = require('express');
const router = new express.Router();

const { fork } = require('child_process')

const auth = require('../middleware/auth');
const { Utils } = require('../middleware/utils')
const { sendNotification, postSilentNotification } = require('../middleware/notifications');
const {sendFeedbackEmail, sendReportEmail, sendLoginSuccessEmail, sendFriendRequestEmail} = require("./../middleware/sendEmail");

const Busboy = require('busboy');

const { MRSUploadData } = require("../config/modules");

const { parsePhoneNumber } = require('libphonenumber-js')

require('dotenv').config({ path: __dirname + '/config/.env' });



router.use(
  express.urlencoded({
    extended: true
  })
)

router.use(express.json());

//Routes

//service_id route
router.post('/resend-otp' ,async(req , res) =>{


  const phoneNumber = req.body.phonenumber;

  console.log(process.env.TWILIO_ACCOUNT_SID)
  console.log(process.env.TWILIO_AUTH_TOKEN)

  //const accountSid = env.TWILIO_ACCOUNT_SID;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  //const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = require('twilio')(accountSid, authToken);

  var sid;
  
  await  client.verify.services.create({friendlyName: 'Ecstasy'})
                        .then(service => 
                            sid = service.sid )
                        .catch(err =>{
                          console.log(err)
                          if(err.status !=200){
                            res.json({'status' : "Error in creating Service_id" , 'service_id' : null})
                          }
                        });

  client.verify.services(sid)
             .verifications
             .create({to: phoneNumber, channel: 'sms'})
             .then(verification => 

              res.status(200).json({'service_id' : verification.serviceSid , 'status' : verification.status })
              
              ).catch(err =>{
                if(err.status !=200){
                  res.status(400).json({'status' : "Error in sending Otp" , 'service_id' :null})
                }
          
              });


});


// get otp for verfication...
router.post('/get-otp' , async (req , res)  => {

    //   get phonenumber from body...
    const phone  = req.body.phonenumber;
 
    // get twilio auth.....
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    // create twilio client...
    const client = require('twilio')(accountSid, authToken);

    // service sid for verfication...
    var sid;
  
    // create service sid....
    await client.verify.services.create({friendlyName: 'Ecstasy'})
        .then( service => {
            sid = service.sid;
        })
        .catch(err => {
            console.error(err);
            if(err.status != 200) {
                res.json({
                    "service_id": null,
                    "status": "Error in creating service_id"
                })
            }
        })

    // send otp to user...
    client.verify.services(sid)
    .verifications.create({
        to: phone,
        channel: 'sms'
    })
    .then( verification => {
        res.status(200).json({
            'service_id': verification.serviceSid,
            'status': verification.status
        })
    })
    .catch( err => {
        if(err.status != 200) {
            res.status(400).json({
                "service_id": null,
                "status": "Error in sending OTP"
            })
        }
    })

})


router.post('/otp-verify' , async(req , res) =>{

    // get information from body...
    const sid = req.body.sid;
    const otp_code = req.body.otp;
    const phoneNumber = req.body.phonenumber;
  
    // create twilio client....
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);
  
    // verfiy otp....
    await client.verify.services(sid)
        .verificationChecks
        .create({
            to: phoneNumber, 
            code: otp_code
        })
        .then( verification_check => {
            res.status(200).json({
                "status":verification_check.status
            })
        })
        .catch( err => {
            console.log(err)
            if(err.status != 200) {
                res.status(400).json({
                    'status' : "Error"
                })
            }
       });

});



//Profile route
router.post('/login', auth, async(req, res) => {

  const userID = req.user.uid
  const name = req.headers.name
  const type = req.headers.type
  var photourl = req.headers.photourl

  if (photourl == undefined) {
    photourl = ''
  }

  if ((name != undefined && type != undefined && (type == 'artist' || type == 'audience')) == false) {
    res.send('error')
  }

  const value = await Utils.login(userID, type, name, photourl)
  console.log(value)

  if (value == false) {
    const newType = (type == 'artist') ? 'audience' : 'artist'
    res.status(403).send(`Sorry, you are not able to login as ${type}. Please, switch to ${newType}`)
  } else {
    res.send('success')
  }

})

router.post('/profile/user-from-id', auth, (req, res) => {

  const id = req.headers.id
  if (id == undefined) {
    res.send('error')
    return
  }

  Utils.loadUser(id).then(user => res.send(user))

})

router.post('/profile', auth ,  async (req,res)=>{
  //Getting the profile with the uid
  const user = req.user
  
  Utils.loadUser(user.uid).then(user => { res.send(user) })
});


router.post('/profile/edit', auth, async (req, res) => {
    const headers = req.headers
    const name = headers.name
    const username = headers.username
    const biography = headers.bio
    const number = headers.number
    const website = headers.web
    
    const ref = admin.database().ref().child("USER").child(req.user.uid)
    const generalQuery = admin.database().ref().child('ALLUSER').orderByChild('id').equalTo(req.user.uid)
    const key = (await generalQuery.once('child_added')).key
    
    const generalRef = admin.database().ref().child('ALLUSER').child(key)

    if (name !== undefined) {
        ref.update({"name": name})
        generalRef.update({"name": name})
    }
    if (username !== undefined) {
        ref.update({"username": username})
    }
    if (biography !== undefined) {
        ref.update({"bio": biography})
    }
    if (website !== undefined) {
        ref.update({"web": website})
    }

    if (number !== undefined) {
        if (number !== '') {
            //   const result = await Utils.userFromUniversalNumber(number, req.user.uid)
            let result = await Utils.validateNumber(number, req.user.uid)
            console.log("number not exists: ", result)
            // if (result.length > 0) {
            //   res.send('Sorry, this phonenumber is already in use')
            //   return
            // }

            if(!result) {
                res.send('Sorry, this phone number is already in use')
            }

            try {
                const newNumber = parsePhoneNumber(number).nationalNumber
                ref.update({"phonenumber": newNumber})
                generalRef.update({"phonenumber": newNumber})
            } catch {
                // let num = number
                // if(number.length > 10) {
                //     num = number.substring(number.length - 10)
                // }
                // if (num.charAt(0) == '0') {
                //     while(num.charAt(0) == '0') {
                //         num = num.slice(1)
                //     }
                // }

                // number = num
                ref.update({"phonenumber": number})
                generalRef.update({"phonenumber": number})
            }

        } else {
            ref.update({'phonenumber': ''})
            generalRef.update({'phonenumber': ''})
        }
    }

  const smallUser = admin.database().ref().child("SMALL-USER").child(req.user.uid)
  if (name !== undefined) {
    smallUser.update({'name': name})
  }
  if (username !== undefined) {
    smallUser.update({'username': username})
  }

  res.send('success')
});

// router.post('/test', async(req, res) => {
//   setTimeout(async function() {
//     res.write('Test 1')
//   }, 1000);
//   setTimeout(async function() {
//     res.write('Test 2')
//   }, 2000);

//   setTimeout(async function() {
//     res.write('Test 3')

//     res.end()
//   }, 3000);
// })

//Load possible friends from number

router.post('/profile/can-be-friends', auth, (req, res) => {
    
    var numberString = req.body.phonenumbers

    if (numberString == undefined) {
        res.send('Error occured while fetching phone accounts')
        return 
    }
    if(numberString == '') {
        res.send('Empty contact list')
        return
    }

    var numbers = numberString.split(",")

    // removing duplicate numbers...converting into set
    numbers = Array.from(new Set(numbers))

    // parse phone number to national number if in international format else reduce to last 10 digit
    numbers = numbers.map(number => {
        try {
            return parsePhoneNumber(number).nationalNumber
        } catch (err) {
            let num = number
            // if(number.length > 10) {
            //     num = number.slice(number.length - 10)
            // }

            return num
        }
    })

    numbers = new Set(numbers);


    let identifier = req.user.uid
    
    Utils.cannotBeFriends(identifier)
    .then( identifiers => {
        Utils.usersFromNumbers(identifiers, numbers)
        .then( users => {
            // console.log(users);
            res.send(users)
        })
    })
    // console.log('ending api call...');
})

router.post('/test', auth, async (req, res) => {
    
    let js1 = {
        "name": "rahul",
        "branch": "cse"
    }
    res.write(JSON.stringify(js1));
    let js2 = {
        "name": {
            "nm": "rahul",
            "b": "css"
        },
        "cls": {
            "nm": "twr",
            "b": "ee"
        }
    }
    setTimeout(() => {
        res.write(JSON.stringify(js2));
        res.end()
        console.log('timeout');
    }, 5000)
    // res.send('all done')
    // sendFeedbackEmail("rahul", "rt945471@gmail.com", "feedback");
    // sendReportEmail("rahul", "rahull", "jfosj", "jfosej")
})


// router.post('/profile/can-be-friends', auth,(req, res) => {
//   const numbersRaw = req.headers.phonenumbers
//   if (numbersRaw == undefined) {
//     res.send('error')
//     return
//   }
  
//   const numbers = numbersRaw.trim().split(",")
// //   numbers.forEach(number => {
// //       console.log('t1: ', number);
// //   })

// //   for ( var number in numbers){

// //     const simpleNumber = numbers[number]

// //     if(simpleNumber.length == 10){
// //       numbers[number] = "+91" + simpleNumber
// //     //console.log(numbers[number])
// //     }

// //   }
  
//     const id = req.user.uid

//     Utils.cannotBeFriends(id).then(identifiers => {
//         Utils.usersFromNumbers(identifiers, numbers).then(users => { res.send(users) })
//   })
  

  
// });


//Load friends
router.post('/profile/friends', auth, (req, res) => {
  const user = req.user
  const ref = admin.database().ref().child("USER").child(user.uid).child("friends")
  ref.once('value')
    .then(snapshot => {
      var friends = snapshot.val()
      if (friends == undefined) {
        res.send([])
        return
      }

      //Extract friends' identifier
      friends = JSON.stringify(friends)
      const obj = JSON.parse(friends)
      const identifiers = []
      for(let key in obj) {
          identifiers.push(key)
      }
      //Load updated users by identifier
      Utils.loadSmallUsers(identifiers).then(users => { res.send(users) })
    })
});

//Delete friend
router.post('/profile/delete-friend', auth, (req, res) => {
  const friendIdentifier = req.headers.friend
  if (friendIdentifier == undefined) {
    res.send('error')
    return
  }

  Utils.deleteFriend(req.user.uid, friendIdentifier)
  res.send('success')

});

//Load friend requests
router.post('/profile/friend-requests', auth, async (req, res) => {
  const user = req.user
  var ref = admin.database().ref().child("USER").child(user.uid).child("friendrns")
  if (req.headers.type == "S" || req.headers.type == "R") {
    ref = ref.orderByChild('type').equalTo(req.headers.type)
  }
  const snapshot = await ref.once('value')
  const requests = snapshot
  var friends = []
  requests.forEach(request => {
    
    if (request.toJSON() !== null && friends.some(item => item.id == request.toJSON().id && request.toJSON().type == item.type) == false) {
      friends.push(request.toJSON())
    }
  })
  res.send(friends)
});

//Send friend request
router.post('/profile/be-friend', auth, (req, res) => {
  const user = req.user
  
  const friendIdentifier = req.headers.friend
  if (friendIdentifier == undefined) {
    res.send('error')
    return
  }
  Utils.sendFriendRequest(user.uid, friendIdentifier).then(friend => { res.send(friend) })
  
});

//Accept friend request
router.post('/profile/accept-friend', auth, (req, res) => {
  const friendIdentifier = req.headers.friend
  if (friendIdentifier == undefined) {
    res.send('error')
    return
  }

  Utils.acceptFriendRequest(req.user.uid, friendIdentifier).then(() => { res.send('success') })
});



//Deny friend request
router.post('/profile/deny-friend', auth, (req, res) => {
  console.log('deny friend')
  const friendIdentifier = req.headers.friend
  if (friendIdentifier == undefined) {
    res.send('error')
    return
  }
  Utils.denyFriendRequest(req.user.uid, friendIdentifier).then(() => { res.send('success') })
});


// load home feed videos.....
router.post('/profile/thumbnail', auth, (req, res) => {

    const user = req.user
    console.log('req rec');
 
    Utils.loadThumbnail(user.uid).then(videos => res.status(200).send(videos))

});

router.post('/profile/timeline', auth, (req, res) => {

  const user = req.user
  Utils.loadThumbnail(user.uid).then(videos => res.send(videos))

});

//TODO need to add auth
router.post('/profile/delete-video', auth,  (req, res)  => {
  const videoNumber = req.headers.video_number

  if (videoNumber == undefined) {
    res.send('error')
    return
  }

  Utils.deleteVideo(req.user.uid, videoNumber).then(() => res.send('success'))

  
})

// watch video i.e. increment views and update user watched video data
router.post('/profile/watch-video', auth, async (req, res) => {

  const user = req.user.uid
  const videoOwner = req.headers.video_owner
  const videoNumber = req.headers.video_number
  
  if (videoOwner == undefined || videoNumber == undefined) {
    res.send('error')
    return
  }

  const result = await Utils.updateWatchedVideos(user, videoOwner, videoNumber)

  res.send(result)
})

//Like video
router.post('/profile/like-video', auth, (req, res) => {

  const user = req.user
  const videoOwner = req.headers.video_owner
  const videoNumber = req.headers.video_number
  
  if (videoOwner == undefined || videoNumber == undefined) {
    res.send('error')
    return
  }

  Utils.likeVideo(user.uid, videoOwner, videoNumber)
  res.send('success')

});
//Remove video like
router.post('/profile/remove-video-like', auth, (req, res) => {

  const user = req.user
  const videoOwner = req.headers.video_owner
  const videoNumber = req.headers.video_number
  
  if (videoOwner == undefined || videoNumber == undefined) {
    res.send('error')
    return
  }

  Utils.deleteVideoLike(user.uid, videoOwner, videoNumber)
  res.send('success')
});

//Dislike video
router.post('/profile/dislike-video', auth, (req, res) => {

  const user = req.user
  const videoOwner = req.headers.video_owner
  const videoNumber = req.headers.video_number
  
  if (videoOwner == undefined || videoNumber == undefined) {
    res.send('error')
    return
  }

  Utils.dislikeVideo(user.uid, videoOwner, videoNumber)
  res.send('success')

});
//Remove video dislike
router.post('/profile/remove-video-dislike', auth, (req, res) => {

  const user = req.user
  const videoOwner = req.headers.video_owner
  const videoNumber = req.headers.video_number
  
  if (videoOwner == undefined || videoNumber == undefined) {
    res.send('error')
    return
  }

  Utils.deleteVideoDislike(user.uid, videoOwner, videoNumber)
  res.send('success')
});

//User likes video?
router.post('/profile/likes-video', auth, (req, res) => {
  const user = req.user
  const videoOwner = req.headers.video_owner
  const videoNumber = req.headers.video_number
  
  if (videoOwner == undefined || videoNumber == undefined) {
    res.send(false)
    return
  }
  Utils.likesVideo(user.uid, videoOwner, videoNumber).then(likes => res.send(likes))
  
});
//User dislikes video
router.post('/profile/dislikes-video', auth, (req, res) => {
  const user = req.user
  const videoOwner = req.headers.video_owner
  const videoNumber = req.headers.video_number
  
  if (videoOwner == undefined || videoNumber == undefined) {
    res.send(false)
    return
  }
  Utils.dislikesVideo(user.uid, videoOwner, videoNumber).then(likes => res.send(likes))
  
});

//Users from name
router.post('/profile/users-from-name', auth, (req, res) => {
  const text = req.headers.text
  
  if (text == undefined) {
    res.send('error')
    return
  }

  Utils.usersFromName(text, req.user.uid).then(users => res.send(users.filter(user => user.type == "artist")))
});

//Admire user
router.post('/profile/admire', auth, (req, res) => {

  const admireIdentifier = req.headers.user
  if (admireIdentifier == undefined) {
    res.send('error')
    return
  }

  Utils.admire(req.user.uid, admireIdentifier).then(() => res.send('success'))

});

//Remove admire
router.post('/profile/remove-admire', auth, (req, res) => {

  const admireIdentifier = req.headers.user
  if (admireIdentifier == undefined) {
    res.send('error')
    return
  }

  Utils.removeAdmire(req.user.uid, admireIdentifier).then(() => res.send('success'))
  
});

//Search videos by name
router.post('/profile/videos-from-name', auth, (req, res) => {
  const text = req.headers.text
  
  if (text == undefined) {
    res.send('error')
    return
  }

  Utils.videosFromName(text, req.user.uid).then(videos => res.send(videos))
})

router.post('/profile/videos-from-id', auth, (req, res) => {
  Utils.videosFromUser(req.user.uid).then(videos => res.send(videos))
})

router.post('/profile/videos-from-user', auth, (req, res) => {
  const userIdentifier = req.headers.user_identifier
  if (userIdentifier == undefined) {
    res.send('error')
    return
  }

  Utils.videosFromUser(userIdentifier).then(videos => res.send(videos))
})

//Share video with caption
router.post('/profile/share-video', auth, (req, res) => {
  const caption = req.headers.caption
  const videoOwner = req.headers.video_owner
  const videoNumber = req.headers.video_number
  const commentIdentifier = req.headers.comment_identifier
  if ((commentIdentifier !== undefined && caption !== undefined && videoOwner !== undefined && videoNumber !== undefined && caption !== '' && caption.length <= 140) == false) {
      res.send('error')
      return
  }
  Utils.shareVideo(req.user.uid, videoOwner, videoNumber, caption, commentIdentifier).then(() => res.send('success'))

})

//Load video comments
router.post('/profile/video-comments', auth, (req, res) => {
  const videoOwner = req.headers.video_owner
  const videoNumber = req.headers.video_number

  if (videoOwner == undefined || videoNumber == undefined) {
    res.send('error')
    return
  }

  Utils.loadVideoComments(videoOwner, videoNumber).then(comments => res.send(comments))
})

//Reply to comment
router.post('/profile/reply-to-comment', auth, (req, res) => {
  const caption = req.headers.caption
  const videoOwner = req.headers.video_owner
  const videoNumber = req.headers.video_number
  const commentIdentifier = req.headers.comment_identifier
  if ((caption !== undefined && videoOwner !== undefined && videoNumber !== undefined && commentIdentifier !== undefined && caption !== '' && caption.length <= 140) == false) {
      res.send('error')
      return
  }
  Utils.replyToComment(req.user.uid, videoOwner, videoNumber, commentIdentifier, caption).then(() => res.send('success'))
})

//Like comment
router.post('/profile/like-comment', auth, (req, res) => {

  const user = req.user
  const videoOwner = req.headers.video_owner
  const videoNumber = req.headers.video_number
  const commentIdentifier = req.headers.comment_identifier
  
  if (videoOwner == undefined || videoNumber == undefined || commentIdentifier == undefined) {
    res.send('error')
    return
  }

  Utils.likeComment(user.uid, videoOwner, videoNumber, commentIdentifier)
  res.send('success')

});
//Remove comment like
router.post('/profile/remove-comment-like', auth, (req, res) => {

  const user = req.user
  const videoOwner = req.headers.video_owner
  const videoNumber = req.headers.video_number
  const commentIdentifier = req.headers.comment_identifier

  if (videoOwner == undefined || videoNumber == undefined || commentIdentifier == undefined) {
    res.send('error')
    return
  }

  Utils.deleteCommentLike(user.uid, videoOwner, videoNumber, commentIdentifier)
  res.send('success')
});

//Dislike comment
router.post('/profile/dislike-comment', auth, (req, res) => {

  const user = req.user
  const videoOwner = req.headers.video_owner
  const videoNumber = req.headers.video_number
  const commentIdentifier = req.headers.comment_identifier

  if (videoOwner == undefined || videoNumber == undefined || commentIdentifier == undefined) {
    res.send('error')
    return
  }

  Utils.dislikeComment(user.uid, videoOwner, videoNumber, commentIdentifier)
  res.send('success')

});
//Remove comment dislike
router.post('/profile/remove-comment-dislike', auth, (req, res) => {

  const user = req.user
  const videoOwner = req.headers.video_owner
  const videoNumber = req.headers.video_number
  const commentIdentifier = req.headers.comment_identifier
  
  if (videoOwner == undefined || videoNumber == undefined || commentIdentifier == undefined) {
    res.send('error')
    return
  }

  Utils.deleteCommentDislike(user.uid, videoOwner, videoNumber, commentIdentifier)
  res.send('success')
});

//User likes comment?
router.post('/profile/likes-comment', auth, (req, res) => {
  const user = req.user
  const videoOwner = req.headers.video_owner
  const videoNumber = req.headers.video_number
  const commentIdentifier = req.headers.comment_identifier
  
  if (videoOwner == undefined || videoNumber == undefined || commentIdentifier == undefined) {
    res.send('error')
    return
  }

  Utils.likesComment(user.uid, videoOwner, videoNumber, commentIdentifier).then(likes => res.send(likes))
  
});
//User dislikes comment
router.post('/profile/dislikes-comment', auth, (req, res) => {
  const user = req.user
  const videoOwner = req.headers.video_owner
  const videoNumber = req.headers.video_number
  const commentIdentifier = req.headers.comment_identifier
  
  if (videoOwner == undefined || videoNumber == undefined || commentIdentifier == undefined) {
    res.send('error')
    return
  }

  Utils.dislikesComment(user.uid, videoOwner, videoNumber, commentIdentifier).then(likes => res.send(likes))
  
});

//Video Uploading route

// var videoFile, title, desc, filepath
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, './public/uploads')
//     },
//     filename: (req, file, cb) => {
//         // console.log('file is: ', file);
//         videoFile = file
//         title = req.body.title
//         desc = req.body.desc
//         // console.log('title is: ', req.body.title); 
//         // console.log('desc is: ', req.body.desc);
//         let org = file.originalname.replace(" ", "")
//         filepath = './public/uploads/' + Date.now() + org
//         // console.log('org name: ', org);
//         cb(null, Date.now() + org)
//     }
// })
// const fileFilter = (req, file, cb) => {
//     if (file.mimetype == 'video/mp4') {
//         cb(null, true)
//     } else {
//         cb(null, false)
//     }
// }
// const upload = multer({storage: storage, fileFilter: fileFilter})

router.post('/profile/upload', auth, async (req,res)=>{
    
    const id = req.user.uid
    const userName = req.user.displayName
    const title = req.headers.title
    const desc = req.headers.desc
    const videoUrl = req.headers.videourl
    
    await MRSUploadData(videoUrl, id, userName, title, desc, res)


    // compressAndUploadVideo(videoFile, res, id, filepath)
    // .then( async url => {

    //     // upload to MRSUploadData...
    //     await MRSUploadData(url,id,userName,title,desc);

    //     // remove file form disk storage after uploading...
    //     await unlinkAsync(filepath)
    // })
    // await res.status(201).send('File Uploaded');

//     console.log('req.headers.files is: ', req.headers);
//   console.log('uploading begin..')
//   try {
//     console.log('inside try...')
//     var userName = req.user.displayName;
//     console.log('userName found: ', userName);
    
//     const id = req.user.uid;
//     console.log('id found: ', id);
    
//     if (userName == undefined) {
//       userName = ""
//     }
    
//     const Busboy = require('busboy');
//     const busboy = new Busboy({headers: req.headers});
//     console.log('after busboy initiation...')
//     var title,desc,url;
    
//     busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
//         console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype)
//       file.on('data', function(data) {
//         console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
//       })
//       console.log('file found: ', file)
//       url = await compressAndUploadVideo(file,res);
//       console.log('url found: ', url);
//     });
//     //title = 'Undefined'
//     //desc = 'Undefined'
//     //url = 'undefined'
//     busboy.on('field',async (fieldname,value)=>{
//       console.log(fieldname)
//       if(fieldname==='title'){
//         title = value;
//       }else{
//         desc = value;
//       }
      
//     });

    
//     busboy.on('finish', async () => {
//       await MRSUploadData(url,id,userName,title,desc);
//       await res.status(201).send('File Uploaded');
//     });
//     console.log('busboy finishing...');

//     //busboy.end(req.rawBody);
//     //console.log('success');
//     req.pipe(busboy)

// }catch(e){
//   console.log('error updating video', e);
// }
 
});




//Apply auth 

router.post('/profile/picture', auth , async (req, res, next) => {

  var path = require("path");
  var os = require("os");
  var fs = require("fs");

  let imageToBeUploaded = {};
  let imageFileName;

  let uid = req.user.uid;
  let generatedToken = Math.random().toString(36).substring(7);


  var busboy = new Busboy({ headers: req.headers });

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    
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


  busboy.on('finish', function() {
    console.log(imageToBeUploaded.filepath)

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
            firebase.admin.database().ref('USER').child(req.user.uid).update({'photourl': imageUrl})

            const smallUser = firebase.admin.database().ref().child("SMALL-USER").child(req.user.uid)
            smallUser.update({'photourl': imageUrl})
            console.log(req.user.uid)
            const generalQuery = firebase.admin.database().ref().child('ALLUSER').orderByChild('id').equalTo(req.user.uid)
            const key = (await generalQuery.once('child_added')).key
  
            const generalRef = admin.database().ref().child('ALLUSER').child(key)
            generalRef.update({'photo': imageUrl})

            res.status(200).end(imageUrl);
        })
        .catch((err) => {
            console.log(err)
            res.status(400).end(imageUrl);
        });

   
  });
  return req.pipe(busboy);

})

router.post('/profile/notifications', auth, async (req, res) => {
  const ref = admin.database().ref().child('USER').child(req.user.uid).child('notifications')
  const snapshot = await ref.once('value')
  const object = snapshot.toJSON()
  var array = Array()
  for (element in object) {
    var element = object[element]
    array.push(element)
  }

  res.send(array.reverse())
})



//MRS
router.post('/push/to/videos', auth, async (req,res) => {
    const id = req.user.uid;
    const newIdentifier = req.headers.newidentifier
    
    var refer = admin.database().ref('PENDING_VIDEOS').child(id).child(newIdentifier);
  
    await refer.once('value').then((snapshot)=> {
      var data = snapshot.val();
      data.status = 'approved';
      const newRef = admin.database().ref('USER').child(id).child('videolist')
      newRef.once('value').then(newSnapshot => {
        const numChildren = String(newSnapshot.numChildren())
        const ref = newRef.child(numChildren)
        ref.set(data);
        ref.update({'vnum': numChildren})
      })

      
      
    });

    refer.remove();
    postSilentNotification(id, 'Video', 'Your video has been approved')
    sendNotification('Video', 'Your video has been approved', id)
    res.send('success')
});

// fetch all videos available except which the user have already seen....
router.post('/profile/all-video', auth, async(req, res) => {
    console.log('req received...');
    Utils.videos(req.user.uid)
    .then( videos => {
        res.send(videos)
    })
})

router.post('/mrs/deny-video', auth, async (req, res) => {
  const id = req.user.uid
  const newIdentifier = req.headers.newidentifier
  const refer = admin.database().ref('PENDING_VIDEOS').child(id).child(newIdentifier)
  //const snapshot = await refer.once('value')
  refer.remove()
  postSilentNotification(id, 'Video', 'Your video has not been approved')
  sendNotification('Video', 'Your video has not been approved', id)
  res.send('success')
})

// router.post('/mrs/pending-video', async (req, res) => {
//   const id = req.user.uid
//   const refer = admin.database().ref('PENDING_VIDEOS').child(id)
//   const snapshot = await refer.once('value')
//   res.send(snapshot.toJSON())
// })

router.post('/mrs/pending-video', (req, res) => {
  if (req.headers.token !== '858484') {
    res.send('error')
    return
  }

  Utils.pendingVideo().then(videos => res.send(videos))
})

//Upload Thumbnail
router.post('/profile/uploadThumbnail', auth, async(req,res, next) => {
    const path = require("path");
    const os = require("os");
    const fs = require("fs");

    const busboy = new Busboy({ headers: req.headers });

    let thumbnailToBeUploaded = {};
    let thumbnailFileName;
  
    let uid = req.user.uid;
    let generatedToken = Math.random().toString(36).substring(7);


    busboy.on("file", function(fieldname, file, filename, encoding, mimetype) {
        if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
            return "Wrong file type submitted";
        }

        const thumbnailExtension = filename.split(".")[filename.split(".").length - 1];
   
        thumbnailFileName = `${uid}.${thumbnailExtension}`;
        const filepath = path.join(os.tmpdir(), thumbnailFileName);
    
        thumbnailToBeUploaded = { filepath, mimetype };
        file.pipe(fs.createWriteStream(filepath));
    });

    busboy.on("finish", function() {
        firebase.admin
        .storage()
        .bucket()
        .upload(thumbnailToBeUploaded.filepath, {
            resumable: false,
            destination: 'thumbnails/' + thumbnailFileName,
            metadata: {
            metadata: {
                contentType: thumbnailToBeUploaded.mimetype,
                firebaseStorageDownloadTokens: generatedToken,
            },
            },
        })
        .then(async () => {
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/theatronfinal.appspot.com/o/thumbanails%2F${thumbnailFileName}?alt=media&token=${generatedToken}`;

            const v_index = req.headers.v_index

            const ref = firebase.admin.database().ref('USER').child(req.user.uid).child('videolist').child(v_index)
            ref.push({'thumbnail' : imageUrl})
            res.status(200).end(imageUrl) 
        })
        .catch((err) => {
            console.log(err)
            res.status(200).end(imageUrl) 
        });
    });
    return req.pipe(busboy)
    

})

//Feedback/Write to us function
router.post('/feedback' ,auth, async (req, res)=>{

    const userName = req.user.displayName
    const feedback = req.header("feedback");
  
    await admin.auth().getUser(req.user.uid).then((userRecord)=>{
        const email = userRecord.providerData[0].email
        sendFeedbackEmail(userName, email , feedback);
    })
    
    res.send('success')
})
  

//==========Report video function===========================

router.post('/reportVideo', auth, async (req, res) => {
    const userName = req.user.displayName
    const videoURL = req.header("videoURL")
    const reportMSG = req.header("reportMSG")

    await admin.auth().getUser(req.user.uid).then((userRecord)=>{
        const email = userRecord.providerData[0].email
        sendReportEmail(userName, email, videoURL, reportMSG);
    })

    res.send('success')
})

  router.post('/sendLoginEmail', (req, res) => {
      let email = 'rahultwr0005@gmail.com'
      let name = 'Aviral Sharma'
    // sendLoginSuccessEmail(email, name)
    // sendFriendRequestEmail(email, name, "Rahul Tiwari", "https://www.google.com")
    // sendFeedbackEmail(name, email, 'hello')
    sendReportEmail(name, email, 'google.com', 'go to google')
    res.status(200).json({
        'message': 'message sent'
    })
  })


router.post('/profile/delete-friend-reqeust', auth, async (req, res) => {
    const userId = req.user.uid;
    const friendId = req.headers.friend_id

    await Utils.deleteFriendRequest(userId, friendId);
    res.send('success');
})



//Exports
module.exports = router;