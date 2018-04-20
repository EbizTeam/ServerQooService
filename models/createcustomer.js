const express = require('express');
const router = express.Router();
const Providers = require('../models/provider');
//~ var passwordHash = require('password-hash');
const passwordHash = require("node-php-password");

let CreateNewUser = (obj) =>{
    return new Promise((resolve, reject) => {
        //console.log(req.body);
        var hashedPassword = passwordHash.hash(obj.password);
        sptemp = new Providers({
            firstname: obj.first_name,
            lastname: obj.last_name,
            email: obj.email,
            password: hashedPassword,
            mobile: obj.mobile_number,
            building_name: obj.building_name,
            postal_code: obj.postal_code,
            city: obj.city,
            country: obj.country,
            birth_date: obj.birth_date,
            sex: obj.sex,
            company_name: obj.company_name,
            retail_outlets: obj.retail_outlets,
            any_operation_overseas: obj.any_operation_overseas,
            status: obj.status,
            businesstitle_position: obj.businesstitle_position,
            job_responsibilities: obj.job_responsibilities,
            phoneNumber: obj.office_number,
            address1: obj.address1,
            address2: obj.address2,
            device_token: obj.device_token,
            //Set true value for test
            isActived: true,
            member_ship: obj.member_ship,
            member_ship_time: 0,
            confirm_status: 0,
            no_of_not_recommended: 0,
            no_of_hight_recommended: 0,
            no_of_recommended: 0,
            no_of_neutral: 0,
            no_of_not_recommended: 0,
            mLat:obj.mLat,
            mLng:obj.mLng,
            occupation: obj.occupation
        });
        sptemp.save( function (err, user) {
            if (err) return reject(new Error('loi tim email: ' + obj));
            resolve(user);
        });
    });
}

module.exports = CreateNewUser;