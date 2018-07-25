describe('Given [data-jq-comp="switch-component"] inited', () => {
    let namespace = {};

    // stories data
    let storiesData = {
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
                '"The Ugly Duckling" (Danish: Den grimme ælling) is a literary fairy tale by Danish poet and author Hans Christian Andersen (1805–1875). The story tells of a homely little bird born in a barnyard who suffers abuse from the others around him until, much to his delight (and to the surprise of others), he matures into a beautiful swan, the most beautiful bird of all. The story is beloved around the world as a tale about personal transformation for the better. “The Ugly Duckling” was first published 11 November 1843, with three other tales by Andersen in Copenhagen, Denmark to great critical acclaim. The tale has been adapted to various media including opera, musical, and animated film. The tale is completely Andersen\'s invention and owes no debt to fairy tales or folklore.',
        },
        s3: {
            title: 'The Giving Tree',
            pic: 'https://images-na.ssl-images-amazon.com/images/I/51EDtk%2B1rNL._SX384_BO1,204,203,200_.jpg',
            description:
                'Published by Harper and Row in 1964, The Giving Tree is a children\'s book written and demonstrated by an American author of children\'s books Shel Silverstein. It was one of Silverstein\'s best children books that has been translated into over 30 languages.',
        },
    };

    jasmine.getFixtures().fixturesPath = 'test';

    beforeEach(() => {
        loadFixtures('./fixtures/switchBinding.html');

        namespace.viewModel = {
            heading: 'This heading is inside switch binding',
            selectedStory: '',
            story: {},
            storyOptions: [
                {title: 'Hansel and Gretel', value: 's1'},
                {title: 'The Ugly Duckling', value: 's2'},
                {title: 'The Giving Tree', value: 's3'},
            ],
            onSelectedStory: function(newValue) {
                let id = newValue;

                if (storiesData[id] && id !== this.selectedStory) {
                    this.story = storiesData[id];
                    this.selectedStory = id;
                } else {
                    this.story = {};
                    this.selectedStory = '';
                }
                this.updateView();
            },
            setStoryImgAttr: function() {
                const picPath = this.story.pic || '';
                const ret = {
                    alt: this.story.title,
                    width: 100,
                    height: 'auto',
                };

                if (picPath) {
                    ret.src = picPath;
                }
                return ret;
            },
            updateView(opt) {
                this.APP.render(opt);
            },
        };

        namespace.mySwitchComponent = dataBind.init($('[data-jq-comp="switch-component"]'), namespace.viewModel);

        namespace.mySwitchComponent.render();
    });

    afterEach(() => {
        // clean up all app/components
        for (let prop in namespace) {
            if (namespace.hasOwnProperty(prop)) {
                delete namespace[prop];
            }
        }
    });

    it('Then [data-jq-comp="mySwitchComponent"] should have render', (done) => {
        setTimeout(() => {
            expect(document.getElementById('switch-component-heading').textContent).toBe(namespace.viewModel.heading);
            done();
        }, 200);
    });

    it('Should render only switch default case', (done) => {
        setTimeout(() => {
            // check child non switch binding element still exists
            expect(document.getElementById('switch-component-heading').textContent).toBe(namespace.viewModel.heading);

            expect(document.getElementById('default-case')).toBeDefined();
            expect(document.getElementById('case1')).toBe(null);
            expect(document.getElementById('case2')).toBe(null);
            expect(document.getElementById('case3')).toBe(null);
            done();
        }, 200);
    });

    it('When selectedStory = s1 it then should render case1', (done) => {
        namespace.viewModel.onSelectedStory('s1');

        setTimeout(() => {
            let $case1 = document.getElementById('case1');
            let $storyTitle = $case1.querySelector('h4');
            let $storyImg = $case1.querySelector('img');
            let $storyDescription = $case1.querySelector('p');

            // check child non switch binding element still exists
            expect(document.getElementById('switch-component-heading').textContent).toBe(namespace.viewModel.heading);

            expect($case1).toBeDefined();
            // check other binding within this switch binding
            expect($storyTitle.textContent).toBe(storiesData.s1.title);
            expect($storyImg.getAttribute('src')).toBe(storiesData.s1.pic);
            expect($storyDescription.textContent).toBe(storiesData.s1.description);

            expect(document.getElementById('case2')).toBe(null);
            expect(document.getElementById('case3')).toBe(null);
            expect(document.getElementById('default-case')).toBe(null);
            done();
        }, 200);
    });

    it('When selectedStory = s2 it then should render case2 without image', (done) => {
        namespace.viewModel.onSelectedStory('s2');

        setTimeout(() => {
            let $case2 = document.getElementById('case2');
            let $storyTitle = $case2.querySelector('h4');
            let $storyDescription = $case2.querySelector('p');

            // check child non switch binding element still exists
            expect(document.getElementById('switch-component-heading').textContent).toBe(namespace.viewModel.heading);

            // check other binding within this switch binding
            expect($storyTitle.textContent).toBe(storiesData.s2.title);
            // expect($storyImg).toBe(null);
            expect($storyDescription.textContent).toBe(storiesData.s2.description);

            expect(document.getElementById('case1')).toBe(null);
            expect(document.getElementById('case3')).toBe(null);
            expect(document.getElementById('default-case')).toBe(null);
            done();
        }, 200);
    });

    it('When selectedStory non exists it then should render default case', (done) => {
        namespace.viewModel.onSelectedStory('xyz');

        setTimeout(() => {
            let $defaultCase = document.getElementById('default-case');
            let $defaultCaseTextContent = $defaultCase.querySelector('p').textContent;
            let defatulCaseText = 'No story found...';

            // check child non switch binding element still exists
            expect(document.getElementById('switch-component-heading').textContent).toBe(namespace.viewModel.heading);

            // check other binding within this switch binding
            expect($defaultCase).toBeDefined();
            expect($defaultCaseTextContent).toBe(defatulCaseText);
            expect(document.getElementById('case1')).toBe(null);
            expect(document.getElementById('case2')).toBe(null);
            expect(document.getElementById('case3')).toBe(null);
            done();
        }, 200);
    });
});
