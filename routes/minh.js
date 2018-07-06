const express = require('express');
const router = express.Router();


const useraccount = require('../models/useraccount');
const Services = require('../models/services');
const spspayment = require('../models/payments');
const spscategory = require('../models/spscategory');
const categoryM = require('../models/category');
const config = require('../config');




router.get("/get_sp_payment/:provider_id/:payment_type", function (req, res) {
    Spspayment = new spspayment({
        provider_id: req.params.provider_id,
        payment_type: req.params.payment_type
    });

    Spspayment.save(function (err, spspayment) {
        if (err) {
            res.json({"response": false});
        }
        else {
            res.json({"response": true});
        }
    })
});
// get SPsCategory
router.get("/get_sp_category/:category_id/:provider_id", function (req, res) {
    SpsCategory = new spscategory({
        category_id: req.params.category_id,
        provider_id: req.params.provider_id
    });

    SpsCategory.save(function (err, spscategory) {
        if (err) {
            res.json({"response": false});
        }
        else {
            res.json({"response": true});
        }
    })
});
// get category
router.get("/get_all_category", function (req, res) {
    // đường dẫn tới hình ảnh web admin
    let path = config.url_category;
    let pathsub = config.url_category+"sub/";
    categoryM.find({}, function (err, cates) {
        res.json({
            "value": cates,
            "pathicon": path,
            "pathsub": pathsub,
        });
    });

});
router.get("/get_service", function (req, res) {
    let data = [];
    let path = {'path': config.url_services};
    let pathdetail = {'pathdetail': config.url_servicedetail};


    Services.find({'flash_sale': 1}, function (err, flash_sale) {
        data.push(flash_sale);
    }).limit(5).sort({"_id": -1});
    Services.find({'for_your_family': 1}, function (err, for_your_family) {
        data.push(for_your_family);
    }).limit(5).sort({"_id": -1});
    Services.find({'top_service': 1}, function (err, top_service) {
        data.push(top_service);
    }).limit(5).sort({"_id": -1});
    Services.find({'best_for_lady': 1}, function (err, best_for_lady) {
        data.push(best_for_lady);
        data.push(path);
        data.push(pathdetail);
        res.json({data});
    }).limit(5).sort({"_id": -1});
    //console.log(data);

});
//get flash sale

router.get("/get_flash_sale", function (req, res) {
    let pathdetail = {'pathdetail': config.url_servicedetail};
    Services.find({'flash_sale': 1}, function (err, flash_sale) {
        res.json({'values': flash_sale, 'pathdetail': pathdetail});
    }).sort({"_id": -1});

});

router.get("/get_for_your_family", function (req, res) {
    let pathdetail = {'pathdetail': config.url_servicedetail};
    Services.find({'for_your_family': 1}, function (err, for_your_family) {
        res.json({'values': for_your_family, 'pathdetail': pathdetail});
    }).sort({"_id": -1});

});

router.get("/get_top_service", function (req, res) {
    let pathdetail = {'pathdetail': config.url_servicedetail};
    Services.find({'top_service': 1}, function (err, top_service) {
        res.json({'values': top_service, 'pathdetail': pathdetail});
    }).sort({"_id": -1});

});

router.get("/get_best_for_lady", function (req, res) {
    let pathdetail = {'pathdetail': config.url_servicedetail};
    Services.find({'best_for_lady': 1}, function (err, best_for_lady) {
        res.json({'values': best_for_lady, 'pathdetail': pathdetail});
    }).sort({"_id": -1});

});

router.get("/get_service_category/:subcategory", function (req, res) {
    var path = config.url_services;
    Services.find({'sub_category_id': req.params.subcategory}, function (err, services) {
        if (err) {
            res.json({'result': false});
        }
        else {

            if (services.length === 0) {
                res.send("err");
            }
            else {
                res.json({'values': services, 'path': path});
            }
        }
    });

});

module.exports = router;
