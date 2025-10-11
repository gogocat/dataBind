import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/dom';

describe('Given [data-bind-comp="temp-component"] inited', () => {
    const namespace = {};

        beforeEach(async function() {
        loadFixture('test/fixtures/templateBinding.html');

        namespace.finishTemplateRender = 0;

        namespace.viewModel = {
            heading: 'Test data-bind-temp binding',
            description: 'This is template binding that also support underscore syntax',
            content: 'test text',
            contentNest1: {
                info: 'Nested content 1',
            },
            contentNest2: {
                info: 'Nested content 2',
            },
            contentNest3: {
                info: 'Nested content 3',
            },
            afterTemplateRender: function() {
                namespace.finishTemplateRender += 1;
            },
            updateView: function(opt) {
                this.APP.render(opt);
            },
        };

        namespace.myComponent = dataBind.init(document.querySelector('[data-bind-comp="temp-component"]'), namespace.viewModel);

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

    it('Then [data-bind-comp="temp-component"] should have render', async () => {
        await waitFor(() => {
            expect(document.getElementById('heading').textContent).toBe(namespace.viewModel.heading);
            // afterTemplateRender is called once per template completion
            // With nested templates now working, it's called multiple times
            expect(namespace.finishTemplateRender).toBeGreaterThan(0);
        }, { timeout: 500 });
    });

    it('Should render template1 with viewModel data', async () => {
        await waitFor(() => {
            const viewModel = namespace.viewModel;
            const $compSection = document.getElementById('compSection');
            const $heading = document.getElementById('heading');
            const $description = document.getElementById('description');
            const $content = document.getElementById('content');
            const $contentNest1 = document.getElementById('contentNest1');

            expect($compSection.children.length).not.toBe(0);
            expect($heading.textContent).toBe(viewModel.heading);
            expect($description.textContent).toBe(viewModel.description);
            expect($content.textContent).toBe(viewModel.content);
            expect($contentNest1.children.length).not.toBe(0);
        }, { timeout: 500 });
    });


    it('Should render nested templates with standard dataBindings', async () => {
        await waitFor(() => {
            const viewModel = namespace.viewModel;
            const $compSection = document.getElementById('compSection');
            const $contentNest1 = $compSection.querySelector('#contentNest1');
            const $contentNest1Info = $compSection.querySelector('#contentNest1Info');
            const $nestPrepend = $compSection.querySelector('#nestPrepend');
            const $nestAppend = $compSection.querySelector('#nestAppend');

            expect($contentNest1.children.length).not.toBe(0);
            expect($contentNest1Info.textContent).toBe(viewModel.contentNest1.info);
            expect($nestPrepend.children.length).toBeGreaterThan(1);
            expect($nestAppend.children.length).toBeGreaterThan(1);
        }, { timeout: 2000 });
    });


    it('Should render nested template prepend option', async () => {
        await waitFor(() => {
            const viewModel = namespace.viewModel;
            const $compSection = document.getElementById('compSection');
            const $nestPrepend = $compSection.querySelector('#nestPrepend');
            const $nestPrependHeading = $compSection.querySelector('#nestPrependHeading');
            const $contentNest2Info = $compSection.querySelector('#contentNest2Info');

            expect($nestPrepend.children.length).toBeGreaterThan(1);
            expect($nestPrependHeading).not.toBe(null);
            expect($nestPrependHeading.previousElementSibling).toBe($contentNest2Info);
            expect($contentNest2Info.textContent).toBe(viewModel.contentNest2.info);
        }, { timeout: 2000 });
    });


    it('Should render nested template append option', async () => {
        await waitFor(() => {
            const viewModel = namespace.viewModel;
            const $compSection = document.getElementById('compSection');
            const $nestAppend = $compSection.querySelector('#nestAppend');
            const $nestAppendHeading = $compSection.querySelector('#nestAppendHeading');
            const $contentNest3Info = $compSection.querySelector('#contentNest3Info');

            expect($nestAppend.children.length).toBeGreaterThan(1);
            expect($nestAppendHeading).not.toBe(null);
            expect($nestAppendHeading.nextElementSibling).toBe($contentNest3Info);
            expect($contentNest3Info.textContent).toBe(viewModel.contentNest3.info);
        }, { timeout: 2000 });
    });
});
