// CONFIGURATION

_.templateSettings = {
	interpolate: /\{\{(.+?)\}\}/g
};

// Backbone Model

var Beer = Backbone.Model.extend({
	defaults: {
		title: '',
		description: ''
	}
});

// Backbone Collection

var Beers = Backbone.Collection.extend({
	model: Beer,
	url: '/api/posts'
});

// instantiate two models

// var beer1 = new Beer({
// 	title: 'Morning Glory',
// 	description: 'Best beer ever...'
// });
// var beer2 = new Beer({
// 	title: 'Staropramen',
// 	description: 'Second best beer ever...'
// });

// instantiate a collection

var beers = new Beers();
// does a GET request to the url specified in the collection
beers.fetch();

// Backbone Views

var BeerView = Backbone.View.extend({
	model: new Beer(),
	initialize: function() {
		this.template = _.template($('.beers-list-template').html());
	},
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}
});

var BeersView = Backbone.View.extend({
	model: beers,
	el: $('.beers-list'),
	initialize: function() {
		this.model.on('add', this.render, this);
	},
	render: function() {
		var self = this;
		this.$el.html('');
		console.log('tried to render');
		_.each(this.model.toArray(), function(beer) {
			self.$el.append((new BeerView({model: beer})).render().$el);
		});
		return this;
	}
});

var beersView = new BeersView();
