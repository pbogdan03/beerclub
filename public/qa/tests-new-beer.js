suite('"New-beer" Page Tests', function() {
	test('page should contain a link to the home page', function() {
		assert($('a[href="/"]').length);
	});
});
