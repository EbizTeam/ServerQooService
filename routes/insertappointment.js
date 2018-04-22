const express = require('express');
const router = express.Router();
const multer = require('multer');
const appointment = require('../models/bookappointments');
const Checktoken = require('../models/checktoken');
const Createappointment = require('../models/createappointment');
const Finduserfolloweid = require('../models/finduserfolloweid');

router.use(function (req, res, next) {
    Checktoken(req, res, next);
});

//add a new to the db
router.post('/', function (req, res, next) {
    var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, config.APath + '/asset/appointment_file/');
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now() + '.txt');
        }
    });
    var upload = multer({ //multer settings
        storage: storage
    }).single('Appointment');

    upload(req, res, function (err) {
        if (err) {
            // An error occurred when uploading
            res.json({
                "response": false,
                "message": err
            });
        }
        else {
            bookAppointment = new appointment({
                services_name: req.body.services_name,
                services_id: req.body.services_id,
                time_for_appointment: req.body.time_for_appointment,
                status_from_provider: req.body.status_from_provider,
                from_id: req.body.from_id,
                to_id: req.body.to_id,
                link_file: "appointment_file/" + req.file.filename,
                user_deleted: "",
                time_insert: Date.now(),
            });

            Createappointment(bookAppointment)
                .then(appoint =>{
                    if (appoint) {
                        // isPlatform:
                        // 0: iOS
                        // 1:  Android
                        // 2: Web
                        var isPlatform = req.body.isPlatform;
                        if (isPlatform == "0") {
                            Finduserfolloweid(req.body.to_id)
                                .then(user =>{
                                    if (user) {
                                        res.json({
                                            "response": true,
                                            "device_token": user.device_token,
                                            "value": appoint
                                        });
                                    }
                                },err=>{
                                    res.json({"response": false})
                                });
                        }
                        else {
                            res.json({
                                "response": true,
                                "value": appoint
                            });
                        }
                    }
                }, err =>  res.json({"response": false}));
        }
    });
});

module.exports = router;
