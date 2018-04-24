const express = require('express');
const router = express.Router();
const Checktoken = require('../models/checktoken');

const useraccount = require('../models/useraccount');
const Services = require('../models/services');

router.use(function (req, res, next) {
    Checktoken(req, res, next);
});


//delete service by id
router.get("/delete_service/:service_id", function (req, res) {
    var service_id = req.params.service_id;
    Services.findByIdAndRemove({_id: service_id}, function (err) {
        if (err) {
            res.send(err);
        }
        else {
            res.send("Delete OK");
        }
    });

});

//delete all services
router.get("/delete_services_all", function (req, res) {
    Services.deleteMany({}, function (err) {
        if (err) {
            res.send(err);
        }
        else {
            res.send("Delete OK");
        }
    });

});
//Get Customer's Info BY CustomerID
router.get("/getcustomer_info/:customer_id", function (req, res) {
    var data = [];
    useraccount.find({_id: req.params.customer_id}, function (err, customers_info) {
        if (err) {
            res.send("false");
        }
        else {
            if (customers_info.length == 0) {
                res.send("No Customer");
            }
            else {
                data.push(customers_info[0]);
                res.send(data);
            }
        }
    });
});
//Get Provider's Info BY ProviderID
router.get("/getproviders_info/:provider_id", function (req, res) {
    var data = [];
    var all_provider_id = req.params.provider_id;
    var arr_provider_id = all_provider_id.split(",")
    if (arr_provider_id.length > 0) {
        for (var i = 0; i < arr_provider_id.length; i++) {
            findData(arr_provider_id[i], i);
        }

        function findData(provider_id, idx) {
            useraccount.find({_id: provider_id}, function (err, providers_info) {
                if (err) {
                    res.send("false");
                }
                else {
                    if (providers_info.length == 0) {
                        res.send("No Provider");
                    }
                    else {
                        data.push(providers_info[0]);
                        if (data.length == arr_provider_id.length) {
                            res.send(data);
                        }

                    }
                }
            });
        }
    }
});
//function show all accounts service_provider
router.get("/admin_service_provider", function (req, res) {
    useraccount.find({}, function (err, accs) {
        res.send(accs);
    });
});

//function delete account
router.get("/delete_service_provider/:id_acc", function (req, res) {
    var id_acc = req.params.id_acc;
    useraccount.remove({_id: id_acc}, function (err) {
        if (err) {
            res.send("Delete Fail");
        }
        else {
            res.redirect("/admin_service_provider");
        }
    });
});

//function show all accounts customer
router.get("/admin_customer", function (req, res) {
    useraccount.find({}, function (err, accs) {
        res.send(accs);
    });
});

//function delete account customer
router.get("/delete_customer/:id_acc", function (req, res) {
    var id_acc = req.params.id_acc;
    useraccount.remove({_id: id_acc}, function (err) {
        if (err) {
            res.send("Delete Fail");
        }
        else {
            res.redirect("/admin_customer");
        }
    });

});

module.exports = router;