describe('When myTextComponent with data-jq-text binding inited', function() {
    var namespace = {
        textBindingContent: 'text-binding content',
        textBindingContent2: 'text-binding content2',
    };

    jasmine.getFixtures().fixturesPath = 'test';

    beforeEach(function() {

        loadFixtures('./fixtures/textBinding.html');

        namespace.viewModel = {
			heading: 'my text-binding Component',
			getTextContent: function() {
                if (arguments.length) {
                    return namespace.textBindingContent2;
                }
                return namespace.textBindingContent;
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
            expect(document.getElementById('text-binding-heading').textContent).toBe(namespace.viewModel.heading);
            expect(document.getElementById('text-binding-content').textContent).toBe(namespace.textBindingContent);
            expect(document.getElementById('text-binding-content2').textContent).toBe(namespace.textBindingContent2);
            done();
        }, 200);
    });

});
