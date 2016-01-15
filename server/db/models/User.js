var	mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new Schema({
	_id: Number,
	name: String,
	username: String,
	beers: [{type: Schema.Types.ObjectId, ref: 'Beer'}]
});

var User = mongoose.model('User', userSchema);

module.exports = User;
