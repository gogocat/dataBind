describe('Given [data-jq-comp="show-component"] inited', () => {
    const namespace = {};
    const isVisible = function(el) {
        return el.offsetHeight > 0;
    };

    jasmine.getFixtures().fixturesPath = 'test';

    beforeEach(function() {
        loadFixtures('./fixtures/showBinding.html');

        namespace.viewModel = {
            heading: 'Test data-show-binding',
            displayHeading2: true,
            displayHeadingFn: function($data) {
                // test $data is refer to this viewModel;
                return typeof $data.displayHeadingFn === 'function';
            },
            displayHeading4: true,
            displayHeading5: true,
            displayHeading6: true,
            displayHeading7: true,

            updateView: function(opt) {
                this.APP.render(opt);
            },
        };

        namespace.myComponent = dataBind.init(document.querySelector('[data-jq-comp="show-component"]'), namespace.viewModel);

        namespace.myComponent.render();
    });

    afterEach(() => {
        // clean up all app/components
        for (const prop in namespace) {
            if (namespace.hasOwnProperty(prop)) {
                delete namespace[prop];
            }
        }
    });

    it('Then [data-jq-comp="myComponent"] should have render', (done) => {
        setTimeout(() => {
            expect(document.getElementById('heading').textContent).toBe(namespace.viewModel.heading);
            done();
        }, 200);
    });

    it('Should show or hide headings as defined in viewModel', (done) => {
        setTimeout(() => {
            const $heading2 = document.getElementById('heading2');
            const $heading2Invert = document.getElementById('heading2-invert');
            const $heading3 = document.getElementById('heading3');
            const $heading3Invert = document.getElementById('heading3-invert');
            const $heading4 = document.getElementById('heading4');
            const $heading5 = document.getElementById('heading5');
            const $heading6 = document.getElementById('heading6');
            const $heading7 = document.getElementById('heading7');

            expect($heading2.style.display).toBe('');
            expect(isVisible($heading2)).toBe(namespace.viewModel.displayHeading2);

            expect($heading2Invert.style.display).toBe('none');
            expect(isVisible($heading2Invert)).toBe(!namespace.viewModel.displayHeading2);

            expect($heading3.style.display).toBe('');
            expect(isVisible($heading3)).toBe(true);

            expect($heading3Invert.style.display).toBe('none');
            expect(isVisible($heading3Invert)).toBe(false);

            expect($heading4.style.display).toBe('');
            expect(isVisible($heading4)).toBe(namespace.viewModel.displayHeading4);

            expect($heading5.style.display).toBe('inline');
            expect(isVisible($heading5)).toBe(namespace.viewModel.displayHeading5);

            expect($heading6.style.display).toBe('');
            expect(isVisible($heading6)).toBe(namespace.viewModel.displayHeading6);

            expect($heading7.style.display).toBe('block');
            expect(isVisible($heading7)).toBe(namespace.viewModel.displayHeading7);

            done();
        }, 200);
    });

    it('Should hide headings2 after set displayHeading2 = false', (done) => {
        namespace.viewModel.displayHeading2 = false;
        namespace.viewModel.updateView();

        setTimeout(() => {
            const $heading2 = document.getElementById('heading2');
            expect($heading2.style.display).toBe('none');
            expect(isVisible($heading2)).toBe(namespace.viewModel.displayHeading2);
            done();
        }, 200);
    });

    it('Should hide heading2 but show heading2-invert as reverse boolean', (done) => {
        namespace.viewModel.displayHeading2 = false;
        namespace.viewModel.updateView();

        setTimeout(() => {
            const $heading2 = document.getElementById('heading2');
            const $heading2Invert = document.getElementById('heading2-invert');

            expect($heading2.style.display).toBe('none');
            expect(isVisible($heading2)).toBe(namespace.viewModel.displayHeading2);

            expect($heading2Invert.style.display).toBe('');
            expect(isVisible($heading2Invert)).toBe(!namespace.viewModel.displayHeading2);
            done();
        }, 200);
    });

    it('Should respect css rule display:flex after hide then show heading4', (done) => {
        namespace.viewModel.displayHeading4 = false;
        namespace.viewModel.updateView();

        setTimeout(() => {
            const $heading4 = document.getElementById('heading4');

            expect($heading4.style.display).toBe('none');
            expect(isVisible($heading4)).toBe(namespace.viewModel.displayHeading4);

            namespace.viewModel.displayHeading4 = true;
            namespace.viewModel.updateView();
            setTimeout(function() {
                const $heading4 = document.getElementById('heading4');

                expect($heading4.style.display).toBe('');
                expect(isVisible($heading4)).toBe(namespace.viewModel.displayHeading4);
                done();
            }, 300);
        }, 200);
    });

    it('Should not show heading8 as property is not defined in viewModel', (done) => {
        setTimeout(() => {
            const $heading8 = document.getElementById('heading8');

            expect($heading8.style.display).toBe('none');
            expect(isVisible($heading8)).toBe(false);
            done();
        }, 200);
    });
});
