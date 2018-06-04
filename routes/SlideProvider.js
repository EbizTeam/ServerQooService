const express = require('express');
const router = express.Router();
const SlProvider = require('../models/slideProviderModel');
// file config use to config all port,
const config = require('../config');
const urlapi = config.urlapi;
const urlPHP = config.APathPHP;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

router.get("/:providerID", function (req, res) {
    SlProvider.find({
        provider_id: req.params.providerID
    }, function (err, slides) {
        if (err) res.json({
            value: 1,
            response: err
        })
        if (slides) {
            res.json({
                value: 0,
                response: slides,
                path: '/system/public/uploadfile/slide'
            })
        } else {
            res.json({
                value: 2,
                response: "Not found slide  iamge"
            })
        }
    })

})


//upload file
var Storage = multer.diskStorage({
    destination: urlPHP + '/system/public/uploadfile/slide',
    filename: function (req, file, cb) {
        cb(null, Date.now() +
            file.originalname);
    }


});

var upload = multer({
    storage: Storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.png'
            && ext !== '.jpg'
            && ext !== '.jpeg'
        ) {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
    limits: {
        fileSize: 6000000
    }
}).single('slideprovider'); //Field name and max count

router.post("/", function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            res.json({
                "response": Error,
                "value": 1
            });
        } else {
            SlProvider.create({
                name_slide: req.body.name,
                desc_slide: req.body.desc,
                link_slide: req.body.link,
                images: req.file.filename,
                provider_id: req.body.provider_id,
                created_at: new Date(),
            }, function (err, slides) {
                if (err) {
                    res.json({
                        "response": Error,
                        "value": 3
                    });
                }
                if (slides) {
                    res.json({
                        value: 0,
                        response: slides,
                        path: '/system/public/uploadfile/slide'
                    })
                } else {
                    res.json({
                        value: 2,
                        response: "Not found slide  iamge"
                    })
                }
            });
        }
    });
});

router.put("/images/:id", function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            res.json({
                "response": Error,
                "value": 1
            });
        } else {
            SlProvider.findById(req.params.id, function (err, slide) {
                if (err) throw err;
                if (slide) {
                    try {
                        fs.unlinkSync(urlPHP + '/system/public/uploadfile/slide/' + slide.images);
                    } catch (err) {
                        console.log(err);
                    }
                }
            })
            SlProvider.findOneAndUpdate({_id: req.params.id}, {images:req.file.filename, updated_at:new Date()}, {new: true}, function (err, slide) {
                if (err)
                    return res.status(400).send({
                        response: 'Update fail',
                        value: false
                    });
                res.json({
                    value: true,
                    response: slide
                });
            });
        }
    });

});

router.post("/images", function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            res.json({
                "response": Error,
                "value": 1
            });
        } else {
            SlProvider.findById(req.body.id, function (err, slide) {
                if (err) throw err;
                if (slide) {
                    try {
                        fs.unlinkSync(urlPHP + '/system/public/uploadfile/slide/' + slide.images);
                    } catch (err) {
                        console.log(err);
                    }
                }
            })
            SlProvider.findOneAndUpdate({_id: req.body.id}, {images:req.file.filename, updated_at:new Date()}, {new: true}, function (err, slide) {
                if (err)
                    return res.status(400).send({
                        response: 'Update fail',
                        value: false
                    });
                res.json({
                    value: true,
                    response: slide
                });
            });
        }
    });

});

router.put("/delete/:id", function (req, res) {
    SlProvider.findById(req.params.id, function (err, slide) {
        if (err) {
            res.json({
                response: err,
                value: false
            });
        }
        if (slide) {
            try {
                fs.unlinkSync(urlPHP + '/system/public/uploadfile/slide/' + slide.images);
            } catch (err) {
                console.log(err);
            }
            SlProvider.remove({_id: req.params.id}, function (err, slider) {
                if (err) {
                    res.json({
                        response: err,
                        value: false
                    });
                } else {
                    res.json({
                        response: "deleteted",
                        value: true
                    });
                }
            });
        }else{
            res.json({
                response: "dealete fail",
                value: false
            });
        }
    })
});

module.exports = router;