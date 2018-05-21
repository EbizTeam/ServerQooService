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



// ----------------------------- Start All for initalize Database ------------------------------------------------------//
// Create ServiceProvider Schema
var ServiceProviderData = new Mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    mobile: String,
    telephone: String,
    address: String,
    country: String,
    region: String,
    facebook: String,
    company_name: String,
    company_registration_number: String,
    business_category: String,
    business_description: String,
    business_year_stayed: String,
    annual_business_revenue: String,
    business_employees: String,
	member_ship: Number,
	member_ship_time: Number,
	confirm_status:Number
});

var SerM = Mongoose.model("service_provider", ServiceProviderData);

// Create Customer Schema
var CustomerData = new  Mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    mobile: Number,
    telephone: Number,
    address: String,
    country: String,
    region: String,
    facebook: String,
	member_ship: Number,
	member_ship_time: Number,
	confirm_status:Number
});

// Create Customer Model
var CusM = Mongoose.model("customer", CustomerData);

//create service data
var ServiceData = new Mongoose.Schema({
	name: String,
	images : [],
	provider_id : String,
	provider_name : String,
	sell_price: String,
	old_price: String,
	flash_sale: Number,
	top_service: Number,
	for_your_family: Number,
	best_for_lady: Number
});

var sd = Mongoose.model("services", ServiceData);// service data

var FlashSaleData = new Mongoose.Schema({
	name: String,
	images : [],
	provider_id : String,
	provider_name : String,
	sell_price: String,
	old_price: String
});

var fsd = Mongoose.model("flashsales", FlashSaleData);// flash sale data

var TopServicesData = new Mongoose.Schema({
	name: String,
	images : [],
	provider_id : String,
	provider_name : String,
	sell_price: String,
	old_price: String
});

var tsd = Mongoose.model("topservices", TopServicesData);// top service data

var ForYourFamilyData = new Mongoose.Schema({
	name: String,
	images : [],
	provider_id : String,
	provider_name : String,
	sell_price: String,
	old_price: String
});

var fyfd = Mongoose.model("foryourfamilies", ForYourFamilyData);//for your family data

var BestServiceForLadyData = new Mongoose.Schema({
	name: String,
	images : [],
	provider_id : String,
	provider_name : String,
	sell_price: String,
	old_price: String
});

var bsfld = Mongoose.model("bestserviceforladies", BestServiceForLadyData);// best service for lady data
// ----------------------------- End All for initalize Database ------------------------------------------------------//




//function show home page

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


//function service provider register
App.post("/ServiceProviderRegister",function(req,res){
	
	SerM.find({'email':req.body.p_email},function(err,seracc){
		CusM.find({'email':req.body.p_email},function(err,cusacc){
			if(seracc.length > 0 || cusacc.length > 0){
				res.json({"response": false});
			}
			else{
				console.log(req.body);
				var hashedPassword = passwordHash.generate(req.body.p_password);
				sptemp = new SerM({
					firstname: req.body.p_firstname,
					lastname: req.body.p_lastname,
					email: req.body.p_email,
					password: hashedPassword,
					mobile: req.body.p_mobile,
					telephone: req.body.p_telephone,
					address: req.body.p_address,
					country: req.body.p_country,
					region: req.body.p_region,
					company_name: req.body.p_company_name,
					company_registration_number: req.body.p_company_registration_number,
					business_category: req.body.p_business_category,
					business_description: req.body.p_business_description,
					business_year_stayed: req.body.p_business_year_stayed,
					annual_business_revenue: req.body.p_annual_business_revenue,
					business_employees: req.body.p_business_employees,
					member_ship: 0,
					member_ship_time: 0,
					confirm_status:0
				});
				sptemp.save(function (err, sp) {
					
					if (err) {
						res.json({"response": false});
					}else {
						
					var transporter = nodemailer.createTransport({
					  service: 'gmail',
					  auth: {
						user: 'thien7890@gmail.com',
						pass: 'c4tnt*kill'
					  }
					});

					var mailOptions = {
					  from: 'thien7890@gmail.com',
					  to: req.body.p_email,
					  subject: 'Verify Qoo Email',
					  text: AUrl
					};

					transporter.sendMail(mailOptions, function(err, info){
					  if (err) {
						console.log(err);
					  } else {
						console.log('Email sent: ' + info.response);
					  }
					});
						
						res.json({"response": true});
					}
				});	
			}
		});
	});

});

