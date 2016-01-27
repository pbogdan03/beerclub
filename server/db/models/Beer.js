var	mongoose = require('mongoose');

var Schema = mongoose.Schema;

var beerSchema = new Schema({
	title: String,
	photoUrl: String,
	instagramUrl: String,
	breweryUrl: String,
	description: String,
	untappdRating: Number,
	userRating: Number,
	date: Date,
	createdBy: {type: Number, ref: 'User'}
});

var Beer = mongoose.model('Beer', beerSchema);

module.exports = Beer;
