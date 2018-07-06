const Comment = require('../models/serviceComments');
const Async = require("async");

let FindAllListComment = (services_id) => {
    return new Promise((resolve, reject) => {
        Comment.find({
            services_id:services_id,
            active:true,
        }, function (err, comment) {
            if (err) return reject(err);
            resolve(comment);
        })
    });
};

let CreateOneComment = (obj) => {
    return new Promise((resolve, reject) => {
        obj.save(function (err, comment) {
            if (err) return reject(err);
            resolve(comment);
        })
    });
};

exports.insert_comment_service =  function (req, res) {
    let newComment = new Comment(req.body);
    CreateOneComment(newComment)
        .then(
            comment => {
                if (comment){
                    return res.json({"response":true , "value": comment });
                } else {
                    return res.json({"response":false , "value": [] });
                }
            },err => {
                return res.json({"response": false , "value": err});
            }
        );
};

exports.get_comment_service_consumer =  function (req, res) {
    FindAllListComment(req.params.services_id)
        .then(
            comment => {
                if (comment){
                    return res.json({"response":true , "value": comment });
                } else {
                    return res.json({"response":false , "value": [] });
                }
            },err => {
                return res.json({"response": false , "value": err});
            }
        );
};


