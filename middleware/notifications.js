const firebase = require('./firebase_admin.js');
var https = require('follow-redirects').https;
  var fs = require('fs');

function postSilentNotification(userID, title, body) {
  
  var options = {
    'method': 'POST',
    'hostname': 'fcm.googleapis.com',
    'path': '/fcm/send',
    'headers': {
      'Content-Type': 'application/json',
      'Authorization': 'key=AAAAajxFiek:APA91bHWnEOxTIZWe5K9byJtRws_kh2ttZ45HZCiPyUB5tIhekQiEXFmv7c9QEYZyiR3tubcMoLEbsf5beanvoD_zlEVa7cEXZJ5hXq_5paQ8C7BCy1fjfezNkqkMYGAnn02UmzfBVQj'
    },
    'maxRedirects': 20
  };
  
  var req = https.request(options, function (res) {
    var chunks = [];
  
    res.on("data", function (chunk) {
      chunks.push(chunk);
    });
  
    res.on("end", function (chunk) {
      var body = Buffer.concat(chunks);
      console.log(body.toString());
    });
  
    res.on("error", function (error) {
      console.error(error);
    });
  });
  
  var postData = JSON.stringify({
    "to":"/topics/" + userID,
    "content_available":true,
    "apns-priority":5,
    "data": {
      "title": title,
      "body": body,
      "aps" : {
        "content-available" : 1,
        "badge": 1
    },
    }});
  
  req.write(postData);
  
  req.end();
}

function sendNotification(title, body, userID) {
    const tokens = [
        'AAAAajxFiek:APA91bHWnEOxTIZWe5K9byJtRws_kh2ttZ45HZCiPyUB5tIhekQiEXFmv7c9QEYZyiR3tubcMoLEbsf5beanvoD_zlEVa7cEXZJ5hXq_5paQ8C7BCy1fjfezNkqkMYGAnn02UmzfBVQj'
    ]
    const topic = userID
    // const message = {
    //     notification: {
    //         title: title,
    //         body: body
    //     },
        
    //     topic: topic
    // };
    var message = {
      notification: {
        title: title,
        body: body
      },
      android: {
        notification: {
        
        }
      },
      apns: {
        payload: {
          aps: {
            'mutable-content': 1,
            'badge': 1
          }
        },
      
      },
      topic: userID,
    };

    const db = firebase.admin.database()
    const ref = db.ref().child('USER').child(userID).child('notifications')
    ref.push({
      'title': title,
      'body': body,
      'date': new Date().toISOString()
    })

    firebase.admin.messaging().send(message)
        .then(response => console.log('Successfully sent message:', response))
        .catch(error => console.log('Error sending message:', error))
}

module.exports = { sendNotification, postSilentNotification }