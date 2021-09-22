const express = require("express");
const router = express.Router();

const { readQuery, deleteQuery } = require("../crud_functions/friends");


//=====================Routes==============================================


// load possible friends from phone numbers
router.post('/profile/can-be-friends', auth, (req, res) => {
    
    var numberString = req.body.phonenumbers

    if (numberString == undefined) {
        res.status(400).json({
            message: 'Error occured while fetching phone accounts'
        })
        return;
    }
    if(numberString == '') {
        res.status(400).json({
            message: "Empty contact list"
        });
        return;
    }

    var numbers = numberString.split(",")

    // removing duplicate numbers...converting into set
    numbers = Array.from(new Set(numbers))

    // parse phone number to national number if in international format else reduce to last 10 digit
    numbers = numbers.map(number => {
        try {
            return parsePhoneNumber(number).nationalNumber
        } catch (err) {
            return number
        }
    })

    numbers = new Set(numbers);


    let userId = req.user.uid;
    
    readQuery.cannotBeFriends(userId)
    .then( identifiers => {
        readQuery.usersFromNumbers(identifiers, numbers)
        .then( users => {
            // console.log(users);
            res.send(users)
        });
    });
    // console.log('ending api call...');
});


// load all friends of user....
router.post('/profile/friends', auth, (req, res) => {
    const userId = req.user.uid;
    
    await readQuery.loadUserFriends(userId)
    .then( friends => {
        res.status(200).json(friends);
    });
});


// delete a friend..
router.post('/profile/delete-friend', auth, (req, res) => {
    const friendId = req.headers.friend;
    const userId = req.user.uid;

    if(friendId == undefined) {
        res.status(403).json({
            message: "error"
        });
    }
  
    await deleteQuery.deleteFriend(userId, friendId)
    .then(() => {
        res.status(200).json({
            message: "success"
        });
    });
});

















module.exports = router;