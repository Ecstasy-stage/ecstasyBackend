//Authorization Middleware

const admin = require('./firebase_admin.js');


const auth = async (req, res, next) => {
    try {   
            var user;
            if(req.headers.uid){
                const uid = await req.headers.uid;
                user = await admin.auth().getUser(uid);
                
            }else{
                console.log('token is: ', token);
                const token = await req.header('Authorization').replace('Bearer ', '');
                const decodedToken = await admin.auth().verifyIdToken(token.toString());
                const uid =  decodedToken.uid;
                user = await admin.auth().getUser(uid);
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