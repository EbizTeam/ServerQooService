const express = require('express');
const router = express.Router();
const FindEmail = require("../models/finduserfollowemail");
const nodemailer = require('nodemailer');


//add a new to the db
router.get("/:email", function (req, res) {
    var email_address = req.params.email;
    //Check In Customer
    FindEmail(email_address)
    then(user =>{
        if (user){
            // Random code
            var random_code = randomstring.generate(6);
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'mailfortest32018@gmail.com',
                    pass: 'TrinhVM@1'
                }
            });
            var mailOptions = {
                from: 'mailfortest32018@gmail.com',
                to: email_address,
                subject: '[QooServices] The Forgot Password mail',
                text: 'Please e this code to change your password : ' + random_code,
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    res.json({
                        "response": false,
                        "message": "Send mail failed !"
                    });
                } else {
                    res.json({
                        "response": true,
                        "code": random_code,
                        "message": "Email sent "
                    });
                }
            });

        } else{
            res.json({
                "response": false,
                "message": "There is no account with the email you provided !"
            });
        }
    },err =>{
        res.json({
            "response": false,
            "message": "There is no account with the email you provided !"
        });
    });


});

module.exports = router;
