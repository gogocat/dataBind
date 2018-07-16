describe('Given [data-jq-comp="blur-component"] initised', function() {
    var namespace = {};
	var testBlurValue = 'onBlur called';

    jasmine.getFixtures().fixturesPath = 'test';

    beforeEach(function() {
        loadFixtures('./fixtures/blurBinding.html');
		
		namespace.viewModel= {
			heading: 'blur component test',
			myData: 'blur component',
			onFocusFn: function(e, $element) {
				
			},
			onBlurFn: function(e, $element) {
				this.myData = testBlurValue;
				this.updateView();
			},
			updateView: function(opt) {
				this.APP.render(opt);
			}
		};
	
        namespace.blurComponent = dataBind.init(
            $('[data-jq-comp="blur-component"]'),
            namespace.viewModel
        );
        namespace.blurComponent.render();
    });

    afterEach(function() {
        // clean up app
        // clean up all app/components
        for (var prop in namespace) {
            if (namespace.hasOwnProperty(prop)) {
                delete namespace[prop];
            }
        }
    });

    it('should render heading defined in viewModel', function(done) {
        setTimeout(function() {
            expect(document.getElementById('heading').textContent).toBe(namespace.viewModel.heading);
			expect(document.getElementById('blurInput').value).toBe(namespace.viewModel.myData);
            done();
        }, 200);
    });
	
	it('should update "blurInput" value after onBlur', function(done) {
		var $blurInput = document.getElementById('blurInput');
        setTimeout(function() {
			$blurInput.focus();
			$blurInput.blur();
			
			setTimeout(function() {
				expect($blurInput.value).toBe(testBlurValue);
				done();
			}, 200);
        }, 200);
    });
	
	xit('should not call onBlurFn when element removed', function(done) {
		document.getElementById('blurInput').remove();
		namespace.viewModel.updateView();
		// TODO: test when element removed and re-render should not execute binding since cache.el should be null
        setTimeout(function() {
			setTimeout(function() {
				expect(false).toBe(false);
				done();
			}, 200);
        }, 200);
    });
});