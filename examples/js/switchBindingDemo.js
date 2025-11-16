
(() => {
    const myComponentViewModel = {
        heading: 'This heading is inside switch binding',
        title: 'Test switch binding',
        description: 'Switch binding will add / remove its direct child elements that has data-bind-case expression.',
        selectedStory: '',
        story: {},
        storyOptions: [
            {title: 'Hansel and Gretel', value: 's1'},
            {title: 'The Ugly Duckling', value: 's2'},
            {title: 'The Giving Tree', value: 's3'},
        ],
        setStoryOptionAttr($data, oldAttrObj, $el) {
            if ($data && $data.value) {
                return {
                    value: $data.value,
                };
            }
        },
        onSelectedStory(e, $el, newValue, oldValue) {
            const id = newValue;

            e.preventDefault();

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

    // stories data
    const storiesData = {
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

    // start binding on DOM ready
    // main
    const myComponent = dataBind.init(document.querySelector('[data-bind-comp="myComponent"]'), myComponentViewModel);
    myComponent.render().then(() => {
        // for debug
        console.log(myComponent);
        window.myComponent = myComponent;
    });
})();
