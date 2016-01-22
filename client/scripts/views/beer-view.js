var Backbone = require('backbone');
var _ = require('underscore');
var $ = require('jquery');
var beers = require('../models/beer').beers;
var Beer = require('../models/beer').Beer;

// CONFIGURATION
// can use {{ var }}
_.templateSettings = {
	interpolate: /\{\{(.+?)\}\}/g
};

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

		this.render();
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
module.exports = beersView;

