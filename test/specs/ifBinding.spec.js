import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {waitFor} from '@testing-library/dom';


describe('Given [data-bind-comp="if-component"] inited', () => {
    const namespace = {};

    beforeEach(async () => {
        loadFixture('test/fixtures/ifBinding.html');

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
            viewModelPropFn($data) {
                return typeof $data.viewModelPropFn === 'function';
            },
            undefinedViewModelPropFn(_$data) {
                return;
            },
            setStroylinkAttr(_$data) {
                return {
                    href: this.story.link,
                    title: this.story.title,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                };
            },
            onStoryClick(e, _$el) {
                e.preventDefault();
            },
            updateView(opt) {
                this.APP.render(opt);
            },
        };

        namespace.myIfComponent = dataBind.init(document.querySelector('[data-bind-comp="if-component"]'), namespace.viewModel);

        await namespace.myIfComponent.render();

        // vitest spies
        vi.spyOn(namespace.viewModel, 'onStoryClick');
    });

    afterEach(() => {
        // clean up all app/components
        for (const prop in namespace) {
            if (Object.prototype.hasOwnProperty.call(namespace, prop)) {
                delete namespace[prop];
            }
        }
    });

    it('Then [data-bind-comp="myIfComponent"] should have render', async () => {
        await waitFor(() => {
            expect(document.querySelector('#intro-heading').textContent).toBe(namespace.viewModel.heading);
            expect(document.querySelector('#intro-description').textContent).toBe(namespace.viewModel.description);
        }, {timeout: 500});
    });

    it('Then render if-binding elements with comment tag wrap around', async () => {
        await waitFor(() => {
            const introOpenCommentWrap = document.getElementById('intro').previousSibling;
            const introCloseCommentWrap = document.getElementById('intro').nextSibling;

            expect(introOpenCommentWrap.nodeType).toBe(8);
            expect(introCloseCommentWrap.nodeType).toBe(8);
            expect(introOpenCommentWrap.textContent).toContain('data-if');
            expect(introCloseCommentWrap.textContent).toContain('data-if');
        }, {timeout: 500});
    });


    it('should not render #story ', async () => {
        await waitFor(() => {
            expect(document.querySelector('#story')).toBe(null);
        }, {timeout: 500});
    });


    it('should not render #testPropFn ', async () => {
        await waitFor(() => {
            expect(document.getElementById('testPropFn')).not.toBe(null);
        }, {timeout: 500});
    });


    it('should not render #testUnDefiniedProp ', async () => {
        await waitFor(() => {
            expect(document.getElementById('testUnDefiniedProp')).toBe(null);
        }, {timeout: 500});
    });


    it('should render inverse negated boolean block', async () => {
        await waitFor(() => {
            expect(document.getElementById('NotTestUnDefiniedProp')).not.toBe(null);
        }, {timeout: 500});
    });

    describe('When update viewModel renderIntro to false', () => {
        it('should render story and remove intro', async () => {
            namespace.viewModel.renderIntro = false;
            await namespace.myIfComponent.render();

            await waitFor(() => {
                expect(document.querySelector('#story')).not.toBe(null);
                expect(document.querySelector('#intro')).toBe(null);
                expect(document.querySelector('#storyIntroHeading').textContent).toBe(namespace.viewModel.story.title);
                expect(document.querySelector('#storyDescription').textContent).toBe(namespace.viewModel.story.description);
                expect(document.querySelector('#storyLink').getAttribute('href')).toBe(namespace.viewModel.story.link);
                expect(document.querySelector('#storyLink').getAttribute('title')).toBe(namespace.viewModel.story.title);
                expect(document.querySelector('#storyLink').getAttribute('target')).toBe('_blank');
                expect(document.querySelector('#storyLink').getAttribute('rel')).toBe('noopener noreferrer');

                const evt = document.createEvent('HTMLEvents');
                evt.initEvent('click', true, true);

                const $searchInput = document.getElementById('storyLink');
                $searchInput.dispatchEvent(evt);

                expect(namespace.viewModel.onStoryClick).toHaveBeenCalled();
                namespace.viewModel.onStoryClick.mockClear();
            }, {timeout: 500});
        });
    });

    describe('When update viewModel renderIntro to true', () => {
        it('should render intro and remove story', async () => {
            namespace.viewModel.renderIntro = true;
            await namespace.myIfComponent.render();

            await waitFor(() => {
                expect(document.querySelector('#story')).toBe(null);
                expect(document.querySelector('#intro')).not.toBe(null);
            }, {timeout: 500});
        });
    });

    describe('When update viewModel renderIntro to false again', () => {
        it('should render story and event handler rebind', async () => {
            namespace.viewModel.renderIntro = false;
            await namespace.myIfComponent.render();

            await waitFor(() => {
                const $storyLink = document.getElementById('storyLink');
                const evt = document.createEvent('HTMLEvents');
                evt.initEvent('click', true, true);

                expect(document.querySelector('#story')).not.toBe(null);
                expect(document.querySelector('#intro')).toBe(null);

                $storyLink.dispatchEvent(evt);
                expect(namespace.viewModel.onStoryClick).toHaveBeenCalled();
                namespace.viewModel.onStoryClick.mockClear();
            }, {timeout: 500});
        });
    });
});
