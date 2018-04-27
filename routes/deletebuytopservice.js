const ServicesTop = require('../models/servicesbuytop');
const Comment = require('../models/service_provider_comments');
var cron = require('node-cron');

module.exports =  {
    deletetopservice: function ()
    {
        cron.schedule('*/30 * * * *', function(){
            console.log('running a task every thrity minutes');
            deleteBuyTop();
        });
    },
    deleteFileChat: function ()
    {
        cron.schedule('0 */12 * * *', function(){
            console.log('running a task every 12 hour');
            deletefilechat();
            deleteCommentprovider();
        });
    }
};

let deleteBuyTop = () => {
    ServicesTop.find({}, function (err, service) {
        if (err) return;
        if (service) {
            service.forEach(function(element) {
               if (element.create_end <= Date.now() ) {
                   Delservice(element._id)
                       .then(
                           res =>{console.log(res)}
                           ,err =>{console.log(err)}
                       );
               }
            });
        }
    });
}

let deleteCommentprovider = () => {
    Comment.find({}, function (err, comment) {
        if (err) return;
        if (comment) {
            comment.forEach(function(element) {
                var dat = new Date();
                Date.prototype.addDays = function(days) {
                    var dat = new Date(this.valueOf());
                    dat.setDate(dat.getDate() + days);
                    return dat;
                }
               if ((element.create_at <= dat.addDays(-2).getTime())&&(element.active == false)) {
                   Delscomment(element._id)
                       .then(
                           res =>{console.log(res)}
                           ,err =>{console.log(err)}
                       );
               }
            });
        }
    });
}

let deletefilechat = () => {
    const testFolder ='./asset/chat/';
    const fs = require('fs');
    var dat = new Date();
    Date.prototype.addDays = function(days) {
        var dat = new Date(this.valueOf());
        dat.setDate(dat.getDate() + days);
        return dat;
    }

    fs.readdirSync(testFolder).forEach(file => {
        if(dat.addDays(-3).getTime() >=  parseInt(file.substring(12, 25))) {
            fs.unlinkSync(testFolder+file);
        }
    })
}

// xoa top buy end time
let Delservice = (ID) => {
    return new Promise((resolve, reject) => {
        ServicesTop.deleteOne({
            _id: ID
        }, function (err, user) {
            if (err) return reject(new Error('Delete buy top: ' + ID));
            resolve(user.ok);
        });
    });
}

// xoa comment
let Delscomment = (ID) => {
    return new Promise((resolve, reject) => {
        Comment.deleteOne({
            _id: ID
        }, function (err, user) {
            if (err) return reject(new Error('Delete buy top: ' + ID));
            resolve(user.ok);
        });
    });
}