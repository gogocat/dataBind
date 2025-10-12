import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/dom';

describe('Given [data-bind-comp="css-component"] inited', () => {
    const namespace = {};

        beforeEach(() => {
        loadFixture('test/fixtures/cssBinding.html');

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
            if (Object.prototype.hasOwnProperty.call(namespace, prop)) {
                delete namespace[prop];
            }
        }
    });

    it('Then [data-bind-comp="myCssComponent"] should have render', async () => {
        await waitFor(() => {
            const $heading = document.getElementById('myCssComponentHeading');
            expect($heading.textContent).toBe(namespace.viewModel.heading);
        }, { timeout: 500 });
    });

    it('should apply css bindings', async () => {
        await waitFor(() => {
            const $testCssOne = document.getElementById('testCssOne');
            const testCssOneClassName = $testCssOne.className;
            const $testCssTwo = document.getElementById('testCssTwo');
            const testCssTwoClassName = $testCssTwo.className;

            expect(testCssOneClassName).toBe('testCssOne a b c');
            expect(testCssTwoClassName).toBe('testCssTwo x y z e f');
        }, { timeout: 500 });
    });

    it('should remove duplicated css', async () => {
        namespace.viewModel.testOneCss.b = false;
        namespace.viewModel.updateView();

        await waitFor(() => {
            const $testCssOne = document.getElementById('testCssOne');
            const testCssOneClassName = $testCssOne.className;

            expect(testCssOneClassName).toBe('testCssOne a c');
        }, { timeout: 500 });
    });
});
