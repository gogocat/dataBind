describe('When nested data-jq-comp initised', () => {
    const namespace = {};

    jasmine.getFixtures().fixturesPath = 'test';

    beforeEach(function() {
        loadFixtures('./fixtures/nestedComponents.html');

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

        const parentComponent = dataBind.init(document.querySelector('[data-jq-comp="parent-component"]'), namespace.parentComponentVM);
        const childComponent = dataBind.init(document.querySelector('[data-jq-comp="child-component"]'), namespace.childComponentVM);
        const grandChildComponent = dataBind.init(
            document.querySelector('[data-jq-comp="grand-child-component"]'),
            namespace.grandChildComponentVM,
        );
        const slibingChildComponent = dataBind.init(
            document.querySelector('[data-jq-comp="slibing-child-component"]'),
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
            if (namespace.hasOwnProperty(prop)) {
                delete namespace[prop];
            }
        }
    });

    it('Then #parent-component-title and #parent-component-description should render according parentComponentVM', (done) => {
        setTimeout(() => {
            expect($('#parent-component-title').text()).toBe(namespace.parentComponentVM.title);
            expect($('#parent-component-description').text()).toBe(namespace.parentComponentVM.description);
            done();
        }, 200);
    });

    it('Then #child-component-title and #child-component-description should render according childComponentVM', (done) => {
        setTimeout(() => {
            expect($('#child-component-title').text()).toBe(namespace.childComponentVM.title);
            expect($('#child-component-description').text()).toBe(namespace.childComponentVM.description);
            done();
        }, 200);
    });

    it('Then #grand-child-component-title and #grand-child-component-description should render according grandChildComponentVM', (done) => {
        setTimeout(() => {
            expect($('#grand-child-component-title').text()).toBe(namespace.grandChildComponentVM.title);
            expect($('#grand-child-component-description').text()).toBe(namespace.grandChildComponentVM.description);
            done();
        }, 200);
    });

    it('Then #slibing-child-component-title and #slibing-child-component-description should render according slibingChildComponentVM', (done) => {
        setTimeout(() => {
            expect($('#slibing-child-component-title').text()).toBe(namespace.slibingChildComponentVM.title);
            expect($('#slibing-child-component-description').text()).toBe(
                namespace.slibingChildComponentVM.description,
            );
            done();
        }, 200);
    });
});
