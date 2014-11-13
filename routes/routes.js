var RoomModel = require('../models/room');
var bcrypt   = require('bcrypt-nodejs');

module.exports = function(app, passport) {

	app.get('/', function(req, res) {
		res.render('index.ejs', {
			user : req.user
		});

	});

	app.get('/profile', function(req, res) {

		var rooms = RoomModel.findOne({ roomId : 'roomId'}).where('creator').equals(req.user.id);

		res.render('Profile/profile.ejs', {
			user : req.user,
			Userrooms: rooms,
		});
		console.log(rooms);
		console.log(req.user.id);
	});

	app.get('/profile/settings', function(req, res){
		res.render('Profile/profile_settings.ejs', {
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

	app.get('/rooms', function(req, res) {
		res.render('index.ejs', {roomId: req.params.roomId, roomName: req.body.roomName});
		console.log("lololol rooooms");
	});
	app.post('/rooms',  function(req, res) {

		hashId = generateRoomId(10);

		var Room = RoomModel();
		console.log(req.body.roomName);
		console.log(req.body.password);

		console.log(req.params);
		Room.roomId = hashId;
		Room.name = req.body.roomName;
		Room.password = req.body.password;
		Room.isPrivate = true;
		Room.creator = req.user.id;

		Room.save(function (err) {

  			if (err) console.log(err);
  			
  			else
  				res.redirect("/rooms/" + hashId);
		});
	});

	app.get('/rooms/:roomId', function(req, res) {
	  getRoom(req.params.roomId, function(doc){
	  	if(doc)
	  		res.render("Rooms/room.ejs", {roomId: req.params.roomId, roomName: doc.name, user: req.user});
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
		res.render('/Auth/signup.ejs', { message: req.flash('signupMessage') });
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
