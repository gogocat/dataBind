describe('Given [data-jq-comp="blur-component"] initised', () => {
    const namespace = {};
    const testBlurValue = 'onBlur called';

    jasmine.getFixtures().fixturesPath = 'test';

    beforeEach(() => {
        loadFixtures('./fixtures/blurBinding.html');

        namespace.viewModel = {
            heading: 'blur component test',
            myData: 'blur component',
            onFocusFn: function(e, $element) {},
            onBlurFn: function(e, $element) {
                this.myData = testBlurValue;
                this.updateView();
            },
            updateView: function(opt) {
                this.APP.render(opt);
            },
        };

        namespace.blurComponent = dataBind.init(document.querySelector('[data-jq-comp="blur-component"]'), namespace.viewModel);
        namespace.blurComponent.render();
    });

    afterEach(() => {
        // clean up app
        // clean up all app/components
        for (const prop in namespace) {
            if (namespace.hasOwnProperty(prop)) {
                delete namespace[prop];
            }
        }
    });

    it('should render heading defined in viewModel', (done) => {
        setTimeout(() => {
            expect(document.getElementById('heading').textContent).toBe(namespace.viewModel.heading);
            expect(document.getElementById('blurInput').value).toBe(namespace.viewModel.myData);
            done();
        }, 200);
    });

    it('should update "blurInput" value after onBlur', (done) => {
        const $blurInput = document.getElementById('blurInput');
        setTimeout(() => {
            $blurInput.focus();
            $blurInput.blur();

            setTimeout(() => {
                expect($blurInput.value).toBe(testBlurValue);
                done();
            }, 200);
        }, 200);
    });
});
