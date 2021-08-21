//Authorization Middleware

const firebase = require('./firebaseFunc.js');


const auth = async (req, res, next) => {
    try {   
            var user;
            if(req.headers.uid){
                const uid = await req.headers.uid;
                user = await firebase.admin.auth().getUser(uid);
                
            }else{
                const token = await req.header('Authorization').replace('Bearer ', '');
                const decodedToken = await firebase.admin.auth().verifyIdToken(token.toString());
                const uid =  decodedToken.uid;
                user = await firebase.admin.auth().getUser(uid);
            }
        

        if (!user) {
            throw new Error('User not found');
        }

        req.user = user

        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
        console.log(e);
    }
}

module.exports = auth