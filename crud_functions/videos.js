const admin = require("../middleware/firebase_admin");



//===========================Global functions==============================

const findRef = type => {
    return admin.database().ref(type);
}


//=======================CREATE Queries=====================================

class createQuery {
    
};