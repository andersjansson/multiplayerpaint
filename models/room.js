var mongoose     = require('mongoose');
var lastModified = require('./plugins/lastModified');
var Schema       = mongoose.Schema;
//var tempdataURL  = require('./plugins/tempdataURL');

var RoomSchema   = new Schema({
	
  name: String,
  roomId: String,
  creator: Object,
  dataURL: String,
  password: String,
  isPrivate: Boolean,
  userCount: {type: Number, default: 0}

});

RoomSchema.plugin(lastModified, {index: true});
//RoomSchema.plugin(tempdataURL);

module.exports = mongoose.model('Room', RoomSchema);