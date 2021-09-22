const express = require('express');
const router = express.Router();

const twilio = require('twilio');

const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/config/.env'});

// env variables...
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// create twilio client........
const client = twilio(accountSid, authToken);


//===============routes=========================================

// get otp for verfication...
router.post('/get-otp' , async (req , res)  => {

    //   get phonenumber from body...
    const phone  = req.body.phonenumber;

    // service sid for verfication...
    var sid;
  
    // create service sid....
    await client.verify.services.create({friendlyName: 'Ecstasy'})
        .then( service => {
            sid = service.sid;
        })
        .catch(err => {
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


// verify otp.....
router.post('/otp-verify' , async(req , res) =>{

    // get information from body...
    const sid = req.body.sid;
    const otp_code = req.body.otp;
    const phoneNumber = req.body.phonenumber;
  
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


// resend otp..........

router.post('/resend-otp' , async(req, res) => {

    const phoneNumber = req.body.phonenumber;
  
    var sid;
    
    await client.verify.services.create({friendlyName: 'Ecstasy'})
        .then( service => {
            sid = service.sid; 
        })
        .catch(err => {
            if(err.status != 200) {
                res.json({
                    "service_id" : null,
                    "status" : "Error in creating Service_id",
                })
            }
        });
  
    client.verify.services(sid)
        .verifications
        .create({ 
            to: phoneNumber, 
            channel: 'sms'
        })
        .then(verification => { 

            res.status(200).json({
                'service_id' : verification.serviceSid , 
                'status' : verification.status 
            })
        })
        .catch(err =>{
            if(err.status != 200) {
                res.status(400).json({
                    'service_id' :null,
                    'status' : "Error in sending Otp"
                })
            }
        });
   
  });