//function customer register
App.post("/CustomerRegister",function(req,res){
	
	SerM.find({'email':req.body.p_email},function(err,seracc){
		CusM.find({'email':req.body.p_email},function(err,cusacc){
			
			if(seracc.length > 0 || cusacc.length > 0){
				res.json({"response": false});
			}
			else{
				var hashedPassword = passwordHash.generate(req.body.p_password);
				customer = new CusM({
					firstname: req.body.p_firstname,
					lastname: req.body.p_lastname,
					email: req.body.p_email,
					password: hashedPassword,
					mobile: req.body.p_mobile,
					telephone: req.body.p_telephone,
					address: req.body.p_address,
					country: req.body.p_country,
					region: req.body.p_region,
					member_ship: 0,
					member_ship_time: 0,
					confirm_status:0
				});
				customer.save(function (err, cus) {
					if (err) {
						res.json({"response": false});
					}else {
						res.json({"response": true});
					}
				});
			}
		});
	});

});

//function log in service provider
App.post("/AccountLogin",function(req,res){

	//check account on service provider
	SerM.find({'email':req.body.p_email},function(err, account){
		if(err){
			res.json({"response": false});
		}else{
			if(account.length == 0){
				//check account on customer
				CusM.find({'email':req.body.p_email},function(err, cusaccount){
					if(err){
						res.json({"response": false});
					}else{
						if(cusaccount.length == 0){
							res.json({"response": false});
						}
						else{
							var check = passwordHash.verify(req.body.p_password, cusaccount[0].password);
							if(check){
								res.json({"response": cusaccount[0]});
							}
							else{
								res.json({"response": false});
							}
						}
					}
				});
				
			}
			else{
				var check = passwordHash.verify(req.body.p_password, account[0].password);
				if(check){
					res.json({"response": account[0]});
				}
				else{
					res.json({"response": false});
				}
			}
		}
	});
	
});

//function log in service provider
App.post("/AccountChangePassword",function(req,res){

	var t_email = req.body.p_email;
	var t_old_password = req.body.p_old_password;
	var t_new_password = req.body.p_new_password;
	
	//check account on service provider
	SerM.find({'email':req.body.p_email},function(err, account){
		if(err){
			res.json({"response": false});
		}else{
			if(account.length == 0){
				//check account on customer
				CusM.find({'email':req.body.p_email},function(err, cusaccount){
					if(err){
						res.json({"response": false});
					}else{
						if(cusaccount.length == 0){
							res.json({"response": false});
						}
						else{
							var check = passwordHash.verify(req.body.p_old_password, cusaccount[0].password);
							if(check){
								var hashedPassword = passwordHash.generate(req.body.p_new_password);
								
								CusM.update({'email':req.body.p_email},{$set:{'password':hashedPassword}},function(err, cusaccount){
									if(err){
										res.json({"response": false});
									}else{
										res.json({"response": true});
									}
									
								});
							}
							else{
								res.json({"response": false});
							}
						}
					}
				});
				
			}
			else{
				var check = passwordHash.verify(req.body.p_old_password, account[0].password);
				if(check){
					var hashedPassword = passwordHash.generate(req.body.p_new_password);
					SerM.update({'email':req.body.p_email},{$set:{'password':hashedPassword}},function(err, cusaccount){
						if(err){
							res.json({"response": false});
						}else{
							res.json({"response": true});
						}
						
					});
				}
				else{
					res.json({"response": false});
				}
			}
		}
	});
	
});

