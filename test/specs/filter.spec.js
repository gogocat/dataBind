describe('Given [data-jq-comp="filter-component"] inited', () => {
    let namespace = {};

    jasmine.getFixtures().fixturesPath = 'test';

    beforeEach(function() {
        loadFixtures('./fixtures/filters.html');

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
                return this.APP.render(opt);
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

    it('Then [data-jq-comp="filter-component"] should render story with once filter and not intro', (done) => {
        setTimeout(() => {
            let $intro = document.getElementById('intro');
            let $story = document.getElementById('story');

            expect($intro).toBe(null);
            expect($story).not.toBe(null);
            expect($story.firstElementChild).not.toBe(null);
            done();
        }, 200);
    });

    it('Should render intro but not story section after update viewModel', (done) => {
        namespace.filterComponent.viewModel.renderIntro = true;
        namespace.filterComponent.viewModel.updateView().then(() => {
            let $intro = document.getElementById('intro');
            let $story = document.getElementById('story');
            expect($intro).not.toBe(null);
            expect($story).toBe(null);
            done();
        });
    });
});
