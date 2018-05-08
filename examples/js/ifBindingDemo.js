(function($, window) {
    let myComponent;
    const viewModel = {
        renderIntro: false,
        heading: 'Test if binding',
        description: 'Looking good',
        content: {
            title: 'A test story being...',
            story: 'This is template binding test with if-binding.',
        },
        stories: [
            {
                id: '444',
                title: 'Sample gardening service',
                description:
                    'This is a longer card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.',
                image: 'bootstrap/images/pic-backyard.jpg',
                bookmarked: false,
                numLikes: 8,
                options: [{text: '1', value: '1'}, {text: '2', value: '2'}, {text: '3', value: '3'}],
            },
        ],
        setStoryOptionAttr: function(oldAttrObj, $el, $data) {
            if ($data && $data.value) {
                // todo: the index here is the outter loop index
                return {
                    value: $data.value,
                };
            }
        },
        renderItem: function(e, $el) {
            e.preventDefault();
            this.renderIntro = true;
            this.updateView();
        },
        removeItem: function(e, $el) {
            e.preventDefault();
            this.renderIntro = false;
            this.updateView();
        },
        updateView(opt) {
            this.APP.render(opt);
        },
    };

    // start binding on DOM ready
    $(document).ready(function() {
        // main formApp
        myComponent = dataBind.init($('[data-jq-comp="myComponent"]'), viewModel);
        myComponent.render().then(function() {
            // for debug
            console.log(myComponent);
            window.myComponent = myComponent;
        });
    });
})(jQuery, window);
