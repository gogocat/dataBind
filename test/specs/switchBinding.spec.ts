import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import {waitFor} from '@testing-library/dom';


describe('Given [data-bind-comp="switch-component"] inited', () => {
    const namespace: any = {};

    // stories data
    const storiesData: any = {
        s1: {
            title: 'Hansel and Gretel',
            pic:
                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLxVHKpB93yhxRUb8Wbc1NkUA4Nf8QBMPieKeeL1ugcZivy82INw',
            description:
                '"Hansel and Gretel" (also known as Hansel and Grettel, Hansel and Grethel, or Little Brother and Little Sister) is a well-known fairy tale of German origin, recorded by the Brothers Grimm and published in 1812. Hansel and Gretel are a young brother and sister kidnapped by a cannibalistic witch living deep in the forest in a house constructed of cake and confectionery. The two children escape with their lives by outwitting her. The tale has been adapted to various media, most notably the opera Hänsel und Gretel (1893) by Engelbert Humperdinck. Under the Aarne–Thompson classification system, "Hansel and Gretel" is classified under Class 327.',
        },
        s2: {
            title: 'The Ugly Duckling',
            description:
                '"The Ugly Duckling" (Danish: Den grimme ælling) is a literary fairy tale by Danish poet and author Hans Christian Andersen (1805–1875). The story tells of a homely little bird born in a barnyard who suffers abuse from the others around him until, much to his delight (and to the surprise of others), he matures into a beautiful swan, the most beautiful bird of all. The story is beloved around the world as a tale about personal transformation for the better. "The Ugly Duckling" was first published 11 November 1843, with three other tales by Andersen in Copenhagen, Denmark to great critical acclaim. The tale has been adapted to various media including opera, musical, and animated film. The tale is completely Andersen\'s invention and owes no debt to fairy tales or folklore.',
        },
        s3: {
            title: 'The Giving Tree',
            pic: 'https://images-na.ssl-images-amazon.com/images/I/51EDtk%2B1rNL._SX384_BO1,204,203,200_.jpg',
            description:
                'Published by Harper and Row in 1964, The Giving Tree is a children\'s book written and demonstrated by an American author of children\'s books Shel Silverstein. It was one of Silverstein\'s best children books that has been translated into over 30 languages.',
        },
    };

    beforeEach(async () => {
        loadFixture('test/fixtures/switchBinding.html');

        namespace.viewModel = {
            heading: 'This heading is inside switch binding',
            selectedStory: '',
            story: {},
            storyOptions: [
                {title: 'Hansel and Gretel', value: 's1'},
                {title: 'The Ugly Duckling', value: 's2'},
                {title: 'The Giving Tree', value: 's3'},
            ],
            onSelectedStory(newValue: string) {
                const id = newValue;

                if (storiesData[id] && id !== this.selectedStory) {
                    this.story = storiesData[id];
                    this.selectedStory = id;
                } else {
                    this.story = {};
                    this.selectedStory = '';
                }
                this.updateView();
            },
            setStoryImgAttr() {
                const picPath = this.story.pic || '';
                const ret: any = {
                    alt: this.story.title,
                    width: 100,
                    height: 'auto',
                };

                if (picPath) {
                    ret.src = picPath;
                }
                return ret;
            },
            updateView(opt?: any) {
                this.APP.render(opt);
            },
        };

        namespace.mySwitchComponent = dataBind.init(document.querySelector('[data-bind-comp="switch-component"]'), namespace.viewModel);

        await namespace.mySwitchComponent.render();
    });

    afterEach(() => {
        // clean up all app/components
        for (const prop in namespace) {
            if (Object.prototype.hasOwnProperty.call(namespace, prop)) {
                delete namespace[prop];
            }
        }
    });

    it('Then [data-bind-comp="mySwitchComponent"] should have render', async () => {
        await waitFor(() => {
            expect(document.getElementById('switch-component-heading')!.textContent).toBe(namespace.viewModel.heading);
        }, {timeout: 500});
    });

    it('Should render only switch default case', async () => {
        await waitFor(() => {
            // check child non switch binding element still exists
            expect(document.getElementById('switch-component-heading')!.textContent).toBe(namespace.viewModel.heading);

            expect(document.getElementById('default-case')).toBeDefined();
            expect(document.getElementById('case1')).toBe(null);
            expect(document.getElementById('case2')).toBe(null);
            expect(document.getElementById('case3')).toBe(null);
        }, {timeout: 500});
    });


    it('When selectedStory = s1 it then should render case1', async () => {
        namespace.viewModel.onSelectedStory('s1');
        await namespace.mySwitchComponent.render();

        await waitFor(() => {
            const $case1 = document.getElementById('case1')!;
            const $storyTitle = $case1.querySelector('h4')!;
            const $storyImg = $case1.querySelector('img') as HTMLImageElement;
            const $storyDescription = $case1.querySelector('p')!;

            // check child non switch binding element still exists
            expect(document.getElementById('switch-component-heading')!.textContent).toBe(namespace.viewModel.heading);

            expect($case1).toBeDefined();
            // check other binding within this switch binding
            expect($storyTitle.textContent).toBe(storiesData.s1.title);
            expect($storyImg.getAttribute('src')).toBe(storiesData.s1.pic);
            expect($storyDescription.textContent).toBe(storiesData.s1.description);

            expect(document.getElementById('case2')).toBe(null);
            expect(document.getElementById('case3')).toBe(null);
            expect(document.getElementById('default-case')).toBe(null);
        }, {timeout: 500});
    });


    it('When selectedStory = s2 it then should render case2 without image', async () => {
        namespace.viewModel.onSelectedStory('s2');
        await namespace.mySwitchComponent.render();

        await waitFor(() => {
            const $case2 = document.getElementById('case2')!;
            const $storyTitle = $case2.querySelector('h4')!;
            const $storyDescription = $case2.querySelector('p')!;

            // check child non switch binding element still exists
            expect(document.getElementById('switch-component-heading')!.textContent).toBe(namespace.viewModel.heading);

            // check other binding within this switch binding
            expect($storyTitle.textContent).toBe(storiesData.s2.title);
            // expect($storyImg).toBe(null);
            expect($storyDescription.textContent).toBe(storiesData.s2.description);

            expect(document.getElementById('case1')).toBe(null);
            expect(document.getElementById('case3')).toBe(null);
            expect(document.getElementById('default-case')).toBe(null);
        }, {timeout: 500});
    });


    it('When selectedStory non exists it then should render default case', async () => {
        await waitFor(() => {
            const $defaultCase = document.getElementById('default-case')!;
            const $defaultCaseTextContent = $defaultCase.querySelector('p')!.textContent;
            const defatulCaseText = 'No story found...';

            // check child non switch binding element still exists
            expect(document.getElementById('switch-component-heading')!.textContent).toBe(namespace.viewModel.heading);

            // check other binding within this switch binding
            expect($defaultCase).toBeDefined();
            expect($defaultCaseTextContent).toBe(defatulCaseText);
            expect(document.getElementById('case1')).toBe(null);
            expect(document.getElementById('case2')).toBe(null);
            expect(document.getElementById('case3')).toBe(null);
        }, {timeout: 500});
    });
});
