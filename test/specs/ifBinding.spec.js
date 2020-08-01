/* eslint-disable max-len */
describe('Given [data-jq-comp="if-component"] inited', () => {
    const namespace = {};

    jasmine.getFixtures().fixturesPath = 'test';

    beforeEach(function() {
        loadFixtures('./fixtures/ifBinding.html');

        namespace.viewModel = {
            renderIntro: true,
            heading: 'Test data-if-binding',
            description: 'This is intro text',
            story: {
                title: 'Hansel and Gretel',
                description:
                    '"Hansel and Gretel" (also known as Hansel and Grettel, Hansel and Grethel, or Little Brother and Little Sister) is a well-known fairy tale of German origin.',
                link: 'https://www.google.com.au/search?q=Hansel+and+Gretel',
            },
            viewModelPropFn: function($data) {
                return typeof $data.viewModelPropFn === 'function';
            },
            undefinedViewModelPropFn: function($data) {
                return;
            },
            setStroylinkAttr: function($data) {
                return {
                    href: this.story.link,
                    title: this.story.title,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                };
            },
            onStoryClick: function(e, $el) {
                e.preventDefault();
            },
            updateView: function(opt) {
                this.APP.render(opt);
            },
        };

        namespace.myIfComponent = dataBind.init(document.querySelector('[data-jq-comp="if-component"]'), namespace.viewModel);

        namespace.myIfComponent.render();

        // jasmine spies
        spyOn(namespace.viewModel, 'onStoryClick');
    });

    afterEach(() => {
        // clean up all app/components
        for (const prop in namespace) {
            if (namespace.hasOwnProperty(prop)) {
                delete namespace[prop];
            }
        }
    });

    it('Then [data-jq-comp="myIfComponent"] should have render', (done) => {
        setTimeout(() => {
            expect($('#intro-heading').text()).toBe(namespace.viewModel.heading);
            expect($('#intro-description').text()).toBe(namespace.viewModel.description);
            done();
        }, 200);
    });

    it('Then render if-binding elements with comment tag wrap around', (done) => {
        setTimeout(() => {
            const introOpenCommentWrap = document.getElementById('intro').previousSibling;
            const introCloseCommentWrap = document.getElementById('intro').nextSibling;

            expect(introOpenCommentWrap.nodeType).toBe(8);
            expect(introCloseCommentWrap.nodeType).toBe(8);
            expect(introOpenCommentWrap.textContent).toContain('data-if');
            expect(introCloseCommentWrap.textContent).toContain('data-if');
            done();
        }, 200);
    });

    it('should not render #story ', (done) => {
        setTimeout(() => {
            expect($('#story').length).toBe(0);
            done();
        }, 200);
    });

    it('should not render #testPropFn ', (done) => {
        setTimeout(() => {
            expect(document.getElementById('testPropFn')).not.toBe(null);
            done();
        }, 200);
    });

    it('should not render #testUnDefiniedProp ', (done) => {
        setTimeout(() => {
            expect(document.getElementById('testUnDefiniedProp')).toBe(null);
            done();
        }, 200);
    });

    it('should render inverse negated boolean block', (done) => {
        setTimeout(() => {
            expect(document.getElementById('NotTestUnDefiniedProp')).not.toBe(null);
            done();
        }, 200);
    });

    describe('When update viewModel renderIntro to false', () => {
        it('should render story and remove intro', (done) => {
            namespace.viewModel.renderIntro = false;
            namespace.viewModel.updateView();

            setTimeout(() => {
                expect($('#story').length).toBe(1);
                expect($('#intro').length).toBe(0);
                expect($('#storyIntroHeading').text()).toBe(namespace.viewModel.story.title);
                expect($('#storyDescription').text()).toBe(namespace.viewModel.story.description);
                expect($('#storyLink').attr('href')).toBe(namespace.viewModel.story.link);
                expect($('#storyLink').attr('title')).toBe(namespace.viewModel.story.title);
                expect($('#storyLink').attr('target')).toBe('_blank');
                expect($('#storyLink').attr('rel')).toBe('noopener noreferrer');

                const evt = document.createEvent('HTMLEvents');
                evt.initEvent('click', true, true);

                const $searchInput = document.getElementById('storyLink');
                $searchInput.dispatchEvent(evt);

                expect(namespace.viewModel.onStoryClick).toHaveBeenCalled();
                namespace.viewModel.onStoryClick.calls.reset();
                done();
            }, 200);
        });
    });

    describe('When update viewModel renderIntro to true', () => {
        it('should render intro and remove story', (done) => {
            namespace.viewModel.renderIntro = true;
            namespace.viewModel.updateView();

            setTimeout(() => {
                expect($('#story').length).toBe(0);
                expect($('#intro').length).toBe(1);
                done();
            }, 200);
        });
    });

    describe('When update viewModel renderIntro to false again', () => {
        it('should render story and event handler rebind', (done) => {
            namespace.viewModel.renderIntro = false;
            namespace.viewModel.updateView();

            setTimeout(() => {
                const $storyLink = document.getElementById('storyLink');
                const evt = document.createEvent('HTMLEvents');
                evt.initEvent('click', true, true);

                expect($('#story').length).toBe(1);
                expect($('#intro').length).toBe(0);

                $storyLink.dispatchEvent(evt);
                expect(namespace.viewModel.onStoryClick).toHaveBeenCalled();
                namespace.viewModel.onStoryClick.calls.reset();
                done();
            }, 200);
        });
    });
});
