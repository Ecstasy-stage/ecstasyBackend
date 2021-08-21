const admin = require('firebase-admin');


const MRSUploadData = async (url, id, userName, title, desc, res) => {
    let random = Math.random().toString(36).substring(8);
    const snasphot = await admin.database().ref('USER').child(id).child("videolist").once('value')
    await admin.database().ref('PENDING_VIDEOS').child(id).child(random).set({
        title:title,
        desc:desc,
        dislikes: "0",
        id:id,
        likes: "0",
        name:userName,
        shares: "0",
        status:'pending',
        url:url,
        view: "0",
        vnum: String(snasphot.numChildren())
    }, err => {
        if (err) {
            console.log('The write failed...error: ', err);
            res.status(404).send('Data saving failed..!')
        } else {
            console.log('Data saved successfully!');
            res.status(201).send('Data saved successfully..')
        }
    });
}


  
module.exports = {
    MRSUploadData
}