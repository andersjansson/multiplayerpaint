var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PaintingSchema   = new Schema({
	name: String
});

module.exports = mongoose.model('Painting', PaintingSchema);