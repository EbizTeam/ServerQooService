const express = require('express');
const router = express.Router();
const appointment = require('../models/bookappointments');
const Checktoken = require('../models/checktoken');

const useraccount = require('../models/useraccount');

router.use(function (req, res, next) {
    Checktoken(req, res, next);
});

router.post("/insert_book_appointment", function (req, res) {
    bookAppointment = new appointment({
        services_name: req.body.services_name,
        services_id: req.body.services_id,
        time_for_appointment: req.body.time_for_appointment,
        status_from_provider: req.body.status_from_provider,
        from_id: req.body.from_id,
        to_id: req.body.to_id,
        link_file: "",
        user_deleted: "",
        time_insert: Date.now(),
    });

    bookAppointment.save(function (err, bookappointment) {
        if (err) {
            res.json({"response": false});
        } else {
            /*
            isPlatform:
            0: iOS
            1:  Android
            2: Web
            */
            var isPlatform = req.body.isPlatform;
            if (isPlatform == "0") {
                useraccount.findOne({_id: req.body.to_id}, function (err, providers_info) {
                    res.json({
                        "response": true,
                        "device_token": providers_info.device_token,
                        "value": bookappointment
                    });
                });
            }
            else {
                res.json({
                    "response": true,
                    "value": bookappointment
                });
            }
        }
    });
});


//get_appointment_by_services_id
router.get("/get_appointment_by_account_id/:account_id", function (req, res) {
    appointment.find({$and: [{user_deleted: {$ne: req.params.account_id}}, {from_id: req.params.account_id}]}, function (err, appointmentslist) {
        if (appointmentslist.length === 0) {
            appointment.find({$and: [{user_deleted: {$ne: req.params.account_id}}, {to_id: req.params.account_id}]}, function (err, appointmentslist2) {
                res.send(appointmentslist2);
            });
        }
        else {
            res.send(appointmentslist);
        }
    });
});

//update book appointment status by ID
router.post("/update_status_appointment_id", function (req, res) {
    var appointment_id = req.body.appointment_id;
    var new_status = req.body.new_status;
    // FIND APPOINTMENT
    appointment.find({_id: appointment_id}, function (err, appointment_object) {
        if (appointment_object.length == 0) {
            res.json({
                "response": false,
                "message": "No Appointment"
            });
        }
        else {
            if (appointment_object[0].status_from_provider == new_status) {
                res.json({
                    "response": false,
                    "message": "Old status and New status is match."
                });
            }
            else {
                appointment.update({'_id': appointment_id}, {$set: {'status_from_provider': new_status}}, function (err, appointment) {
                    if (err) {
                        res.json({
                            "response": false,
                            "message": err
                        });
                    } else {

                        appointment.find({_id: appointment_id}, function (err, appointment_obj) {
                            res.json({
                                "response": true,
                                "new_status": new_status,
                                "value": {
                                    "_id": appointment_obj[0]._id,
                                    "from_id": appointment_obj[0].to_id,
                                    "to_id": appointment_obj[0].from_id,
                                    "link_file": appointment_obj[0].link_file,
                                    "services_id": appointment_obj[0].services_id,
                                    "services_name": appointment_obj[0].services_name,
                                    "status_from_provider": appointment_obj[0].status_from_provider,
                                    "time_insert": appointment_obj[0].time_insert,
                                    "user_deleted": appointment_obj[0].user_deleted
                                }
                            });
                        });


                    }

                });
            }
        }
    });
});

//update appointment delete status
router.post("/user_delete_appointment", function (req, res) {
    var appointment_id = req.body.appointment_id;
    var user_deleted = req.body.user_deleted;
    // FIND APPOINTMENT
    appointment.find({_id: appointment_id}, function (err, appointment_object) {
        if (appointment_object.length == 0) {
            res.json({
                "response": false,
                "message": "No Appointment"
            });
        }
        else {
            if (appointment_object[0].user_deleted == "") {
                appointment.update({'_id': appointment_id}, {$set: {'user_deleted': user_deleted}}, function (err, appointment) {
                    if (err) {
                        res.json({
                            "response": false,
                            "message": err
                        });
                    } else {
                        res.json({
                            "response": true,
                            "message": "Appointment deleted!"
                        });
                    }

                });
            }
            else {
                if (appointment_object[0].user_deleted == user_deleted) {
                    res.json({
                        "response": false,
                        "message": "The appointment was deleted before!"
                    });
                }
                else {
                    appointment.findByIdAndRemove({_id: appointment_id}, function (err) {
                        if (err) {
                            res.json({
                                "response": false,
                                "message": err
                            });
                        }
                        else {
                            res.json({
                                "response": true,
                                "message": "Appointment deleted!"
                            });
                        }
                    });
                }
            }
        }
    });
});

//delete book appointment by ID
router.get("/delete_book_appointment_id/:appointment_id", function (req, res) {
    var appointment_id = req.params.appointment_id;
    appointment.findByIdAndRemove({_id: appointment_id}, function (err) {
        if (err) {
            res.json({
                "response": false,
                "message": err
            });
        }
        else {
            res.json({"response": true});
        }
    });

});

module.exports = router;
