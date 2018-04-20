//path variable
var APath = "/root/qoo";
//var APath = "D:/njs/qoo";
var AUrl = "http://5.189.151.166";
//var AUrl = "http://localhost:3000";
// this is the index of poker
var Express = require("express");//express
var App = Express();// app express
var http = require('http').Server(App);
var io = require('socket.io')(http);//socket io
//cookie module
var CookieParser = require("cookie-parser");

//session module
var Session = require("express-session");

//body parser
var BodyParser = require('body-parser');
var Multer = require('multer');
var Upload = Multer();

var passwordHash = require('password-hash');
//nodemailer
var nodemailer = require('nodemailer');
			
var Mongoose = require("mongoose");
Mongoose.Promise = global.Promise;
var uri = 'mongodb://127.0.0.1:27017/db_qoo';

Mongoose.connect(uri,{ useMongoClient: true });

App.set('view engine', 'pug');
App.set('views', APath +'/views');

App.use(CookieParser());//use cookie
App.use(Session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }, resave: true, saveUninitialized: true }))
App.use(BodyParser.json());//use body parser
// for parsing application/xwww-
App.use(BodyParser.urlencoded({ extended: true })); 
//form-urlencoded

// for parsing multipart/form-data
App.use(Upload.array()); 
App.use(Express.static('public'));

var nameSchema = new Mongoose.Schema({
    firstName: String,
    lastName: String
});
var User = Mongoose.model("User", nameSchema);

App.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

App.post("/addname", (req, res) => {
    var myData = new User(req.body);
    myData.save()
        .then(item => {
            res.send("Name saved to database");
        })
        .catch(err => {
            res.status(400).send("Unable to save to database");
        });
});
