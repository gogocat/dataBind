describe('When nested data-jq-comp initised', function() {
    var namespace = {};

    jasmine.getFixtures().fixturesPath = 'test';

    beforeEach(function() {
        var parentComponent;
        var childComponent;
        var grandChildComponent;
        var slibingChildComponent;

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

        parentComponent = dataBind.init(
            $('[data-jq-comp="parent-component"]'),
            namespace.parentComponentVM
        );
        childComponent = dataBind.init(
            $('[data-jq-comp="child-component"]'),
            namespace.childComponentVM
        );
        grandChildComponent = dataBind.init(
            $('[data-jq-comp="grand-child-component"]'),
            namespace.grandChildComponentVM
        );
        slibingChildComponent = dataBind.init(
            $('[data-jq-comp="slibing-child-component"]'),
            namespace.slibingChildComponentVM
        );

        parentComponent.render();
        childComponent.render();
        grandChildComponent.render();
        slibingChildComponent.render();
    });

    afterEach(function() {
        // clean up all app/components
        for (var prop in namespace) {
            if (namespace.hasOwnProperty(prop)) {
                delete namespace[prop];
            }
        }
    });

    it('Then #parent-component-title and #parent-component-description should render according parentComponentVM', function(done) {
        setTimeout(function() {
            expect($('#parent-component-title').text()).toBe(namespace.parentComponentVM.title);
            expect($('#parent-component-description').text()).toBe(
                namespace.parentComponentVM.description
            );
            done();
        }, 200);
    });

    it('Then #child-component-title and #child-component-description should render according childComponentVM', function(done) {
        setTimeout(function() {
            expect($('#child-component-title').text()).toBe(namespace.childComponentVM.title);
            expect($('#child-component-description').text()).toBe(
                namespace.childComponentVM.description
            );
            done();
        }, 200);
    });

    it('Then #grand-child-component-title and #grand-child-component-description should render according grandChildComponentVM', function(done) {
        setTimeout(function() {
            expect($('#grand-child-component-title').text()).toBe(
                namespace.grandChildComponentVM.title
            );
            expect($('#grand-child-component-description').text()).toBe(
                namespace.grandChildComponentVM.description
            );
            done();
        }, 200);
    });

    it('Then #slibing-child-component-title and #slibing-child-component-description should render according slibingChildComponentVM', function(done) {
        setTimeout(function() {
            expect($('#slibing-child-component-title').text()).toBe(
                namespace.slibingChildComponentVM.title
            );
            expect($('#slibing-child-component-description').text()).toBe(
                namespace.slibingChildComponentVM.description
            );
            done();
        }, 200);
    });
});
