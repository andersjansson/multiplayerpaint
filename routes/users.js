




/*var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  //populateDB();
});

var userSchema = mongoose.Schema({
  name: String
});

var userModel = mongoose.model('User', userSchema);

exports.findAll = function(req, res){
  return userModel.find(function(err, users){
    if(!err)
      return res.send(users);
    else
      return console.log(err);
  });
};

exports.findById = function(req, res) {
  return userModel.findById(req.params.id, function(err, user){
    if(!err)
      return res.send(user);
    else
      return console.log(err);
  })
};

exports.addUser = function(req,res){
  res.send("addUser");
};

exports.updateUser = function(req,res){
  res.send("updateUser");
};

exports.deleteUser = function(req,res){
  res.send("deleteUser");
};



/*
  Populera databasen

var populateDB = function() {
  console.log("populating DB");
  var users = [
    {name: "user1", id: 1}, 
    {name: "user2", id: 2}, 
    {name: "user3", id: 3}, 
    {name: "user4", id: 4}
  ];

  console.log(users);

  users.forEach(function(user){
    userModel.create(user, function(err, user){
      if(err)
        console.log("failed to create user");
    })  
  })
  
};
*/