//function get info account
App.post("/GetInfoAccount",function(err,res){
	//check account on service provider
	SerM.find({'email':req.body.p_email},function(err, account){
		if(err){
			res.json({"response": false});
		}else{
			if(account.length == 0){
				//check account on customer
				CusM.find({'email':req.body.p_email},function(err, cusaccount){
					if(err){
						res.json({"response": false});
					}else{
						if(cusaccount.length == 0){
							res.json({"response": false});
						}
						else{
							res.json({"response": cusaccount[0]});
						}
					}
				});
				
			}
			else{
				res.json({"response": account[0]});
			}
		}
	});
});

//function update account
App.post("/UpdateAccountServiceProvider",function(req,res){
	var s_email = req.body.p_email;
	var s_type = req.body.p_member_ship;
	SerM.update({'email':email},{$set:{member_ship:s_type}},{upsert: false},function(err,acc){
		if(err){
			res.json({"response": false});
		}
		else{
			res.json({"response": true});
		}
	});
});

//function log in customer
App.post("/CustomerLogin",function(req,res){

	CusM.find({'email':req.body.p_email},
		function(err, account){
			if(err){
				res.json({"response": "false 1"});
			}else{
				if(account.length == 0){
					res.json({"response": " false 2"});
				}
				else{
					var check = passwordHash.verify(req.body.p_password, account[0].password);
					if(check){
						res.json({"response": account[0]});
					}
					else{
						res.json({"response": false});
					}
				}
			}
		}
	);
	
});

//function show home page
App.get("/",function(req,res){
	App.use(Express.static( APath + '/asset'));
	App.use( APath + '/asset/js',Express.static( APath + '/asset'));
	App.use( APath + '/asset/css',Express.static( APath + '/asset'));
	App.use( APath + '/asset/image',Express.static( APath + '/asset'));
	
	res.render('home');
});

//function show add service provider form
App.get("/add_service_provider_form",function(req,res){
	App.use(Express.static( APath + '/asset'));
	App.use( APath + '/asset/js',Express.static( APath + '/asset'));
	App.use( APath + '/asset/css',Express.static( APath + '/asset'));
	App.use( APath + '/asset/image',Express.static( APath + '/asset'));

	res.render('add_service_provider_form');
});

//function show all accounts service_provider
App.get("/admin_service_provider",function(req,res){
	SerM.find({},function(err,accs){
		res.send(accs);
	});
});

//function login
App.get("/login",function(req,res){
	App.use(Express.static( APath + '/asset'));
	App.use( APath + '/asset/js',Express.static( APath + '/asset'));
	App.use( APath + '/asset/css',Express.static( APath + '/asset'));
	App.use( APath + '/asset/image',Express.static( APath + '/asset'));

	res.render('login_form');
});

//function delete account
App.get("/delete_service_provider/:id_acc",function(req,res){
	var id_acc = req.params.id_acc;
	SerM.remove({_id:id_acc},function(err){
		if(err){
			res.send("Delete Fail");
		}
		else{
			res.redirect("/admin_service_provider");
		}
	});
	
});

//function show all accounts customer
App.get("/admin_customer",function(req,res){
	CusM.find({},function(err,accs){
		res.send(accs);
	});
});

//function delete account customer
App.get("/delete_customer/:id_acc",function(req,res){
	var id_acc = req.params.id_acc;
	CusM.remove({_id:id_acc},function(err){
		if(err){
			res.send("Delete Fail");
		}
		else{
			res.redirect("/admin_customer");
		}
	});
	
});
	/*
	name: String,
	images : [],
	provider_id : String,
	provider_name : String,
	sell_price: String,
	old_price: String,
	flash_sale: Number,
	top_service: Number,
	for_your_family: Number,
	best_for_lady: Number
	*/
	
