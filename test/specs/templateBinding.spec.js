describe('Given [data-jq-comp="temp-component"] inited', () => {
    let namespace = {};

    jasmine.getFixtures().fixturesPath = 'test';

    beforeEach(function() {
        loadFixtures('./fixtures/templateBinding.html');

        namespace.finishTemplateRender = 0;

        namespace.viewModel = {
            heading: 'Test data-jq-temp binding',
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

        namespace.myComponent = dataBind.init($('[data-jq-comp="temp-component"]'), namespace.viewModel);

        namespace.myComponent.render();
    });

    afterEach(() => {
        // clean up all app/components
        for (let prop in namespace) {
            if (namespace.hasOwnProperty(prop)) {
                delete namespace[prop];
            }
        }
    });

    it('Then [data-jq-comp="temp-component"] should have render', (done) => {
        setTimeout(() => {
            expect(document.getElementById('heading').textContent).toBe(namespace.viewModel.heading);
            expect(namespace.finishTemplateRender).toBe(1);
            done();
        }, 200);
    });

    it('Should render undercore template without setting data', (done) => {
        setTimeout(() => {
            let viewModel = namespace.viewModel;
            let $compSection = document.getElementById('compSection');
            let $heading = document.getElementById('heading');
            let $description = document.getElementById('description');
            let $content = document.getElementById('content');
            let $contentNest1 = document.getElementById('contentNest1');

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
            let viewModel = namespace.viewModel;
            let $contentNest1 = document.getElementById('contentNest1');
            let $contentNest1Info = document.getElementById('contentNest1Info');
            let $nestPrepend = document.getElementById('nestPrepend');
            let $nestAppend = document.getElementById('nestAppend');

            expect($contentNest1.children.length).not.toBe(0);
            expect($contentNest1Info.textContent).toBe(viewModel.contentNest1.info);
            expect($nestPrepend.children.length).toBeGreaterThan(1);
            expect($nestAppend.children.length).toBeGreaterThan(1);
            done();
        }, 200);
    });

    it('Should render nested template prepend option', (done) => {
        setTimeout(() => {
            let viewModel = namespace.viewModel;
            let $nestPrepend = document.getElementById('nestPrepend');
            let $nestPrependHeading = document.getElementById('nestPrependHeading');
            let $contentNest2Info = document.getElementById('contentNest2Info');

            expect($nestPrepend.children.length).toBeGreaterThan(1);
            expect($nestPrependHeading).not.toBe(null);
            expect($nestPrependHeading.previousElementSibling).toBe(contentNest2Info);
            expect($contentNest2Info.textContent).toBe(viewModel.contentNest2.info);
            done();
        }, 200);
    });

    it('Should render nested template append option', (done) => {
        setTimeout(() => {
            let viewModel = namespace.viewModel;
            let $nestAppend = document.getElementById('nestAppend');
            let $nestAppendHeading = document.getElementById('nestAppendHeading');
            let $contentNest3Info = document.getElementById('contentNest3Info');

            expect($nestAppend.children.length).toBeGreaterThan(1);
            expect($nestAppendHeading).not.toBe(null);
            expect($nestAppendHeading.nextElementSibling).toBe(contentNest3Info);
            expect($contentNest3Info.textContent).toBe(viewModel.contentNest3.info);
            done();
        }, 200);
    });
});
