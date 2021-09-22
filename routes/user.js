const express = require("express");
const router = express.Router();

const admin = require("../middleware/firebase_admin");
const auth = require("../middleware/auth");

const { createQuery, readQuery, updateQuery } = require("../crud_functions/user");

//===========================routes======================================

// create or update user....
router.post('/login', auth, async(req, res) => {

    const userId = req.user.uid
    const name = req.headers.name
    const type = req.headers.type
    var photourl = req.headers.photourl
  
    if (photourl == undefined) {
      photourl = ''
    }
  
    if ((name != undefined && type != undefined && (type == 'artist' || type == 'audience')) == false) {
      res.send('error')
    }
  
    const value = await createQuery.login(userId, type, name, photourl);
    console.log(value);
  
    if (value == false) {
      const newType = (type == 'artist') ? 'audience' : 'artist'
      res.status(403).send(`Sorry, you are not able to login as ${type}. Please, switch to ${newType}`)
    } else {
      res.send('success')
    }
  
})

// find user from their id....
router.post('/profile/user-from-id', auth, (req, res) => {

    const userId = req.headers.id
    if (userId == undefined) {
      res.send('error')
      return;
    }
  
    readQuery.loadUserById(userId)
    .then( user => {
        res.status(200).json(user);
    });
  
});


// get the profile of admin user...
router.post('/profile', auth, async (req, res) => {
    const userId = req.user.uid;
    readQuery.loadUserById(userId)
    .then( user => {
        res.status(200).json(user);
    });
});


// edit profile.....
router.post('/profile/edit', auth, async (req, res) => {
    const name = req.headers.name
    const username = req.headers.username
    const biography = req.headers.bio
    const number = req.headers.number
    
    const user = {
        name: name,
        username: username,
        userId: req.user.uid,
        bio: biography,
        number: number
    }

    await updateQuery.editProfile(user)
    .then( result => {
        if(!result) {
            res.status(400).json({
                message: "Sorry, this phone number is already in use"
            });
        } else {
            res.status(200).json({
                message: "success"
            });
        }
    });
});