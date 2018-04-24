const express = require('express');
const router = express.Router();
const appointment = require('../models/bookappointments');
const Checktoken = require('../models/checktoken');
const Createappointment = require('../models/createappointment');
const Finduserfolloweid = require('../models/finduserfolloweid');
const Uploadfile = require('../models/uploadfile');

router.use(function (req, res, next) {
    Checktoken(req, res, next);
});

//add a new to the db
router.post('/', function (req, res, next) {
    //loai 1 chat
    //loai 2 appoint
    //loai 3 aution
    Uploadfile(req, res, 2)
        .then(linkfile => {
                if (linkfile) {

                    bookAppointment = new appointment({
                        services_name: req.body.services_name,
                        services_id: req.body.services_id,
                        time_for_appointment: req.body.time_for_appointment,
                        status_from_provider: req.body.status_from_provider,
                        from_id: req.body.from_id,
                        to_id: req.body.to_id,
                        link_file: linkfile,
                        user_deleted: "",
                        time_insert: Date.now(),
                    });

                    Createappointment(bookAppointment)
                        .then(appoint => {
                            if (appoint) {
                                // isPlatform:
                                // 0: iOS
                                // 1:  Android
                                // 2: Web
                                var isPlatform = req.body.isPlatform;
                                if (isPlatform == "0") {
                                    Finduserfolloweid(req.body.to_id)
                                        .then(user => {
                                            if (user) {
                                                res.json({
                                                    "response": true,
                                                    "device_token": user.device_token,
                                                    "value": appoint
                                                });
                                            }
                                        }, err => {
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
                        }, err => {
                            res.json({
                                "response": false,
                                "message": err
                            });
                        });
                } else {
                    res.json({
                        "response": false,
                        "message": err
                    });
                }
            },
            err => {
                res.json({
                    "response": false,
                    "message": err
                });
            });
});

module.exports = router;
