import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/dom';

describe('Given [data-bind-comp="blur-component"] initised', () => {
    const namespace = {};
    const testBlurValue = 'onBlur called';

    beforeEach(async () => {
        loadFixture('test/fixtures/blurBinding.html');

        namespace.viewModel = {
            heading: 'blur component test',
            myData: 'blur component',
            onFocusFn: function(_e, _$element) {},
            onBlurFn: function(_e, _$element) {
                this.myData = testBlurValue;
                this.updateView();
            },
            updateView: function(opt) {
                this.APP.render(opt);
            },
        };

        namespace.blurComponent = dataBind.init(document.querySelector('[data-bind-comp="blur-component"]'), namespace.viewModel);
        await namespace.blurComponent.render();
    });

    afterEach(() => {
        // clean up app
        // clean up all app/components
        for (const prop in namespace) {
            if (Object.prototype.hasOwnProperty.call(namespace, prop)) {
                delete namespace[prop];
            }
        }
    });

    it('should render heading defined in viewModel', async () => {
        await waitFor(() => {
            expect(document.getElementById('heading').textContent).toBe(namespace.viewModel.heading);
            expect(document.getElementById('blurInput').value).toBe(namespace.viewModel.myData);
        }, { timeout: 500 });
    });

    it('should update "blurInput" value after onBlur', async () => {
        await waitFor(() => {
            const $blurInput = document.getElementById('blurInput');
            expect($blurInput).not.toBeNull();
        }, { timeout: 500 });

        const $blurInput = document.getElementById('blurInput');

        // Use the test helper to simulate blur event
        simulateBlur($blurInput);

        await waitFor(() => {
            expect($blurInput.value).toBe(testBlurValue);
        }, { timeout: 500 });
    });
});
