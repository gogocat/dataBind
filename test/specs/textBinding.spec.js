describe('Given [data-jq-comp="text-component"] inited', () => {
    let namespace = {};
    let testContent2 = 'text-binding content';

    jasmine.getFixtures().fixturesPath = 'test';

    beforeEach(() => {
        loadFixtures('./fixtures/textBinding.html');

        namespace.viewModel = {
            heading: 'my text-binding Component',
            description: 'test description',
            getTextContent: function() {
                return testContent2;
            },
            updateView: function(opt) {
                this.APP.render(opt);
            },
        };

        namespace.myTextComponent = dataBind.init($('[data-jq-comp="text-component"]'), namespace.viewModel);

        namespace.myTextComponent.render();
    });

    afterEach(() => {
        // clean up all app/components
        for (let prop in namespace) {
            if (namespace.hasOwnProperty(prop)) {
                delete namespace[prop];
            }
        }
    });

    it('Then [data-jq-comp="myTextComponent"] should have render', (done) => {
        setTimeout(() => {
            let $heading = document.getElementById('text-binding-heading');
            let $textBindingContent = document.getElementById('text-binding-content');
            let $textBindingContent2 = document.getElementById('text-binding-content2');

            expect($heading.textContent).toBe(namespace.viewModel.heading);
            expect($textBindingContent.textContent).toBe(namespace.viewModel.description);
            expect($textBindingContent2.textContent).toBe(testContent2);

            done();
        }, 200);
    });
});
