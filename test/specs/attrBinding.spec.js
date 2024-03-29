describe('Given [data-bind-comp="attr-component"] inited', () => {
    const namespace = {};
    const testAttr2Obj = {
        id: 'newId',
        ref: 'newRef2',
    };

    jasmine.getFixtures().fixturesPath = 'test';

    beforeEach(() => {
        loadFixtures('./fixtures/attrBinding.html');

        namespace.viewModel = {
            heading: 'Test data-if-binding',
            attr1: {
                style: 'width:300px',
                ref: 'newRef',
            },
            attr2: function($data) {
                return testAttr2Obj;
            },
            updateView: function(opt) {
                this.APP.render(opt);
            },
        };

        namespace.myAttrComponent = dataBind.init(document.querySelector('[data-bind-comp="attr-component"]'), namespace.viewModel);

        namespace.myAttrComponent.render();
    });

    afterEach(() => {
        // clean up all app/components
        for (const prop in namespace) {
            if (namespace.hasOwnProperty(prop)) {
                delete namespace[prop];
            }
        }
    });

    it('Then [data-bind-comp="myAttrComponent"] should have render', (done) => {
        setTimeout(() => {
            const $testAttr1 = document.getElementById('testAttr1');
            expect($testAttr1.textContent).toBe(namespace.viewModel.heading);
            done();
        }, 200);
    });

    it('Should update testAttr1 attributes', (done) => {
        setTimeout(function() {
            const $testAttr1 = document.getElementById('testAttr1');
            expect($testAttr1.getAttribute('ref')).toBe(namespace.viewModel.attr1.ref);
            expect($testAttr1.getAttribute('style')).toBe(namespace.viewModel.attr1.style);
            // check existing attribute untouch
            expect($testAttr1.getAttribute('id')).toBe('testAttr1');
            expect($testAttr1.getAttribute('class')).toBe('test');
            done();
        }, 200);
    });

    it('Should update testAttr2 attributes as viewModel function property', (done) => {
        setTimeout(() => {
            const $testAttr2 = document.getElementById(testAttr2Obj.id);
            expect($testAttr2.getAttribute('ref')).toBe(testAttr2Obj.ref);
            expect($testAttr2.getAttribute('id')).toBe(testAttr2Obj.id);
            done();
        }, 200);
    });

    it('Should update attribute when viewModel updated', (done) => {
        const updatedRef = 'updatedRef';
        const disabled = 'disabled';

        namespace.viewModel.attr1.ref = updatedRef;
        namespace.viewModel.attr1.disabled = disabled;
        namespace.myAttrComponent.render();

        setTimeout(() => {
            const $testAttr1 = document.getElementById('testAttr1');
            expect($testAttr1.getAttribute('ref')).toBe(updatedRef);
            expect($testAttr1.getAttribute('disabled')).toBe(disabled);
            expect($testAttr1.getAttribute('style')).toBe(namespace.viewModel.attr1.style);
            // check existing attribute untouch
            expect($testAttr1.getAttribute('id')).toBe('testAttr1');
            expect($testAttr1.getAttribute('class')).toBe('test');
            done();
        }, 200);
    });

    it('Should remove attribute when viewModel updated', (done) => {
        const updatedRef2 = 'updatedRef2';
        namespace.viewModel.attr1 = {
            ref: updatedRef2,
        };

        setTimeout(() => {
            const $testAttr1 = document.getElementById('testAttr1');
            expect($testAttr1.getAttribute('ref')).toBe(updatedRef2);
            expect($testAttr1.getAttribute('style')).toBe(null);
            // check existing attribute untouch
            expect($testAttr1.getAttribute('id')).toBe('testAttr1');
            expect($testAttr1.getAttribute('class')).toBe('test');
            done();
        }, 200);
    });
});
