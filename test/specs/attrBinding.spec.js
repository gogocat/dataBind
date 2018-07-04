describe('When myAttrComponent with data-jq-if binding inited', function() {
    var namespace = {};
	var testAttr2Obj = {
			id: 'newId',
			ref: 'newRef2'
		};

    jasmine.getFixtures().fixturesPath = 'test';

    beforeEach(function() {

        loadFixtures('./fixtures/attrBinding.html');

        namespace.viewModel = {
			heading: 'Test data-if-binding',
			attr1: {
				style: 'width:300px',
				ref: 'newRef'
			},
			attr2: function($data) {
				return testAttr2Obj;
			},
			updateView: function(opt) {
				this.APP.render(opt);
			}
        };

        namespace.myAttrComponent = dataBind.init(
            $('[data-jq-comp="myAttrComponent"]'),
            namespace.viewModel
        );
		
        namespace.myAttrComponent.render();
    });

    afterEach(function() {
        // clean up all app/components
        for (var prop in namespace) {
            if (namespace.hasOwnProperty(prop)) {
                delete namespace[prop];
            }
        }
    });

    it('Then [data-jq-comp="myAttrComponent"] should have render', function(done) {
        setTimeout(function() {
			var $testAttr1 = document.getElementById('testAttr1');
            expect($testAttr1.textContent).toBe(namespace.viewModel.heading);
            done();
        }, 200);
    });
	
	it('Should update testAttr1 attributes', function(done) {
        setTimeout(function() {
			var $testAttr1 = document.getElementById('testAttr1');
            expect($testAttr1.getAttribute('ref')).toBe(namespace.viewModel.attr1.ref);
			expect($testAttr1.getAttribute('style')).toBe(namespace.viewModel.attr1.style);
			// check existing attribute untouch
			expect($testAttr1.getAttribute('id')).toBe('testAttr1');
			expect($testAttr1.getAttribute('class')).toBe('test');
            done();
        }, 200);
    });
	
	it('Should update testAttr2 attributes as viewModel function property', function(done) {
        setTimeout(function() {
			var $testAttr2 = document.getElementById(testAttr2Obj.id);
            expect($testAttr2.getAttribute('ref')).toBe(testAttr2Obj.ref);
			expect($testAttr2.getAttribute('id')).toBe(testAttr2Obj.id);
            done();
        }, 200);
    });
	
});
