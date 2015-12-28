// Backbone Model

var User = Backbone.Model.extend({
	defaults: {
		name: '',
		username: ''
	}
});

var Beer = Backbone.Model.extend({
	defaults: {
		title: '',
		description: ''
	}
});

// Backbone Collection

var Users = Backbone.Collection.extend({});
var Beers = Backbone.Collection.extend({});

// instantiate two models

var user1 = new User({
	name: 'Bogdan',
	username: 'bogdan'
});

var beer1 = new Beer({
	title: 'Morning Glory',
	description: 'Best beer ever...'
});
