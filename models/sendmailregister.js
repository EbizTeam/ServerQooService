const nodemailer = require('nodemailer');

let SendMailRegister = (obj) =>{
    return new Promise((resolve, reject) => {

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'mailfortest32018@gmail.com',
                pass: 'TrinhVM@1'
            }
        });

        var mailOptions = {
            from: 'mailfortest32018@gmail.com',
            to: obj.email,
            subject: '[QooServices] Registration',
            html: "<p>" + obj.status + " " + obj.first_name + " " + obj.last_name + "</p>" +
            "<br>" +
            "<p>Please click this link bellow to verify your account</p>" +
            "<p>Link: <a href='http://120.72.107.187/index.php?page=mail_authente&emailCustomer=" + obj.email + "'>http://120.72.107.187/index.php?page=mail_authente</a></p>" +
            "<p>Thanks,</p>"
        };

        transporter.sendMail(mailOptions, function (err, info) {
                if (err) return reject(new Error('gui mail bi loi: '));
                resolve(info);

        });

    });
}

module.exports = SendMailRegister;
