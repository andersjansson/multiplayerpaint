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
				userRooms: RoomModel.find({creator: req.user.id}).exists('roomId').exists('dataURL').sort({lastModified: -1}).limit(20),
				publicRooms: RoomModel.find({isPrivate: false}).exists('roomId').exists('dataURL').sort({lastModified: -1}).limit(20),
				timeAgo: timeAgo
			});
			
		}
		else{
			res.render('index.ejs', {
				publicRooms: RoomModel.find({isPrivate: false}).exists('roomId').exists('dataURL').sort({lastModified: -1}).limit(20),
				timeAgo: timeAgo
			});
		}

	});

	app.get('/profile', isLoggedIn, function(req, res) {

		var rooms = RoomModel.findOne({ roomId : 'roomId'}).where('creator').equals(req.user.id);

		res.render('Profile/index.ejs', {
			user : req.user,
			Userrooms: rooms,
			userRooms: RoomModel.find({creator: req.user.id}).sort({lastModified: -1})
		});
		console.log(rooms);
		console.log(req.user.id);
	});

	app.get('/profile/settings', isLoggedIn, function(req, res){
		res.render('Profile/show.ejs', {
			user : req.user
		});
	});

	app.post('/profile/settings/edit', isLoggedIn, function(req, res){
		console.log(req.body);
		User.findOne({ _id: req.user.id }, function (err, user){

			if (err) return handleError(err);
			

			if (req.body.username === '' || req.body.email === '' || req.body.password === '') {

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
		  			user.local.password = user.generateHash(req.body.password);
				  	user.save();
				  	user.save(function (err) {

					    if (err) return handleError(err);

					    res.redirect('/profile/settings/edit');

					});

				} else {

					console.log("password to short!");
					req.flash('editMessage', 'You cant fool us, give us a real email pls..fgt');

					return res.redirect('/profile/settings/edit');
				}
				
		    }
		});
	});

	app.get('/profile/settings/edit', isLoggedIn, function(req, res){
		res.render('Profile/edit.ejs',{
			message: req.flash('editMessage'),
			user : req.user
		});
	});
	
	app.get('/profile/settings/edit', function(req, res){
		return "EDIT MOTHERRUCKAH"
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

			if (!req.body.password === '') {
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
		
		if(req.isAuthenticated()){
			name = req.user.local.username;
			uId  = req.user.id;
		}

	  getRoom(req.params.roomId, function(doc){
	  	if(doc)
	  		res.render("Rooms/room.ejs", {roomId: req.params.roomId, roomName: doc.name, roomCreator: doc.creator, userId: uId, user: req.user});	
	  	else
	  		res.render("Errors/404.ejs");
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
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/login');
}

function checkIfLoggedIn(req) {
	if(req.isAuthenticated())
		return true;

	return false;
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
  	console.log("Generating room "+ i);

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