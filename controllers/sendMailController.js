const config = require('../config');
const urlapi = config.urlapi;
const request_promise = require('request-promise');

exports.send_mail = (url,data) =>{
    //SEND MAIL HERE
    var options = {
        method: 'POST',
        uri: urlapi + url,
        form:data,
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        }
    };
    request_promise(options)
        .then(function (body) {
            // POST succeeded...
            console.log(body);
        })
        .catch(function (err) {
            if (err)  console.log(err);
        });
}
