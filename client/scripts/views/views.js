var Backbone = require('backbone');
var _ = require('underscore');
var $ = require('jquery');
var imagesloaded = require('imagesloaded');
var templates = require('../templates');
var beers = require('../models/beer').beers;
var Beer = require('../models/beer').Beer;

// Backbone Views
var BeerPostView = Backbone.View.extend({
	className: 'col-md-4 beer-post',
	model: new Beer(),
	initialize: function() {},
	render: function() {
		this.$el.html(templates.beerPost(this.model.toJSON()));
		this.$el.css('background-image', 'url(' + this.model.attributes.photoUrl + ')');
		return this;
	}
});

var BeerListView = Backbone.View.extend({
	className: 'row beer-list',
	model: beers,

	initialize: function() {
		this.model.on('add', this.render, this);
		console.log(this.$el);
		this.$posts = $('.posts');
		this.$posts.append(templates.loading());
	},

	render: _.debounce(function() {
		this.counter = this.model.toArray().length;

		_.each(this.model.toArray(), function(beer) {
			this.$el.append((new BeerPostView({model: beer})).render().$el);
			imagesloaded(this.$el, {background: '.beer-post'}, function() {
				this.counter--;
				console.log(this.counter);
				if (this.counter === 0) {
					$('.loading__spinner').remove();
					this.$posts.append(this.$el);
				}
			}.bind(this));
		}.bind(this));
	})
});

var MainView = Backbone.View.extend({
	initialize: function() {
		this.$el.html(templates.main());
		this.render();
	},

	render: function() {
		$('body').html(this.$el);

		// TODO render posts when image loading completes
		var beerListView = new BeerListView();
	}
});

var mainView = new MainView();

module.exports = mainView;
