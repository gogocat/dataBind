// search-results-component
(function($, window) {
    let searchResultsComponent;

    let viewModel = {
        searchResultTitle: 'Featured service providers',
        messageTriggerCss: '',
        bookmarkCss: '',
        searchResults: [
            {
                id: '001',
                title: 'Card title that wraps to a new line',
                description:
                    'This is a longer card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.',
                image: 'bootstrap/images/pic-home.jpg',
                bookmarked: false,
                numLikes: 110,
            },
            {
                id: '456',
                title: 'Card title',
                description:
                    'This card has supporting text below as a natural lead-in to additional content.',
                image: '',
                bookmarked: false,
                numLikes: 8,
                selected: true,
            },
            {
                id: '789',
                title: 'Sample carpemter service',
                description:
                    'This is a wider card with supporting text below as a natural lead-in to additional content. This card has even longer content than the first to show that equal height action.',
                image: 'bootstrap/images/pic-carpenter.jpg',
                bookmarked: false,
                numLikes: 8,
                highlight: true,
                highlightCss: 'result-item--highlight',
            },
            {
                id: '888',
                title: 'Sample timber floor service',
                description:
                    'This is a longer card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.',
                image: 'bootstrap/images/pic-deck.jpg',
                bookmarked: false,
                numLikes: 8,
                selected: true,
            },
            {
                id: '222',
                title: 'Sample timber floor service',
                description:
                    'This is a longer card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.',
                image: '',
                bookmarked: false,
                numLikes: 8,
            },
            {
                id: '333',
                title: 'Sample boothroom service',
                description:
                    'This is a wider card with supporting text below as a natural lead-in to additional content. This card has even longer content than the first to show that equal height action.',
                image: 'bootstrap/images/pic-bathrooms.jpg',
                bookmarked: true,
                bookmarkedCss: 'active',
                numLikes: 8,
            },
            {
                id: '444',
                title: 'Sample gardening service',
                description:
                    'This is a longer card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.',
                image: 'bootstrap/images/pic-backyard.jpg',
                bookmarked: false,
                numLikes: 8,
            },
        ],
        getResultItemAttr: function(oldAttrObj, $el, index) {
            let self = this;
            if (self.searchResults[index].image) {
                return {
                    src: self.searchResults[index].image,
                    alt: self.searchResults[index].title || '',
                };
            }
        },
        onAdMessageCheck: function(e, $el, newValue, oldValue, index) {
            console.log('onAdMessageCheck: ', $el, newValue, oldValue, index);
        },
        onAdBookmarkClick: function(e, $el, index) {
            e.preventDefault();
            console.log('onAdBookmarkClick: ', $el, index);
        },
    };

    // start binding on DOM ready
    $(document).ready(function() {
        // formComponentC - test for-of binding
        searchResultsComponent = dataBind.init(
            $('[data-jq-comp="search-results-component"]'),
            viewModel
        );
        searchResultsComponent.render().then(function() {
            // for debug
            console.log(searchResultsComponent);
            window.searchResultsComponent = searchResultsComponent;
        });
    });
})(jQuery, window);
