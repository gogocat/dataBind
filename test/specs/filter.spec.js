describe('Given [data-jq-comp="filter-component"] inited', () => {
    let namespace = {};

    jasmine.getFixtures().fixturesPath = 'test';

    beforeEach(function(done) {
        loadFixtures('./fixtures/filters.html');

        namespace.viewModel = {
            renderIntro: false,
            heading: 'Test data-if-binding',
            description: 'This is intro text',
            discountRate: 0.8,
            gstRate: 1.1,
            story: {
                title: 'Hansel and Gretel',
                description:
                    '"Hansel and Gretel" (also known as Hansel and Grettel, Hansel and Grethel, or Little Brother and Little Sister) is a well-known fairy tale of German origin.',
                link: 'https://www.google.com.au/search?q=Hansel+and+Gretel',
                price: 100,
            },
            toDiscount: function(value) {
                return Number(value) * this.discountRate;
            },
            addGst: function(value) {
                return Number(value) * this.gstRate;
            },
            updateView: function(opt) {
                return this.APP.render(opt);
            },
        };

        // jasmine spies
        spyOn(namespace.viewModel.toDiscount, 'toDiscount');
        spyOn(namespace.viewModel.addGst, 'addGst');

        namespace.filterComponent = dataBind.init($('[data-jq-comp="filter-component"]'), namespace.viewModel);
        namespace.filterComponent.render().then(() => done());
    });

    afterEach(() => {
        // clean up all app/components
        for (let prop in namespace) {
            if (namespace.hasOwnProperty(prop)) {
                delete namespace[prop];
            }
        }
    });

    it('Then [data-jq-comp="filter-component"] should render story with once filter and not intro', () => {
        let $intro = document.getElementById('intro');
        let $story = document.getElementById('story');

        expect($intro).toBe(null);
        expect($story).not.toBe(null);
        expect($story.firstElementChild).not.toBe(null);
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

    it('Should render story and stroyPrice pass through filters | toDiscount | addGst', () => {
        let $story = document.getElementById('story');
        let stroyPrice = document.getElementById('stroyPrice').textContent;
        let discountedPrice = namespace.viewModel.toDiscount(namespace.viewModel.story.price);
        let finalPrice = namespace.viewModel.addGst(discountedPrice);

        expect($story).not.toBe(null);
        expect(namespace.viewModel.toDiscount).toHaveBeenCalledWith(namespace.viewModel.story.price);
        expect(namespace.viewModel.addGst).toHaveBeenCalledWith(discountedPrice);
        expect(stroyPrice).toBe(finalPrice);
    });
});
