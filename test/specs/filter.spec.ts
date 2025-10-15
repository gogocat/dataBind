import {describe, it, expect, beforeEach, afterEach} from 'vitest';


describe('Given [data-bind-comp="filter-component"] inited', () => {
    const namespace: any = {};

    beforeEach(async () => {
        loadFixture('test/fixtures/filters.html');

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
            toDiscount(value: any) {
                return Number(value) * this.discountRate;
            },
            addGst(value: any) {
                return Number(value) * this.gstRate;
            },
            updateView(opt?: any) {
                return this.APP.render(opt);
            },
        };

        namespace.filterComponent = dataBind.init(document.querySelector('[data-bind-comp="filter-component"]'), namespace.viewModel);
        await namespace.filterComponent.render();
    });

    afterEach(() => {
        // clean up all app/components
        for (const prop in namespace) {
            if (Object.prototype.hasOwnProperty.call(namespace, prop)) {
                delete namespace[prop];
            }
        }
    });

    it('Then [data-bind-comp="filter-component"] should render story with once filter and not intro', () => {
        const $intro = document.getElementById('intro');
        const $story = document.getElementById('story');

        expect($intro).toBe(null);
        expect($story).not.toBe(null);
        expect($story!.firstElementChild).not.toBe(null);
    });

    it('Should render intro but not story section after update viewModel', async () => {
        namespace.filterComponent.viewModel.renderIntro = true;
        await namespace.filterComponent.viewModel.updateView();

        const $intro = document.getElementById('intro');
        const $story = document.getElementById('story');
        expect($intro).toBe(null);
        expect($story).toBe(null);
    });

    it('Should render story and stroyPrice pass through filters | toDiscount | addGst', () => {
        const $story = document.getElementById('story');
        const stroyPrice = document.getElementById('stroyPrice')!.textContent!;
        const discountedPrice = namespace.viewModel.toDiscount(namespace.viewModel.story.price);
        const finalPrice = namespace.viewModel.addGst(discountedPrice);

        expect($story).not.toBe(null);
        expect(Number(stroyPrice)).toBe(finalPrice);
    });
});
