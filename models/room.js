var mongoose     = require('mongoose');
var lastModified = require('./plugins/lastModified');
//var tempdataURL  = require('./plugins/tempdataURL');
var Schema       = mongoose.Schema;

var RoomSchema   = new Schema({
	
  name: String,
  roomId: String,
  creator: Object,
  dataURL: String,
  password: String,
  isPrivate: Boolean

});

RoomSchema.plugin(lastModified, {index: true});
//RoomSchema.plugin(tempdataURL);

module.exports = mongoose.model('Room', RoomSchema);