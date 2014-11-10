var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PaintingSchema   = new Schema({
	name: String,
  roomId: String,
  creator: Object,
  dataURL: String,
  password: String,
  isPrivate: Boolean
});

module.exports = mongoose.model('Painting', PaintingSchema);