import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import {waitFor} from '@testing-library/dom';

describe('Given [data-bind-comp="temp-component"] inited', () => {
    const namespace: any = {};

    beforeEach(async () => {
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
            afterTemplateRender() {
                namespace.finishTemplateRender += 1;
            },
            updateView(opt?: any) {
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
            expect(document.getElementById('heading')!.textContent).toBe(namespace.viewModel.heading);
            // afterTemplateRender is called once per template completion
            // With nested templates now working, it's called multiple times
            expect(namespace.finishTemplateRender).toBeGreaterThan(0);
        }, {timeout: 500});
    });

    it('Should render template1 with viewModel data', async () => {
        await waitFor(() => {
            const viewModel = namespace.viewModel;
            const $compSection = document.getElementById('compSection')!;
            const $heading = document.getElementById('heading')!;
            const $description = document.getElementById('description')!;
            const $content = document.getElementById('content')!;
            const $contentNest1 = document.getElementById('contentNest1')!;

            expect($compSection.children.length).not.toBe(0);
            expect($heading.textContent).toBe(viewModel.heading);
            expect($description.textContent).toBe(viewModel.description);
            expect($content.textContent).toBe(viewModel.content);
            expect($contentNest1.children.length).not.toBe(0);
        }, {timeout: 500});
    });


    it('Should render nested templates with standard dataBindings', async () => {
        await waitFor(() => {
            const viewModel = namespace.viewModel;
            const $compSection = document.getElementById('compSection')!;
            const $contentNest1 = $compSection.querySelector('#contentNest1')!;
            const $contentNest1Info = $compSection.querySelector('#contentNest1Info')!;
            const $nestPrepend = $compSection.querySelector('#nestPrepend')!;
            const $nestAppend = $compSection.querySelector('#nestAppend')!;

            expect($contentNest1.children.length).not.toBe(0);
            expect($contentNest1Info.textContent).toBe(viewModel.contentNest1.info);
            expect($nestPrepend.children.length).toBeGreaterThan(1);
            expect($nestAppend.children.length).toBeGreaterThan(1);
        }, {timeout: 2000});
    });


    it('Should render nested template prepend option', async () => {
        await waitFor(() => {
            const viewModel = namespace.viewModel;
            const $compSection = document.getElementById('compSection')!;
            const $nestPrepend = $compSection.querySelector('#nestPrepend')!;
            const $nestPrependHeading = $compSection.querySelector('#nestPrependHeading');
            const $contentNest2Info = $compSection.querySelector('#contentNest2Info')!;

            expect($nestPrepend.children.length).toBeGreaterThan(1);
            expect($nestPrependHeading).not.toBe(null);
            expect($nestPrependHeading!.previousElementSibling).toBe($contentNest2Info);
            expect($contentNest2Info.textContent).toBe(viewModel.contentNest2.info);
        }, {timeout: 2000});
    });


    it('Should render nested template append option', async () => {
        await waitFor(() => {
            const viewModel = namespace.viewModel;
            const $compSection = document.getElementById('compSection')!;
            const $nestAppend = $compSection.querySelector('#nestAppend')!;
            const $nestAppendHeading = $compSection.querySelector('#nestAppendHeading');
            const $contentNest3Info = $compSection.querySelector('#contentNest3Info')!;

            expect($nestAppend.children.length).toBeGreaterThan(1);
            expect($nestAppendHeading).not.toBe(null);
            expect($nestAppendHeading!.nextElementSibling).toBe($contentNest3Info);
            expect($contentNest3Info.textContent).toBe(viewModel.contentNest3.info);
        }, {timeout: 2000});
    });

    it('Should perform minimal DOM updates on re-render (preserve unchanged elements)', async () => {
        // Wait for initial render
        await waitFor(() => {
            expect(document.getElementById('heading')).not.toBe(null);
        }, {timeout: 500});

        // Get reference to existing DOM elements
        const $headingBefore = document.getElementById('heading');
        const $descriptionBefore = document.getElementById('description');
        const $contentBefore = document.getElementById('content');

        // Mark elements to track if they are replaced
        $headingBefore!.setAttribute('data-test-marker', 'original-heading');
        $descriptionBefore!.setAttribute('data-test-marker', 'original-description');
        $contentBefore!.setAttribute('data-test-marker', 'original-content');

        // Change only one property in viewModel
        namespace.viewModel.content = 'updated text';

        // Re-render
        await namespace.myComponent.render();

        await waitFor(() => {
            const $headingAfter = document.getElementById('heading');
            const $descriptionAfter = document.getElementById('description');
            const $contentAfter = document.getElementById('content');

            // Verify heading and description are the SAME DOM elements (not replaced)
            expect($headingAfter).toBe($headingBefore);
            expect($descriptionAfter).toBe($descriptionBefore);

            // These elements should still have their original markers
            expect($headingAfter!.getAttribute('data-test-marker')).toBe('original-heading');
            expect($descriptionAfter!.getAttribute('data-test-marker')).toBe('original-description');

            // Content should be the same element but with updated text
            expect($contentAfter).toBe($contentBefore);
            expect($contentAfter!.textContent).toBe('updated text');
            expect($contentAfter!.getAttribute('data-test-marker')).toBe('original-content');
        }, {timeout: 500});
    });

    it('Should replace only changed attributes during re-render', async () => {
        // Wait for initial render
        await waitFor(() => {
            expect(document.getElementById('heading')).not.toBe(null);
        }, {timeout: 500});

        const $heading = document.getElementById('heading');

        // Add a custom attribute
        $heading!.setAttribute('data-custom', 'custom-value');

        // Store reference to check if it's the same DOM node
        const originalHeading = $heading;

        // Change heading text
        namespace.viewModel.heading = 'Updated heading text';

        // Re-render
        await namespace.myComponent.render();

        await waitFor(() => {
            const $headingAfter = document.getElementById('heading');

            // Should be the same DOM element
            expect($headingAfter).toBe(originalHeading);

            // Text should be updated
            expect($headingAfter!.textContent).toBe('Updated heading text');

            // Original attributes should remain
            expect($headingAfter!.className).toBe('display-4');
            expect($headingAfter!.getAttribute('data-bind-text')).toBe('heading');
        }, {timeout: 500});
    });

    it('Should preserve root template elements but allow nested templates to re-render', async () => {
        // Wait for initial render with nested templates
        await waitFor(() => {
            expect(document.getElementById('contentNest1Info')).not.toBe(null);
        }, {timeout: 2000});

        // Get references to root and nested template elements
        const $contentNest1 = document.getElementById('contentNest1');
        const $heading = document.getElementById('heading');

        // Mark root template container element
        $contentNest1!.setAttribute('data-test-nested1', 'original-nest1-container');
        $heading!.setAttribute('data-test-heading', 'original-heading');

        // Update nested property
        namespace.viewModel.contentNest1.info = 'Updated nested content 1';

        // Re-render
        await namespace.myComponent.render();

        await waitFor(() => {
            const $contentNest1After = document.getElementById('contentNest1');
            const $headingAfter = document.getElementById('heading');
            const $contentNest1InfoAfter = document.getElementById('contentNest1Info');

            // Root template elements should be preserved (minimal DOM updates)
            expect($contentNest1After).toBe($contentNest1);
            expect($headingAfter).toBe($heading);
            expect($contentNest1After!.getAttribute('data-test-nested1')).toBe('original-nest1-container');
            expect($headingAfter!.getAttribute('data-test-heading')).toBe('original-heading');

            // Nested template content should be updated
            expect($contentNest1InfoAfter!.textContent).toBe('Updated nested content 1');
        }, {timeout: 2000});
    });

    it('Should preserve root template structure across multiple re-renders', async () => {
        // Wait for initial render
        await waitFor(() => {
            expect(document.getElementById('heading')).not.toBe(null);
        }, {timeout: 500});

        const $heading = document.getElementById('heading');
        const originalHeading = $heading;

        // Multiple re-renders with different data
        namespace.viewModel.heading = 'First update';
        await namespace.myComponent.render();

        await waitFor(() => {
            const $element1 = document.getElementById('heading');
            expect($element1).toBe(originalHeading);
            expect($element1!.textContent).toBe('First update');
        }, {timeout: 500});

        namespace.viewModel.heading = 'Second update';
        await namespace.myComponent.render();

        await waitFor(() => {
            const $element2 = document.getElementById('heading');
            expect($element2).toBe(originalHeading);
            expect($element2!.textContent).toBe('Second update');
        }, {timeout: 500});

        namespace.viewModel.heading = 'Third update';
        await namespace.myComponent.render();

        await waitFor(() => {
            const $element3 = document.getElementById('heading');
            // Should still be the same DOM element after 3 re-renders
            expect($element3).toBe(originalHeading);
            expect($element3!.textContent).toBe('Third update');
        }, {timeout: 500});
    });
});
