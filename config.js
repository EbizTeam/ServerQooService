module.exports = {
    'secret': 'qooservice',
    'database': 'mongodb://qooService:ebiz187@120.72.107.187:27017/db_qoo',
    'APath': "D:/nodeproject/ServerQooService",
    'APathPHP': "D:/xampp/htdocs",
    'AUrl': process.env.port || 4000,
    'urlapi': "http://120.72.107.187",
    'url_mail_notify': "/php/api_mail_notifyCreate.php",
    //idProvider
    //notifyCreate: 1,//Banner
    //notifyCreate:2,//slide
    //notifyCreate:3,//service
    'url_mail_notifyop': "/php/api_mail_notify.php",
    'api_mail_notifyExprie': "/php/api_mail_notifyExprie.php",
    'api_mail_changeUpdateMemberShip': "/php/api_mail_changeUpdateMemberShip.php",
    //id: customer, notify = 1 : appointment notify = 2: requirement
    'forgotpass': "/php/api_mail_forgotpass.php",
    'resetpassword': "/php/api_mail_changePassSuccess.php",
    'url_servicedetail': "/system/public/provider/servicedetail/",
    'url_category': "/system/public/uploadfile/category/",
    'url_services': "/system/public/uploadfile/services/",
    'api_mail_register': "/php/api_mail_register.php",
    'pathavatar' : '/system/public/uploadfile/avatar/',
};
