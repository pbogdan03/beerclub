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
	className: 'col-md-4 beer-post',
	model: new Beer(),
	initialize: function() {
		this.beerPost = this.$('.beer-post');
		this.template = _.template($('.beer-post-template').html());
	},
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}
});

var BeersView = Backbone.View.extend({
	model: beers,

	initialize: function() {
		this.model.on('add', this.render, this);
		this.template = _.template($('.beers-template').html());
		this.$el.html(this.template);

		this.$beersList = this.$('.beers-list');
		this.$updatePostBtn = this.$('.instauth');
	},

	events: {
		'click .instauth': 'addLoading'
	},

	render: function() {
		this.$beersList.html('');
		console.log('tried to render');
		_.each(this.model.toArray(), function(beer) {
			this.$beersList.append((new BeerView({model: beer})).render().$el);
		}.bind(this));

		$('body').append(this.$el);

		return this;
	},

	addLoading: function(e) {
		$(e.target).addClass('loading');
	}
});

var beersView = new BeersView();
