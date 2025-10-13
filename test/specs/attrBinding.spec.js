import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/dom';

describe('Given [data-bind-comp="attr-component"] inited', () => {
    const namespace = {};
    const testAttr2Obj = {
        id: 'newId',
        ref: 'newRef2',
    };

    beforeEach(() => {
        loadFixture('test/fixtures/attrBinding.html');

        namespace.viewModel = {
            heading: 'Test data-if-binding',
            attr1: {
                style: 'width:300px',
                ref: 'newRef',
            },
            attr2: function(_$data) {
                return testAttr2Obj;
            },
            updateView: function(opt) {
                this.APP.render(opt);
            },
        };

        namespace.myAttrComponent = dataBind.init(document.querySelector('[data-bind-comp="attr-component"]'), namespace.viewModel);

        namespace.myAttrComponent.render();
    });

    afterEach(() => {
        // clean up all app/components
        for (const prop in namespace) {
            if (Object.prototype.hasOwnProperty.call(namespace, prop)) {
                delete namespace[prop];
            }
        }
    });

    it('Then [data-bind-comp="myAttrComponent"] should have render', async () => {
        await waitFor(() => {
            const $testAttr1 = document.getElementById('testAttr1');
            expect($testAttr1.textContent).toBe(namespace.viewModel.heading);
        }, { timeout: 500 });
    });

    it('Should update testAttr1 attributes', async () => {
        await waitFor(() => {
            const $testAttr1 = document.getElementById('testAttr1');
            expect($testAttr1.getAttribute('ref')).toBe(namespace.viewModel.attr1.ref);
            expect($testAttr1.getAttribute('style')).toBe(namespace.viewModel.attr1.style);
            // check existing attribute untouch
            expect($testAttr1.getAttribute('id')).toBe('testAttr1');
            expect($testAttr1.getAttribute('class')).toBe('test');
        }, { timeout: 500 });
    });

    it('Should update testAttr2 attributes as viewModel function property', async () => {
        await waitFor(() => {
            const $testAttr2 = document.getElementById(testAttr2Obj.id);
            expect($testAttr2.getAttribute('ref')).toBe(testAttr2Obj.ref);
            expect($testAttr2.getAttribute('id')).toBe(testAttr2Obj.id);
        }, { timeout: 500 });
    });

    it('Should update attribute when viewModel updated', async () => {
        const updatedRef = 'updatedRef';
        const disabled = 'disabled';
        namespace.viewModel.attr1 = {
            ref: updatedRef,
            disabled: disabled,
            style: namespace.viewModel.attr1.style,
        };

        await waitFor(() => {
            const $testAttr1 = document.getElementById('testAttr1');
            expect($testAttr1.getAttribute('ref')).toBe(updatedRef);
            expect($testAttr1.getAttribute('disabled')).toBe(disabled);
            expect($testAttr1.getAttribute('style')).toBe(namespace.viewModel.attr1.style);
            // check existing attribute untouch
            expect($testAttr1.getAttribute('id')).toBe('testAttr1');
            expect($testAttr1.getAttribute('class')).toBe('test');
        }, { timeout: 500 });
    });

    it('Should remove attribute when viewModel updated', async () => {
        const updatedRef2 = 'updatedRef2';
        namespace.viewModel.attr1 = {
            ref: updatedRef2,
        };

        await waitFor(() => {
            const $testAttr1 = document.getElementById('testAttr1');
            expect($testAttr1.getAttribute('ref')).toBe(updatedRef2);
            expect($testAttr1.getAttribute('style')).toBe(null);
            // check existing attribute untouch
            expect($testAttr1.getAttribute('id')).toBe('testAttr1');
            expect($testAttr1.getAttribute('class')).toBe('test');
        }, { timeout: 500 });
    });
});
