
/*var userSchema = mongoose.Schema({
  name: String
});

var User = mongoose.model('User', userSchema);
*/

exports.findAll = function(req, res){
  res.send([{name: 'user1'}, {name: 'user2'}]);
};

exports.findById = function(req, res){
  res.send({req.params.id, name: "The Name", description: "description"});
};