//function api get service
App.get("/get_services_main_screen", function(req,res){
	
	var data = [];
	
	sd.find({flash_sale:1},function(err,flash){
		//res.send(flash);
		data.push(flash);
		sd.find({top_service:1},function(err,tops){
			data.push(tops);
			sd.find({for_your_family:1},function(err,fyf){
				data.push(fyf);
				sd.find({best_for_lady:1},function(err,bfl){
					data.push(bfl);
					res.send(data);
				});
			});
		});
	});
	
});

//function api get service Test
App.get("/get_services_main_screen_test", function(req,res){
	
	var data = [];
	
	sd.find({flash_sale:1},function(err,flash){
		//res.send(flash);
		data.push(flash);
		sd.find({top_service:1},function(err,tops){
			data.push(tops);
			sd.find({for_your_family:1},function(err,fyf){
				data.push(fyf);
				sd.find({best_for_lady:1},function(err,bfl){
					data.push(bfl);
					res.send(data);
				});
			});
		});
	});
	
});
	
	
//function insert testing data
App.get("/insert_testing_data", function(req,res){
	
	var data = [
				
				{
					name:'car go',
					image:['http://5.189.151.166/image/services/1.jpg','http://5.189.151.166/image/services/2.jpg','http://5.189.151.166/image/services/3.jpg','http://5.189.151.166/image/services/4.jpg','http://5.189.151.166/image/services/5.jpg'],
					provider_id : "",
					provider_name : "Qoo Service",
					sell_price: "500",
					old_price: "600",
					flash_sale: 1,
					top_service: 0,
					for_your_family: 0,
					best_for_lady: 0
				},
				{
					name:'best paint',
					image:['http://5.189.151.166/image/services/6.jpg','http://5.189.151.166/image/services/7.jpg','http://5.189.151.166/image/services/8.jpg','http://5.189.151.166/image/services/9.jpg','http://5.189.151.166/image/services/10.jpg'],
					provider_id : "",
					provider_name : "Qoo Service",
					sell_price: "400",
					old_price: "500",
					flash_sale: 1,
					top_service: 0,
					for_your_family: 0,
					best_for_lady: 0
				},
				{
					name:'best cooking',
					image:['http://5.189.151.166/image/services/11.jpg','http://5.189.151.166/image/services/12.jpg','http://5.189.151.166/image/services/13.jpg','http://5.189.151.166/image/services/14.jpg','http://5.189.151.166/image/services/15.jpg'],
					provider_id : "",
					provider_name : "Qoo Service",
					sell_price: "30",
					old_price: "50",
					flash_sale: 1,
					top_service: 0,
					for_your_family: 0,
					best_for_lady: 0
				},
				{
					name:'hotel rest',
					image:['http://5.189.151.166/image/services/16.jpg','http://5.189.151.166/image/services/17.jpg','http://5.189.151.166/image/services/18.jpg','http://5.189.151.166/image/services/19.jpg','http://5.189.151.166/image/services/20.jpg'],
					provider_id : "",
					provider_name : "Qoo Service",
					sell_price: "99",
					old_price: "200",
					flash_sale: 1,
					top_service: 0,
					for_your_family: 0,
					best_for_lady: 0
				},
				{
					name:'Young Spa',
					image:['http://5.189.151.166/image/services/21.jpg','http://5.189.151.166/image/services/22.jpg','http://5.189.151.166/image/services/23.jpg','http://5.189.151.166/image/services/24.jpg','http://5.189.151.166/image/services/25.jpg'],
					provider_id : "",
					provider_name : "Qoo Service",
					sell_price: "899",
					old_price: "1000",
					flash_sale: 1,
					top_service: 0,
					for_your_family: 0,
					best_for_lady: 0
				},
				
				{
					name:'Math accountant',
					image:['http://5.189.151.166/image/services/26.jpg','http://5.189.151.166/image/services/27.jpg','http://5.189.151.166/image/services/28.jpg','http://5.189.151.166/image/services/29.jpg','http://5.189.151.166/image/services/30.jpg'],
					provider_id : "",
					provider_name : "Qoo Service",
					sell_price: "500",
					old_price: "700",
					flash_sale: 0,
					top_service: 1,
					for_your_family: 0,
					best_for_lady: 0
				},
				
				{
					name:'Translator',
					image:['http://5.189.151.166/image/services/31.jpg','http://5.189.151.166/image/services/32.jpg','http://5.189.151.166/image/services/33.jpg','http://5.189.151.166/image/services/34.jpg','http://5.189.151.166/image/services/35.jpg'],
					provider_id : "",
					provider_name : "Qoo Service",
					sell_price: "200",
					old_price: "500",
					flash_sale: 0,
					top_service: 1,
					for_your_family: 0,
					best_for_lady: 0
				},
				{
					name:'Chinese medicine',
					image:['http://5.189.151.166/image/services/36.jpg','http://5.189.151.166/image/services/37.jpg','http://5.189.151.166/image/services/38.jpg','http://5.189.151.166/image/services/39.jpg','http://5.189.151.166/image/services/40.jpg'],
					provider_id : "",
					provider_name : "Qoo Service",
					sell_price: "800",
					old_price: "1000",
					flash_sale: 0,
					top_service: 1,
					for_your_family: 0,
					best_for_lady: 0
				},
				{
					name:'Plumbing & Toilet',
					image:['http://5.189.151.166/image/services/41.jpg','http://5.189.151.166/image/services/42.jpg','http://5.189.151.166/image/services/43.jpg','http://5.189.151.166/image/services/44.jpg','http://5.189.151.166/image/services/45.jpg'],
					provider_id : "",
					provider_name : "Qoo Service",
					sell_price: "150",
					old_price: "200",
					flash_sale: 0,
					top_service: 1,
					for_your_family: 0,
					best_for_lady: 0
				},
				{
					name:'Electrical Services',
					image:['http://5.189.151.166/image/services/46.jpg','http://5.189.151.166/image/services/47.jpg','http://5.189.151.166/image/services/48.jpg','http://5.189.151.166/image/services/49.jpg','http://5.189.151.166/image/services/50.jpg'],
					provider_id : "",
					provider_name : "Qoo Service",
					sell_price: "170",
					old_price: "300",
					flash_sale: 0,
					top_service: 1,
					for_your_family: 0,
					best_for_lady: 0
				},
				
				{
					name:'Music Lesson',
					image:['http://5.189.151.166/image/services/51.jpg','http://5.189.151.166/image/services/52.jpg','http://5.189.151.166/image/services/53.jpg','http://5.189.151.166/image/services/54.jpg','http://5.189.151.166/image/services/55.jpg'],
					provider_id : "",
					provider_name : "Qoo Service",
					sell_price: "500",
					old_price: "700",
					flash_sale: 0,
					top_service: 0,
					for_your_family: 1,
					best_for_lady: 0
				},
				
				{
					name:'Piano Lession',
					image:['http://5.189.151.166/image/services/56.jpg','http://5.189.151.166/image/services/57.jpg','http://5.189.151.166/image/services/58.jpg','http://5.189.151.166/image/services/59.jpg','http://5.189.151.166/image/services/60.jpg'],
					provider_id : "",
					provider_name : "Qoo Service",
					sell_price: "200",
					old_price: "500",
					flash_sale: 0,
					top_service: 0,
					for_your_family: 1,
					best_for_lady: 0
				},
				{
					name:'Pre School Education',
					image:['http://5.189.151.166/image/services/61.jpg','http://5.189.151.166/image/services/62.jpg','http://5.189.151.166/image/services/63.jpg','http://5.189.151.166/image/services/64.jpg','http://5.189.151.166/image/services/65.jpg'],
					provider_id : "",
					provider_name : "Qoo Service",
					sell_price: "800",
					old_price: "1000",
					flash_sale: 0,
					top_service: 0,
					for_your_family: 1,
					best_for_lady: 0
				},
				{
					name:'Child Care Center',
					image:['http://5.189.151.166/image/services/66.jpg','http://5.189.151.166/image/services/67.jpg','http://5.189.151.166/image/services/68.jpg','http://5.189.151.166/image/services/69.jpg','http://5.189.151.166/image/services/70.jpg'],
					provider_id : "",
					provider_name : "Qoo Service",
					sell_price: "150",
					old_price: "200",
					flash_sale: 0,
					top_service: 0,
					for_your_family: 1,
					best_for_lady: 0
				},
				{
					name:'Bicycle Repairs',
					image:['http://5.189.151.166/image/services/71.jpg','http://5.189.151.166/image/services/72.jpg','http://5.189.151.166/image/services/73.jpg','http://5.189.151.166/image/services/74.jpg','http://5.189.151.166/image/services/75.jpg'],
					provider_id : "",
					provider_name : "Qoo Service",
					sell_price: "170",
					old_price: "300",
					flash_sale: 0,
					top_service: 0,
					for_your_family: 1,
					best_for_lady: 0
				},
				
				{
					name:'Massage',
					image:['http://5.189.151.166/image/services/76.jpg','http://5.189.151.166/image/services/77.jpg','http://5.189.151.166/image/services/78.jpg','http://5.189.151.166/image/services/79.jpg','http://5.189.151.166/image/services/80.jpg'],
					provider_id : "",
					provider_name : "Qoo Service",
					sell_price: "60",
					old_price: "100",
					flash_sale: 0,
					top_service: 0,
					for_your_family: 0,
					best_for_lady: 1
				},
				
				{
					name:'Pedicure & Manicure',
					image:['http://5.189.151.166/image/services/81.jpg','http://5.189.151.166/image/services/82.jpg','http://5.189.151.166/image/services/83.jpg','http://5.189.151.166/image/services/84.jpg','http://5.189.151.166/image/services/85.jpg'],
					provider_id : "",
					provider_name : "Qoo Service",
					sell_price: "200",
					old_price: "500",
					flash_sale: 0,
					top_service: 0,
					for_your_family: 0,
					best_for_lady: 1
				},
				{
					name:'Hair dressing',
					image:['http://5.189.151.166/image/services/86.jpg','http://5.189.151.166/image/services/87.jpg','http://5.189.151.166/image/services/88.jpg','http://5.189.151.166/image/services/89.jpg','http://5.189.151.166/image/services/90.jpg'],
					provider_id : "",
					provider_name : "Qoo Service",
					sell_price: "800",
					old_price: "1000",
					flash_sale: 0,
					top_service: 0,
					for_your_family: 0,
					best_for_lady: 1
				},
				{
					name:'Beauty & Slimming',
					image:['http://5.189.151.166/image/services/91.jpg','http://5.189.151.166/image/services/92.jpg','http://5.189.151.166/image/services/93.jpg','http://5.189.151.166/image/services/94.jpg','http://5.189.151.166/image/services/95.jpg'],
					provider_id : "",
					provider_name : "Qoo Service",
					sell_price: "150",
					old_price: "200",
					flash_sale: 0,
					top_service: 0,
					for_your_family: 0,
					best_for_lady: 1
				},
				{
					name:'Personal Trainer',
					image:['http://5.189.151.166/image/services/96.jpg','http://5.189.151.166/image/services/97.jpg','http://5.189.151.166/image/services/98.jpg','http://5.189.151.166/image/services/99.jpg','http://5.189.151.166/image/services/100.jpg'],
					provider_id : "",
					provider_name : "Qoo Service",
					sell_price: "170",
					old_price: "300",
					flash_sale: 0,
					top_service: 0,
					for_your_family: 0,
					best_for_lady: 1
				}
				
			];
			
	sd.collection.insert(data);
});

http.listen(80, function(){});
//http.listen(3000, function(){});
