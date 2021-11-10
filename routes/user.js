const express = require("express");
const router = express.Router();

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
  
});


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


// search user by name....
router.post('/profile/users-from-name', auth, async (req, res) => {
    const name = req.headers.text;
    if(name === undefined) {
        res.status(400).json({
            error: true,
            message: "name queried is undefined"
        });
    }
    const result = await readQuery.usersFromName(name, req.user.uid);
    result.filter(user => user.type == "artist");
    return res.status(200).json(result);
});


// follow a user....
router.post('/profile/admire', auth, async (req, res) => {
    try {
        const admireId = req.headers.user;
        if(admireId === undefined) {
            res.status(400).json({
                error: true,
                message: "Identifier received is undefined"
            });
            return;
        }
        await updateQuery.admire(req.user.uid, admireId);
        res.status(200).json({
            message: "Success"
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        })
    }
});


// unfollow a user....
router.post('/profile/remove-admire', auth, async (req, res) => {
    try {
        const admireId = req.headers.user;
        if(admireId === undefined) {
            res.status(400).json({
                error: true,
                message: "Identifier received is undefined"
            });
            return;
        }
        await updateQuery.removeAdmire(req.user.uid, admireId);
        res.status(200).json({
            message: "Success"
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message
        });
    } 
})