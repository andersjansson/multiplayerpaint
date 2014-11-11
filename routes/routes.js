var RoomModel = require('../models/room');
var bcrypt   = require('bcrypt-nodejs');
module.exports = function(app, passport) {

	app.get('/', isLoggedIn, function(req, res) {
		res.render('index.ejs', {
			user : req.user
		});

	});

	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user
		});
	});

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	app.get('/login', function(req, res) {
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	app.get('/rooms', function(req, res) {
		res.render('index.ejs', {roomId: req.params.roomId});
		console.log("lololol rooooms");
	});
	app.post('/rooms',  function(req, res) {
		hashId = generateRoomId(10);

		var Room = RoomModel();

		Room.roomId = hashId;
		Room.save(function (err) {

  			if (err) console.log(err);
  			
  			else
  				res.redirect("/rooms/" + hashId);

		});
		//console.log("Room har skapats!!!!!!!!!");

	});

	app.get('/rooms/:roomId',isLoggedIn, function(req, res) {
	  roomExists(req.params.roomId, function(exists){
	  	if(exists)
	  		res.render("room.ejs", {roomId: req.params.roomId, user: req.user});	
	  	else
	  		res.render("404.ejs");
	  });
	});

	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/',
		failureRedirect : '/login',
		failureFlash : true
	}));

	app.get('/signup', function(req, res) {
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/',
		failureRedirect : '/signup',
		failureFlash : true
	}));
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

function roomExists(roomId,fn)
{
	var rId = roomId;

	RoomModel.findOne({roomId: rId}, function (err, doc){
	  if(doc !== null){
	  	fn(true);
	  }
	  else
	  	fn(false);
	  	
	});
}
