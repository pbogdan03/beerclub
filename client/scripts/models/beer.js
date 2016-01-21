// Backbone Model

var Beer = Backbone.Model.extend({});

// Backbone Collection

var Beers = Backbone.Collection.extend({
	model: Beer,
	url: '/api/posts'
});

// instantiate a collection

var beers = new Beers();
// does a GET request to the url specified in the collection
beers.fetch();

