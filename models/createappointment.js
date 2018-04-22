const express = require('express');
const router = express.Router();


let CreateNewAppointment = (appointment) =>{
    return new Promise((resolve, reject) => {
        appointment.save(function (err, appointment) {
            if (err) return reject(new Error('loi tim email: ' + obj));
            resolve(appointment);
        });
    });
}

module.exports = CreateNewAppointment;