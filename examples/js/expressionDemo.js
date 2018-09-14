(($, window) => {
    let expressionComponent;

    const expressionComponentViewModel = {
        renderIntro: true,
        heading: 'Test expression filter',
        description: 'Filters are functions that run after a pie token "|". eg making if binding only run logic once.',
        defaultMessage: 'This is default message...',
        story: {
            title: 'Hansel and Gretel',
            pic: '',
            description:
                '"Hansel and Gretel" (also known as Hansel and Grettel, Hansel and Grethel, or Little Brother and Little Sister) is a well-known fairy tale of German origin, recorded by the Brothers Grimm and published in 1812. Hansel and Gretel are a young brother and sister kidnapped by a cannibalistic witch living deep in the forest in a house constructed of cake and confectionery. The two children escape with their lives by outwitting her. The tale has been adapted to various media, most notably the opera Hänsel und Gretel (1893) by Engelbert Humperdinck. Under the Aarne–Thompson classification system, "Hansel and Gretel" is classified under Class 327.',
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
        addPic: function(e, $el) {
            e.preventDefault();
            this.story.pic = storyPic;
            this.updateView();
        },
        removePic: function(e, $el) {
            e.preventDefault();
            this.story.pic = '';
            this.updateView();
        },
        updateView(opt) {
            this.APP.render(opt);
        },
    };

    const storyPic =
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLxVHKpB93yhxRUb8Wbc1NkUA4Nf8QBMPieKeeL1ugcZivy82INw';

    // start binding on DOM ready
    $(document).ready(() => {
        // main
        expressionComponent = dataBind.init($('[data-jq-comp="expressionComponent"]'), expressionComponentViewModel);
        expressionComponent.render().then(function() {
            // for debug
            console.log(expressionComponent);
            window.expressionComponent = expressionComponent;
        });
    });
})(jQuery, window);
