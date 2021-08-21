var admin = require("firebase-admin");

const serviceAccountKey = require("../config/service_account_key.js");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
    databaseURL: "https://theatronfinal.firebaseio.com",
    storageBucket:"theatronfinal.appspot.com"
});

var db = admin.database();
var storage = admin.storage()

module.exports = {
    admin,
    db,
    storage,
    
}

