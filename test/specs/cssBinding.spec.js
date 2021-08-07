describe('Given [data-bind-comp="css-component"] inited', () => {
    const namespace = {};

    jasmine.getFixtures().fixturesPath = 'test';

    beforeEach(() => {
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
                };
            },
            updateView: function(opt) {
                this.APP.render(opt);
            },
        };

        namespace.myCssComponent = dataBind.init(document.querySelector('[data-bind-comp="css-component"]'), namespace.viewModel);

        namespace.myCssComponent.render();
    });

    afterEach(() => {
        // clean up all app/components
        for (const prop in namespace) {
            if (namespace.hasOwnProperty(prop)) {
                delete namespace[prop];
            }
        }
    });

    it('Then [data-bind-comp="myCssComponent"] should have render', (done) => {
        setTimeout(() => {
            const $heading = document.getElementById('myCssComponentHeading');
            expect($heading.textContent).toBe(namespace.viewModel.heading);
            done();
        }, 200);
    });

    it('should apply css bindings', (done) => {
        setTimeout(() => {
            const $testCssOne = document.getElementById('testCssOne');
            const testCssOneClassName = $testCssOne.className;
            const $testCssTwo = document.getElementById('testCssTwo');
            const testCssTwoClassName = $testCssTwo.className;

            expect(testCssOneClassName).toBe('testCssOne a b c');
            expect(testCssTwoClassName).toBe('testCssTwo x y z e f');
            done();
        }, 200);
    });

    it('should remove duplicated css', (done) => {
        namespace.viewModel.testOneCss = {
            a: true,
            b: false,
            c: true,
            testCssOne: true,
        };
        namespace.viewModel.updateView();

        setTimeout(() => {
            const $testCssOne = document.getElementById('testCssOne');
            const testCssOneClassName = $testCssOne.className;

            expect(testCssOneClassName).toBe('testCssOne a c');
            done();
        }, 200);
    });
});
