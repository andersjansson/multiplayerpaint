var RoomModel = require('../models/room');
var User = require('../models/user');
var bcrypt   = require('bcrypt-nodejs');
var flash = require('connect-flash');
var validator = require('validator');
//var user = require('./users')

module.exports = function(app, passport) {
//app.get('/testlol', user.test);

	app.get('/', function(req, res) {

		//removeAllRooms();
		//generatePublicRooms(23);

		if(req.isAuthenticated()){
			res.render('index.ejs', {
				user: req.user,
				userRooms: RoomModel.find({creator: req.user.id}).exists('roomId').exists('dataURL').sort({lastModified: -1}).limit(10),
				publicRooms: RoomModel.find({isPrivate: false}).exists('roomId').exists('dataURL').sort({lastModified: -1}).limit(10),
				timeAgo: timeAgo
			});
			
		}
		else{
			res.render('index.ejs', {
				publicRooms: RoomModel.find({isPrivate: false}).exists('roomId').exists('dataURL').sort({lastModified: -1}).limit(10),
				timeAgo: timeAgo
			});
		}

	});

	app.get('/profile', isLoggedIn, function(req, res) {

		//var rooms = RoomModel.findOne({ roomId : 'roomId'}).where('creator').equals(req.user.id);
		console.log(req.user);

		res.render('Profile/index.ejs', {
			user : req.user,
			//Userrooms: rooms,
			message: req.flash('editMessage'),
			userRooms: RoomModel.find({creator: req.user.id}).exists('roomId').exists('dataURL').sort({lastModified: -1}).limit(20),
			timeAgo: timeAgo
		});
		//console.log(rooms);
		console.log(req.user.id);
	});
	app.get('/profile/edit', isLoggedIn, function(req, res) {

		res.render('Profile/edit.ejs', {
			user : req.user,
			message: req.flash('editMessage')
		});
	});


	app.post('/profile/settings/edit', isLoggedIn, function(req, res){
		console.log(req.body);
		User.findOne({ _id: req.user.id }, function (err, user){

			if (err) return handleError(err);
			

			if (req.body.username === '' || req.body.email === '') {

				console.log(req.flash);
				console.log(req.body);
            	console.log("INGA TOMMA FÄLT PLESAE");

				req.flash('editMessage', 'Inga tomma fält please.');

				return res.redirect('/profile/settings/edit');

			} else {

				if (validator.isEmail(req.body.email)) {

					console.log("loookin good, will save this shit now!");
		  			user.local.username = validator.escape(req.body.username);
		  			user.local.email = validator.escape(req.body.email);
		  		
					user.local.age = req.body.age;
					user.local.first_name = req.body.firstName;
					user.local.last_name = req.body.lastName
				  	user.save();
				  	user.save(function (err) {

					    if (err) return handleError(err);
					    req.flash('editMessage', 'Profile setting has been changed!');
					    res.redirect('/profile');

					});

				} else {

					console.log("password to short!");
					req.flash('editMessage', 'You cant fool us, give us a real email pls..fgt');

					return res.redirect('/profile/settings/edit');
				}
				
		    }
		});
	});

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	app.get('/login', function(req, res) {
		res.render('Auth/login.ejs', { message: req.flash('loginMessage') });
	});

	app.get('/rooms', isLoggedIn, function(req, res) {
		res.render('index.ejs', {roomId: req.params.roomId, roomName: req.body.roomName});
		console.log("lololol rooooms");
	});
	app.post('/rooms', isLoggedIn,  function(req, res) {
		console.log(req.body);
		hashId = generateRoomId(10);

		var Room = RoomModel();

		Room.roomId = hashId;
		if (req.body.roomName === '') {

			req.flash('editMessage', 'You need to enter a name for the room.');
			return res.redirect('/profile/settings/edit');

		} else {

			Room.name = req.body.roomName;

			if (typeof req.body.password !== 'undefined') {
				console.log("passwöööörd");
				Room.password = req.body.password;
			};
			

			if (req.body.radioGroup === "private") {
				console.log("its private roooom");
				Room.isPrivate = true;
			} else {

				Room.isPrivate = false;
			}
			
			Room.creator = req.user.id;

			Room.save(function (err) {

	  			if (err) console.log(err);
	  			
	  			else
	  				res.redirect("/rooms/" + hashId);
			});
		}	
	});

	app.get('/rooms/:roomId', function(req, res) {

		var name;
		var uId;
		var pass;
		var requirePass;
		var auth = false;
		
		if(req.isAuthenticated()){
			name = req.user.local.username;
			uId  = req.user.id;
			auth = true;
		}

	  getRoom(req.params.roomId, function(doc){
	  	if(doc){
	  		if(typeof doc.password !== "undefined"){
	  			console.log("ROOM HAS PASSWORD");
	  			if(auth && doc.creator === uId){
	  				console.log("HOST JOINS ROOM");
	  				//rummets skapare joinar, han behöver inte skriva in password
	  			}
	  			else{
	  				console.log("NON-HOST JOINS ROOM");
	  				pass = doc.password;
	  			}
	  		}
	  		else
	  			console.log("ROOM HAS NO PASSWORD");

	  		res.render("Rooms/room.ejs", {
	  			roomId: req.params.roomId, 
	  			roomName: doc.name, 
	  			roomCreator: doc.creator,
	  			dataURL: doc.dataURL,
	  			userId: uId, 
	  			user: req.user, 
	  			password: pass
	  		});
	  	}
	  	
	  	else
	  		res.render("Errors/404.ejs");
	  });
	});

	app.post("/checkroompassword", function(req,res){
		var pass = req.body.password;
		var id = req.body.roomId;

		console.log("id: "+id);

		RoomModel.findOne({roomId: id}, function (err, doc){
			if(doc !== null){
				if(doc.password === pass)
					res.send("correct");
				else
					res.send("wrong");
			}
			else
				res.send("error");
		});
		
	});

	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/',
		failureRedirect : '/login',
		failureFlash : true
	}));

	app.get('/signup', function(req, res) {
		res.render('Auth/signup.ejs', { message: req.flash('signupMessage') });
	});

	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/',
		failureRedirect : '/signup',
		failureFlash : true
	}));

	app.post('/createrandom',  function(req, res) {
		var id = generateRoomId(10);

		var room = new RoomModel({
  		roomId: id,
  		isPrivate: false,
  	});

  	room.save(function(err, doc){
  		if(err) console.log(err);

  		else
  			res.redirect("/rooms/"+id);
  	});
	});

	app.get('*', function(req,res) {
		res.render("Errors/404.ejs");
	});
};



// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/login');
}

function generateRoomId(length){
	var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
	var id = "";

	for(var i = 0; i < length; i++)
	{
		id += chars.charAt(Math.floor(Math.random() * chars.length));
	}

	return id;
}

function getRoom(roomId,fn)
{
	var rId = roomId;

	RoomModel.findOne({roomId: rId}, function (err, doc){
	  if(doc !== null){
	  	fn(doc);
	  }
	  else
	  	fn(false);
	  	
	});
}

function removePublicRooms()
{
	RoomModel.find({isPrivate: false}).remove().exec();
}

function removeAllRooms()
{
	RoomModel.find({}).remove().exec();	
}

function generatePublicRooms(howMany)
{
  for(var i = 0; i < howMany; i++)
  {
  	var room = new RoomModel({
  		name: "room " + [i],
  		isPrivate: false,
  		roomId: generateRoomId(10)
  	});

  	room.save();
  }
}

function timeAgo(date)
{
  var seconds = Math.floor((new Date().getTime() - date) / 1000);

  var interval = Math.floor(seconds / 31536000);

  if (interval >= 1) {
      return interval + (Math.floor(interval) > 1 ? " years" : " year");
  }
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
      return interval + (Math.floor(interval) > 1 ? " months" : " month");
  }
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
      return interval + (Math.floor(interval) > 1 ? " days" : " day");
  }
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
      return interval + (Math.floor(interval) > 1 ? " hours" : " hour");
  }
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
      return interval + (Math.floor(interval) > 1 ? " minutes" : " minute");
  }
  return "< 1 minute";
}