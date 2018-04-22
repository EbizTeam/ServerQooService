const multer = require('multer');
const config = require('../config');
const path = require('path');

//upload file
let Storage = multer.diskStorage({
    destination:config.APath + '/asset/chat/',
    filename:function (req, file, cb) {
        cb(null,file.fieldname +'-'+Date.now()+
            path.extname(file.originalname));
    }
});

let upload = multer({
    storage: Storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' &&
            ext !== '.jpg' &&
            ext !== '.gif' &&
            ext !== '.jpeg' &&
            ext !== '.txt' &&
            ext !== '.pdf' &&
            ext !== '.rar'
        ) {
            return callback(new Error('Only image and file txt, pdf, rar, are allowed'))
        }
        callback(null, true)
    },
    limits:{
        fileSize: 1024 * 1024
    }
}).single('imgUploader'); //Field name and max count


module.exports = upload;