const express = require('express');
const sortBy = require('array-sort');
const router = express.Router();
const Services = require('../models/services');
const Useraccount = require('../models/useraccount');
const findProvider = require('../models/finduserfolloweid');


//add a new to the db
router.post("/", function (req, res) {
    //console.log(req.body);
    let path = {'path': '/qooservice/system/public/uploadfile/services/'};
    let service_providers = [];
    var query = {name: {$regex: req.body.searchtext, $options: 'i'}};
    Services.find(query,
        function (err, servicesname) {
            if (err) {
                //console.log(err);
                res.json({"response": "false 1"});
            }
            else {
                //console.log(servicesname);
                if (servicesname) {
                    for (let key in servicesname ) {
                        findProvider(servicesname[key].provider_id)
                            .then(
                                provider =>{
                                    if (provider){
                                        noti = {
                                            id:servicesname[key]._id,
                                            name: servicesname[key].name,
                                            member_ship:provider.member_ship,
                                            no_of_hight_recommended: provider.no_of_hight_recommended,
                                            no_of_recommended: provider.no_of_recommended,
                                            no_of_neutral: provider.no_of_neutral,
                                            }
                                        service_providers.push(noti);
                                    }
                                }
                            );
                    }
                    setTimeout(function(){
                     sortOject(service_providers).then(
                         service=>{
                             if (service){
                                 let services = [];
                                 for (let key in  service) {
                                     Services.findOne({_id:service[key].id},
                                         function (err, sv) {
                                             if (sv){
                                                 services.push(sv);
                                             }
                                         });
                                 }
                                 setTimeout(function() {
                                     res.json({"response": services,'path': path
                                     });
                                 },2000);
                             }
                         },
                         err=>{res.json({"response": []});}
                     );



                    },2000);
                }
                else {
                    res.json({"response": []});
                }


            }
        });
});


let sortOject =  (service_providers) =>{
    return new Promise((resolve, reject) => {
        if (service_providers) {
            let value4 =  sortBy(service_providers,'name');
            let value3 =  sortBy(value4,'no_of_neutral',{reverse: true});
            let value2 =  sortBy(value3,'no_of_recommended',{reverse: true});
            let value1  =  sortBy(value2,'no_of_hight_recommended',{reverse: true});
        let value =  sortBy(value1,'member_ship',{reverse: true});
        resolve(value);
        }
        else return reject(new Error('loi tim id: ' + id));
    });
}

module.exports = router;
