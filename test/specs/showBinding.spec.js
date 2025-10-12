import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/dom';

describe('Given [data-bind-comp="show-component"] inited', () => {
    const namespace = {};
    const isVisible = function(el) {
        // In jsdom, offsetHeight is always 0, so check display style instead
        return el.style.display !== 'none';
    };

        beforeEach(async function() {
        loadFixture('test/fixtures/showBinding.html');

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

        namespace.myComponent = dataBind.init(document.querySelector('[data-bind-comp="show-component"]'), namespace.viewModel);

        await namespace.myComponent.render();
    });

    afterEach(() => {
        // clean up all app/components
        for (const prop in namespace) {
            if (Object.prototype.hasOwnProperty.call(namespace, prop)) {
                delete namespace[prop];
            }
        }
    });

    it('Then [data-bind-comp="myComponent"] should have render', async () => {
        await waitFor(() => {
            expect(document.getElementById('heading').textContent).toBe(namespace.viewModel.heading);
        }, { timeout: 500 });
    });

    it('Should show or hide headings as defined in viewModel', async () => {
        await waitFor(() => {
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
        }, { timeout: 500 });
    });


    it('Should hide headings2 after set displayHeading2 = false', async () => {
        namespace.viewModel.displayHeading2 = false;
        await namespace.myComponent.render();

        await waitFor(() => {
            const $heading2 = document.getElementById('heading2');
            expect($heading2.style.display).toBe('none');
            expect(isVisible($heading2)).toBe(namespace.viewModel.displayHeading2);
        }, { timeout: 500 });
    });


    it('Should hide heading2 but show heading2-invert as reverse boolean', async () => {
        namespace.viewModel.displayHeading2 = false;
        await namespace.myComponent.render();

        await waitFor(() => {
            const $heading2 = document.getElementById('heading2');
            const $heading2Invert = document.getElementById('heading2-invert');

            expect($heading2.style.display).toBe('none');
            expect(isVisible($heading2)).toBe(namespace.viewModel.displayHeading2);

            expect($heading2Invert.style.display).toBe('');
            expect(isVisible($heading2Invert)).toBe(!namespace.viewModel.displayHeading2);
        }, { timeout: 500 });
    });


    it('Should respect css rule display:flex after hide then show heading4', async () => {
        // First hide heading4
        namespace.viewModel.displayHeading4 = false;
        await namespace.myComponent.render();

        await waitFor(() => {
            const $heading4 = document.getElementById('heading4');
            expect($heading4.style.display).toBe('none');
            expect(isVisible($heading4)).toBe(false);
        }, { timeout: 500 });

        // Then show it again
        namespace.viewModel.displayHeading4 = true;
        await namespace.myComponent.render();

        await waitFor(() => {
            const $heading4 = document.getElementById('heading4');
            expect($heading4.style.display).toBe('');
            expect(isVisible($heading4)).toBe(true);
        }, { timeout: 500 });
    });

    it('Should not show heading8 as property is not defined in viewModel', async () => {
        await waitFor(() => {
            const $heading8 = document.getElementById('heading8');

            expect($heading8.style.display).toBe('none');
            expect(isVisible($heading8)).toBe(false);
        }, { timeout: 500 });
    });
});
