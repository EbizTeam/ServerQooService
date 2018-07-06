const Comment = require('../models/service_provider_comments');
const Provider = require('../controllers/providerController');
const Async = require("async");

let FindAllListComment = (provider_id) => {
    return new Promise((resolve, reject) => {
        Comment.find({
            provider_id:provider_id,
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

let countRating = (provider_id) => {
    return new Promise((resolve, reject) => {
        FindAllListComment(provider_id)
            .then(
              comment => {
                  if (comment) {
                      let count = comment.length;
                      let sumR = 0;
                      Async.forEachOf(comment, function (item, key, callback) {
                          sumR += item.rating_star;
                          callback();
                      }, function (err) {
                          if (err) reject(err);
                          if (count > 0){
                              resolve(Math.round(sumR/count + 0.5));
                          }else{
                              resolve(3);
                          }
                      });
                  } else {
                      resolve(3);
                  }
              },err => { reject(err)}
            );
    });
};



exports.insert_comment_provider =  function (req, res) {
    let newComment = new Comment(req.body);
    CreateOneComment(newComment)
        .then(
            comment => {
                if (comment){
                    countRating(comment.provider_id)
                        .then(
                            rating => {
                                console.log(rating);
                                Provider.UpdateOneProvider({
                                    _id:comment.provider_id,
                                    rating_star:rating,
                                });
                            },
                            err => {
                                console.log(err);
                            }
                        );
                    return res.json({"response": comment, "value": true});
                } else {
                    return res.json({"response": [], "value": false});
                }
            },err => {
                return res.json({"response": err, "value": false});
            }
        );
};


