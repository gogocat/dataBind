describe('When myTextComponent with data-jq-text binding inited', function() {
    var namespace = {};
	var testContent2 = 'text-binding content';

    jasmine.getFixtures().fixturesPath = 'test';

    beforeEach(function() {

        loadFixtures('./fixtures/textBinding.html');

        namespace.viewModel = {
			heading: 'my text-binding Component',
			description: 'test description',
			getTextContent: function() {
				return testContent2;
			},
			updateView: function(opt) {
				this.APP.render(opt);
			}
        };

        namespace.myTextComponent = dataBind.init(
            $('[data-jq-comp="myTextComponent"]'),
            namespace.viewModel
        );
		
        namespace.myTextComponent.render();
    });

    afterEach(function() {
        // clean up all app/components
        for (var prop in namespace) {
            if (namespace.hasOwnProperty(prop)) {
                delete namespace[prop];
            }
        }
    });

    it('Then [data-jq-comp="myTextComponent"] should have render', function(done) {
        setTimeout(function() {
			var $heading = document.getElementById('text-binding-heading');
			var $textBindingContent = document.getElementById('text-binding-content');
			var $textBindingContent2 = document.getElementById('text-binding-content2');
			
            expect($heading.textContent).toBe(namespace.viewModel.heading);
            expect($textBindingContent.textContent).toBe(namespace.viewModel.description);
			expect($textBindingContent2.textContent).toBe(testContent2);
			
            done();
        }, 200);
    });

});
