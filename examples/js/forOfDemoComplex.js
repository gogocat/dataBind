/* eslint-disable max-len */
// search-results-component
(() => {
    const viewModel = {
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
                options: [{text: '1', value: '1'}, {text: '2', value: '2'}, {text: '3', value: '3'}],
            },
            {
                id: '456',
                title: 'Card title',
                description: 'This card has supporting text below as a natural lead-in to additional content.',
                image: '',
                bookmarked: false,
                numLikes: 8,
                selected: true,
                options: [{text: '1', value: '1'}, {text: '2', value: '2'}, {text: '3', value: '3'}],
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
                options: [{text: '1', value: '1'}, {text: '2', value: '2'}, {text: '3', value: '3'}],
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
                options: [{text: '1', value: '1'}, {text: '2', value: '2'}, {text: '3', value: '3'}],
            },
            {
                id: '222',
                title: 'Sample timber floor service',
                description:
                    'This is a longer card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.',
                image: '',
                bookmarked: false,
                numLikes: 8,
                options: [{text: '1', value: '1'}, {text: '2', value: '2'}, {text: '3', value: '3'}],
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
                options: [{text: '1', value: '1'}, {text: '2', value: '2'}, {text: '3', value: '3'}],
            },
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
        getResultItemAttr: function(index, oldAttrObj, $el) {
            const self = this;
            if (self.searchResults[index].image) {
                return {
                    src: self.searchResults[index].image,
                    alt: self.searchResults[index].title || '',
                };
            }
        },
        setResultOptionAttr: function($data, oldAttrObj, $el) {
            if ($data && $data.value) {
                // todo: the index here is the outter loop index
                return {
                    value: $data.value,
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

    // Default mutations count, controlled by slider
    let mutationsCount = 50;

    const generateRamdomData = () => {
        const data = [];
        const getRandomNumber = (x, y) => {
            return Math.floor(Math.random() * (y - x + 1) + x);
        };
        const randomSeed = mutationsCount;
        const images = [
            'bootstrap/images/pic-home.jpg',
            'bootstrap/images/pic-carpenter.jpg',
            'bootstrap/images/pic-deck.jpg',
            'bootstrap/images/pic-bathrooms.jpg',
            'bootstrap/images/pic-backyard.jpg',
        ];
        const descriptions = [
            'This is a longer card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.',
            'This card has supporting text below as a natural lead-in to additional content.',
            'This is a wider card with supporting text below as a natural lead-in to additional content. This card has even longer content than the first to show that equal height action.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.',
            'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        ];

        for (let i = 0; i < randomSeed; i += 1) {
            data.push({
                id: i,
                title: 'Sample gardening service' + i,
                description: descriptions[getRandomNumber(0, descriptions.length - 1)],
                image: images[getRandomNumber(0, images.length - 1)],
                bookmarked: false,
                numLikes: i * randomSeed,
                options: [{text: i, value: i}, {text: i + 1, value: i + 1}, {text: i + 2, value: i + 2}],
            });
        }

        return data;
    };

    const updateResults = () => {
        window.updateInterval = setInterval(function() {
            viewModel.searchResults = generateRamdomData();
            searchResultsComponent.render().then(function() {
                // Ping the performance monitor after each render
                if (typeof Monitoring !== 'undefined') {
                    Monitoring.renderRate.ping();
                }
            });
        });
    };

    // start binding on DOM ready

    // debug
    const searchResultsComponent = dataBind.init(document.querySelector('[data-bind-comp="search-results-component"]'), viewModel);

    searchResultsComponent.render().then(function() {
        // for debug
        console.log(searchResultsComponent);
        window.searchResultsComponent = searchResultsComponent;

        btnRandomRender = document.getElementById('btnRandomRender');
        btnStopRandomRender = document.getElementById('btnStopRandomRender');

        btnRandomRender.addEventListener('click', function(e) {
            e.preventDefault();
            clearInterval(window.updateInterval);
            updateResults();
        }, false);

        btnStopRandomRender.addEventListener('click', function(e) {
            e.preventDefault();
            clearInterval(window.updateInterval);
        }, false);

        // Connect mutations slider to control item count
        const mutationsSlider = document.getElementById('mutations');
        const mutationsValueSpan = document.getElementById('mutationsValue');

        if (mutationsSlider && mutationsValueSpan) {
            mutationsSlider.addEventListener('input', function(e) {
                mutationsCount = parseInt(e.target.value, 10);
                mutationsValueSpan.textContent = mutationsCount;
            });
        }
    });
})();
