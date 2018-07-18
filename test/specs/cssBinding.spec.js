describe('Given [data-jq-comp="css-component"] inited', () => {
    let namespace = {};

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

        namespace.myCssComponent = dataBind.init($('[data-jq-comp="css-component"]'), namespace.viewModel);

        namespace.myCssComponent.render();
    });

    afterEach(() => {
        // clean up all app/components
        for (let prop in namespace) {
            if (namespace.hasOwnProperty(prop)) {
                delete namespace[prop];
            }
        }
    });

    it('Then [data-jq-comp="myCssComponent"] should have render', (done) => {
        setTimeout(() => {
            let $heading = document.getElementById('myCssComponentHeading');
            expect($heading.textContent).toBe(namespace.viewModel.heading);
            done();
        }, 200);
    });

    it('should apply css bindings', (done) => {
        setTimeout(() => {
            let $testCssOne = document.getElementById('testCssOne');
            let testCssOneClassName = $testCssOne.className;
            let $testCssTwo = document.getElementById('testCssTwo');
            let testCssTwoClassName = $testCssTwo.className;

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
            let $testCssOne = document.getElementById('testCssOne');
            let testCssOneClassName = $testCssOne.className;

            expect(testCssOneClassName).toBe('testCssOne a c');
            done();
        }, 200);
    });
});
