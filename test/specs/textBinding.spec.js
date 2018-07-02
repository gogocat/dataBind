describe('When myTextComponent with data-jq-text binding inited', function() {
    var namespace = {};

    jasmine.getFixtures().fixturesPath = 'test';

    beforeEach(function() {

        loadFixtures('./fixtures/textBinding.html');

        namespace.viewModel = {
			heading: 'my text-binding Component',
			getTextContent: function() {
				return 'text-binding content',
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
            expect($('#intro-heading').text()).toBe(namespace.viewModel.heading);
            expect($('#intro-description').text()).toBe(namespace.viewModel.description);
            done();
        }, 200);
    });

});
