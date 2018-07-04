describe('When myComponent with data-jq-css binding inited', function() {
    var namespace = {};

    jasmine.getFixtures().fixturesPath = 'test';

    beforeEach(function() {

        loadFixtures('./fixtures/cssBinding.html');

        namespace.viewModel = {
			heading: 'myCssComponent',
            testOneCss: {
				a: true,
				b: true,
				c: true,
			},
			getTestTwoCss: function($data, oldValue, el) {
				return {
					e: true,
					f: true,
				}
			},
			updateView: function(opt) {
				this.APP.render(opt);
			}
        };

        namespace.myCssComponent = dataBind.init(
            $('[data-jq-comp="myCssComponent"]'),
            namespace.viewModel
        );
		
        namespace.myCssComponent.render();
    });

    afterEach(function() {
        // clean up all app/components
        for (var prop in namespace) {
            if (namespace.hasOwnProperty(prop)) {
                delete namespace[prop];
            }
        }
    });

    it('Then [data-jq-comp="myCssComponent"] should have render', function(done) {
        setTimeout(function() {
			var $heading = document.getElementById('myCssComponentHeading');
            expect($heading.textContent).toBe(namespace.viewModel.heading);
            done();
        }, 200);
    });
	
	it('should apply css bindings', function(done) {
        setTimeout(function() {
			var $testCssOne = document.getElementById('testCssOne');
			var testCssOneClassName = $testCssOne.className;
			var $testCssTwo = document.getElementById('testCssTwo');
			var testCssTwoClassName = $testCssTwo.className;
			
			expect(testCssOneClassName).toBe('testCssOne a b c');
			expect(testCssTwoClassName).toBe('testCssTwo x y z e f');
            done();
        }, 200);
    });
	
	it('should remove duplicated css', function(done) {
		namespace.viewModel.testOneCss = {
			a: true,
			b: false,
			c: true,
			testCssOne: true,
		};
		namespace.viewModel.updateView();
		
        setTimeout(function() {
			var $testCssOne = document.getElementById('testCssOne');
			var testCssOneClassName = $testCssOne.className;
			
			expect(testCssOneClassName).toBe('testCssOne a c');
            done();
        }, 200);
    });
	
});
