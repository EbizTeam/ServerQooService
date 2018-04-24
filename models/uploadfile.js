const multer = require('multer');
const config = require('../config');
const path = require('path');

//upload file
let StorageChat = multer.diskStorage({
    destination:config.APath + '/asset/chat/',
    filename:function (req, file, cb) {
        cb(null,file.fieldname +'-'+Date.now()+
            path.extname(file.originalname));
    }
});

let StorageAppoint = multer.diskStorage({
    destination:config.APath + '/asset/appointment_file/',
    filename:function (req, file, cb) {
        cb(null,file.fieldname +'-'+Date.now()+
            path.extname(file.originalname));
    }
});

let StorageAution = multer.diskStorage({
    destination: config.APath + '/asset/auction_file/',
    filename:function (req, file, cb) {
        cb(null,file.fieldname +'-'+Date.now()+
            path.extname(file.originalname));
    }
});



let uploadchat = multer({
    storage: StorageChat,
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


 let uploadappoint = multer({
    storage: StorageAppoint,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if( ext !== '.txt') {
            return callback(new Error('Only  file txt are allowed'))
        }
        callback(null, true)
    },
    limits:{
        fileSize: 1024 * 1024
    }
}).single('Appointment'); //Field name and max count

 let uploadaution = multer({
    storage: StorageAution,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if( ext !== '.txt') {
            return callback(new Error('Only  file txt are allowed'))
        }
        callback(null, true)
    },
    limits:{
        fileSize: 1024 * 1024
    }
}).single('AuctionFile'); //Field name and max count

let UploadFile = ( req, res, loai) =>{
    return new Promise((resolve, reject) => {
        //loai 1 chat
        //loai 2 appoint
        //loai 3 aution
        if (loai === 1) {
            uploadchat(req, res, function(err) {
                              if (err) return reject(new Error('loi up filel: ' + loai));
                resolve('/chat/'+req.file.filename);
            });
        }
        else  if (loai === 2) {
            uploadappoint(req, res, function(err) {
                if (err) return reject(new Error('loi up filel: ' + loai));
                resolve('/appointment_file/'+req.file.filename);
            });
        }

        else  if (loai === 3) {
            uploadappoint(req, res, function(err) {
                if (err) return reject(new Error('loi up filel: ' + loai));
                resolve('/auction_file/'+req.file.filename);
            });
        }
    });
}


module.exports = UploadFile;