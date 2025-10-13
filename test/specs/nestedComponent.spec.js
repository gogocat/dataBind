import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import {waitFor} from '@testing-library/dom';

describe('When nested data-bind-comp initised', () => {
    const namespace = {};

    beforeEach(() => {
        loadFixture('test/fixtures/nestedComponents.html');

        namespace.parentComponentVM = {
            title: 'parent component title',
            description: 'parent component description',
        };

        namespace.childComponentVM = {
            title: 'child component title',
            description: 'child component description',
        };

        namespace.grandChildComponentVM = {
            title: 'grand child component title',
            description: 'grand child component description',
        };

        namespace.slibingChildComponentVM = {
            title: 'slibing child component title',
            description: 'slibing child component description',
        };

        const parentComponent = dataBind.init(document.querySelector('[data-bind-comp="parent-component"]'), namespace.parentComponentVM);
        const childComponent = dataBind.init(document.querySelector('[data-bind-comp="child-component"]'), namespace.childComponentVM);
        const grandChildComponent = dataBind.init(
            document.querySelector('[data-bind-comp="grand-child-component"]'),
            namespace.grandChildComponentVM,
        );
        const slibingChildComponent = dataBind.init(
            document.querySelector('[data-bind-comp="slibing-child-component"]'),
            namespace.slibingChildComponentVM,
        );

        parentComponent.render();
        childComponent.render();
        grandChildComponent.render();
        slibingChildComponent.render();
    });

    afterEach(() => {
        // clean up all app/components
        for (const prop in namespace) {
            if (Object.prototype.hasOwnProperty.call(namespace, prop)) {
                delete namespace[prop];
            }
        }
    });

    it('Then #parent-component-title and #parent-component-description should render according parentComponentVM', async () => {
        await waitFor(() => {
            expect(document.querySelector('#parent-component-title').textContent).toBe(namespace.parentComponentVM.title);
            expect(document.querySelector('#parent-component-description').textContent).toBe(namespace.parentComponentVM.description);
        }, {timeout: 500});
    });


    it('Then #child-component-title and #child-component-description should render according childComponentVM', async () => {
        await waitFor(() => {
            expect(document.querySelector('#child-component-title').textContent).toBe(namespace.childComponentVM.title);
            expect(document.querySelector('#child-component-description').textContent).toBe(namespace.childComponentVM.description);
        }, {timeout: 500});
    });


    it('Then #grand-child-component-title and #grand-child-component-description should render according grandChildComponentVM', async () => {
        await waitFor(() => {
            expect(document.querySelector('#grand-child-component-title').textContent).toBe(namespace.grandChildComponentVM.title);
            expect(document.querySelector('#grand-child-component-description').textContent).toBe(namespace.grandChildComponentVM.description);
        }, {timeout: 500});
    });


    it('Then #slibing-child-component-title and #slibing-child-component-description should render according slibingChildComponentVM', async () => {
        await waitFor(() => {
            expect(document.querySelector('#slibing-child-component-title').textContent).toBe(namespace.slibingChildComponentVM.title);
            expect(document.querySelector('#slibing-child-component-description').textContent).toBe(
                namespace.slibingChildComponentVM.description,
            );
        }, {timeout: 500});
    });
});
