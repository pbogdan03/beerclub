// Backbone Model

var Beer = Backbone.Model.extend({
	defaults: {
		title: '',
		description: ''
	}
});

// Backbone Collection

var Beers = Backbone.Collection.extend({});

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
		_.each(this.model.toArray(), function(beer) {
			self.$el.append((new BeerView({model: beer})).render().$el);
		});
		return this;
	}
});

var beersView = new BeersView();

$(document).ready(function() {
	$('.add-beer').on('click', function() {
		var beer = new Beer({
			title: $('.title-input').val(),
			description: $('.description-input').val()
		});
		$('.title-input').val('');
		$('.description-input').val('');
		beers.add(beer);
	});
});
