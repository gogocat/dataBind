describe('Given [data-jq-comp="if-component"] inited', () => {
    let namespace = {};

    jasmine.getFixtures().fixturesPath = 'test';

    beforeEach(function() {
        loadFixtures('./fixtures/filter.html');

        namespace.viewModel = {
            renderIntro: false,
            heading: 'Test data-if-binding',
            description: 'This is intro text',
            story: {
                title: 'Hansel and Gretel',
                description:
                    '"Hansel and Gretel" (also known as Hansel and Grettel, Hansel and Grethel, or Little Brother and Little Sister) is a well-known fairy tale of German origin.',
                link: 'https://www.google.com.au/search?q=Hansel+and+Gretel',
            },
            viewModelPropFn: function($data) {
                return typeof $data.viewModelPropFn === 'function';
            },
            undefinedViewModelPropFn: function($data) {
                return;
            },
            setStroylinkAttr: function($data) {
                return {
                    href: this.story.link,
                    title: this.story.title,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                };
            },
            updateView: function(opt) {
                this.APP.render(opt);
            },
        };

        namespace.filterComponent = dataBind.init($('[data-jq-comp="filter-component"]'), namespace.viewModel);

        namespace.filterComponent.render();
    });

    afterEach(() => {
        // clean up all app/components
        for (let prop in namespace) {
            if (namespace.hasOwnProperty(prop)) {
                delete namespace[prop];
            }
        }
    });

    it('Then [data-jq-comp="filter-component"] should render', (done) => {
        let hasIntroElementLength = namespace.viewModel.renderIntro ? 1 : 0;
        setTimeout(() => {
            expect($('#intro').length).toBe(hasIntroElementLength);
            expect($('#story').length).toBe(!namespace.viewModel.renderIntro);
            expect($('#story')[0].firstElementChild).not.toBe(null);
            done();
        }, 200);
    });

    it('Should not re-render intro with | once filter and negate story section', (done) => {
        namespace.filterComponent.viewModel.renderIntro = true;
        namespace.filterComponent.viewModel.updateView();

        setTimeout(() => {
            expect($('#intro').length).toBe(0);
            expect($('#story').length).toBe(1);
            expect($('#story')[0].firstElementChild).toBe(null);
            done();
        }, 200);
    });
});
