(function($, window) {
    let forOfComponent;

    // viewModel as Class for create multiple instance
    class FormComponentVewModel {
        constructor() {
            this.personalDetails = [
                {
                    show: true,
                    inputName: 'firstName',
                    label: 'First name',
                    value: 'adam',
                    updatedCss: 'updated',
                },
                {
                    show: true,
                    inputName: 'lastName',
                    label: 'Last name',
                    value: 'chow',
                    updatedCss: 'updated',
                },
                {
                    show: true,
                    inputName: 'phone',
                    label: 'Phone',
                    value: '987654321',
                    updatedCss: 'updated',
                },
                {
                    show: true,
                    inputName: 'age',
                    label: 'Age',
                    value: '3',
                    updatedCss: 'updated',
                },
                {
                    show: true,
                    inputName: 'gender',
                    label: 'Gender',
                    value: 'male',
                    updatedCss: 'updated',
                },
            ];
        }

        getInputIdName(index) {
            let inputSetting = this.personalDetails[index];
            return {
                id: inputSetting.inputName,
                name: inputSetting.inputName,
            };
        }
        onInputChange(e, $el, newValue, oldValue, index) {
            console.log('onInputChange: ', this);
            this.personalDetails[index].show = false;
            this.updateView();
        }

        addRows(e) {
            e.preventDefault();
            this.personalDetails.push(
                {
                    show: true,
                    inputName: 'address',
                    label: 'Address',
                    value: '',
                    updatedCss: 'updated',
                },
                {
                    show: true,
                    inputName: 'country',
                    label: 'Country',
                    value: '',
                    updatedCss: 'updated',
                }
            );
            this.updateView();
        }
        removeRows(e) {
            e.preventDefault();
            this.personalDetails.splice(this.personalDetails.length - 2, 2);
            this.updateView();
        }
        afterTemplateRender() {
            console.log('template rendered');
        }
        updateView(opt) {
            this.APP.render(opt);
        }
    }

    // formComponentC viewModel
    forOfComponentViewModel = new FormComponentVewModel();

    // start binding on DOM ready
    $(document).ready(function() {
        // formComponentC - test for-of binding
        forOfComponent = dataBind.init(
            $('[data-jq-comp="forOfComponent"]'),
            forOfComponentViewModel
        );
        forOfComponent.render().then(function() {
            // for debug
            console.log(forOfComponent);
            window.forOfComponent = forOfComponent;
        });
    });
})(jQuery, window);

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
        getResultItemAttr: function(index) {
            let self = this;
            return {
                src: self.searchResults[index].image || '',
                alt: self.searchResults[index].title || '',
            };
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
