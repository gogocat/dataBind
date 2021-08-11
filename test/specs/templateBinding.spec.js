describe('Given [data-bind-comp="temp-component"] inited', () => {
    const namespace = {};

    jasmine.getFixtures().fixturesPath = 'test';

    beforeEach(function() {
        loadFixtures('./fixtures/templateBinding.html');

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

    it('Then [data-bind-comp="temp-component"] should have render', (done) => {
        setTimeout(() => {
            expect(document.getElementById('heading').textContent).toBe(namespace.viewModel.heading);
            expect(namespace.finishTemplateRender).toBe(1);
            done();
        }, 200);
    });

    it('Should render template1 with viewModel data', (done) => {
        setTimeout(() => {
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
            done();
        }, 200);
    });

    it('Should render nested templates with standard dataBindings', (done) => {
        setTimeout(() => {
            const viewModel = namespace.viewModel;
            const $contentNest1 = document.getElementById('contentNest1');
            const $contentNest1Info = document.getElementById('contentNest1Info');
            const $nestPrepend = document.getElementById('nestPrepend');
            const $nestAppend = document.getElementById('nestAppend');

            expect($contentNest1.children.length).not.toBe(0);
            expect($contentNest1Info.textContent).toBe(viewModel.contentNest1.info);
            expect($nestPrepend.children.length).toBeGreaterThan(1);
            expect($nestAppend.children.length).toBeGreaterThan(1);
            done();
        }, 200);
    });

    it('Should render nested template prepend option', (done) => {
        setTimeout(() => {
            const viewModel = namespace.viewModel;
            const $nestPrepend = document.getElementById('nestPrepend');
            const $nestPrependHeading = document.getElementById('nestPrependHeading');
            const $contentNest2Info = document.getElementById('contentNest2Info');

            expect($nestPrepend.children.length).toBeGreaterThan(1);
            expect($nestPrependHeading).not.toBe(null);
            expect($nestPrependHeading.previousElementSibling).toBe(contentNest2Info);
            expect($contentNest2Info.textContent).toBe(viewModel.contentNest2.info);
            done();
        }, 200);
    });

    it('Should render nested template append option', (done) => {
        setTimeout(() => {
            const viewModel = namespace.viewModel;
            const $nestAppend = document.getElementById('nestAppend');
            const $nestAppendHeading = document.getElementById('nestAppendHeading');
            const $contentNest3Info = document.getElementById('contentNest3Info');

            expect($nestAppend.children.length).toBeGreaterThan(1);
            expect($nestAppendHeading).not.toBe(null);
            expect($nestAppendHeading.nextElementSibling).toBe(contentNest3Info);
            expect($contentNest3Info.textContent).toBe(viewModel.contentNest3.info);
            done();
        }, 200);
    });
});
