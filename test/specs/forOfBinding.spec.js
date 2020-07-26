/* eslint-disable max-len */
// It seems PhantomJS has issue with createComment and createRange
const isEnvSupportDocRange = ((document) => {
    let docRange;
    let commentNode;
    const commentText = 'x';
    let ret = true;

    if (typeof document.createRange !== 'function') {
        return (ret = false);
    }
    try {
        docRange = document.createRange();
        docRange.deleteContents();
        commentNode = document.createComment(commentText);
        if (commentNode.nodeType !== 8 || commentNode.textContent !== commentText) {
            return (ret = false);
        }
    } catch (err) {
        return (ret = false);
    }
    return ret;
})(document);

describe('When search-results-component with forOf binding inited', () => {
    const namespace = {};

    jasmine.getFixtures().fixturesPath = 'test';

    beforeEach(() => {
        loadFixtures('./fixtures/forOfBinding.html');

        namespace.viewModel = {
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
                    options: [{text: '4', value: '4'}, {text: '5', value: '5'}, {text: '6', value: '6'}],
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
                    options: [{text: '7', value: '7'}, {text: '8', value: '8'}, {text: '9', value: '9'}],
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

        namespace.searchResultsComponent = dataBind.init(
            document.querySelector('[data-jq-comp="search-results-component"]'),
            namespace.viewModel,
        );

        namespace.searchResultsComponent.render();
    });

    afterEach(() => {
        // clean up all app/components
        for (const prop in namespace) {
            if (namespace.hasOwnProperty(prop)) {
                delete namespace[prop];
            }
        }
    });

    it('Then [data-jq-comp="search-results-component"] should have render', (done) => {
        // skip if test environment doesn't support document.createRange
        if (!isEnvSupportDocRange) {
            expect(isEnvSupportDocRange).toBe(false);
            done();
            return;
        }
        setTimeout(() => {
            expect($('#searchResultTitle').text()).toBe(namespace.viewModel.searchResultTitle);
            // expect($('#search-result-columns').children().length).not.toBe(0);
            done();
        }, 200);
    });

    it('Then render forOf binding elements with comment tag wrap around', (done) => {
        setTimeout(() => {
            const $searchColumn = document.getElementById('search-result-columns');
            // not sure why jasmine first execution before render complete, that's why element doesn't exsits
            // but when run just this spec it will works
            if (!$searchColumn.firstElementChild) {
                expect($searchColumn.firstElementChild).toBe(null);
                done();
                return;
            }
            const firstCommentWrap = $searchColumn.firstElementChild.previousSibling;
            const lastCommentWrap = $searchColumn.lastElementChild.nextSibling;

            expect(firstCommentWrap.nodeType).toBe(8);
            expect(lastCommentWrap.nodeType).toBe(8);
            expect(firstCommentWrap.textContent).toContain('data-forOf');
            expect(lastCommentWrap.textContent).toContain('data-forOf');
            done();
        }, 200);
    });

    it('Then render same amount of items in viewModel.searchResults', (done) => {
        setTimeout(() => {
            const $searchColumn = document.getElementById('search-result-columns');
            // not sure why jasmine first execution before render complete, that's why element doesn't exsits
            // but when run just this spec it will works
            if (!$searchColumn.firstElementChild) {
                expect($searchColumn.firstElementChild).toBe(null);
                done();
                return;
            }
            expect($searchColumn.children.length).toBe(namespace.viewModel.searchResults.length);
            done();
        }, 200);
    });

    describe('When each search item rendered', () => {
        it('should render bindings according to searchResults data', (done) => {
            if (!isEnvSupportDocRange) {
                expect(isEnvSupportDocRange).toBe(false);
                done();
                return;
            }
            setTimeout(() => {
                const $results = $('#search-result-columns').children();
                // not sure why jasmine first execution before render complete, that's why element doesn't exsits
                // but when run just this spec it will works
                if (!$results.length) {
                    expect($results.length).toBe(0);
                    done();
                    return;
                }

                expect($results.length).not.toBe(0);

                $results.each(function(index) {
                    const indexString = String(index);
                    const $result = $(this);
                    const $img = $result.find('.result-item__img');
                    const $body = $result.find('.card-body');
                    const $footer = $result.find('.result-item__footer');
                    const $checkbox = $footer.find('.result-item__icon-checkbox');
                    const $options = $footer.find('select.form-control option');
                    const imgSrc = $img.attr('src') || '';
                    let bodyIndex = $body.find('.bodyIndex').text();
                    let footerIndex = $footer.find('.footerIndex').text();
                    let bookMarkIndex = $result.find('.bookMarkIndex').text();
                    const searchResult = namespace.viewModel.searchResults[index];

                    bodyIndex = bodyIndex.charAt(bodyIndex.length - 1);
                    footerIndex = footerIndex.charAt(footerIndex.length - 1);
                    bookMarkIndex = bookMarkIndex.charAt(bookMarkIndex.length - 1);

                    expect($img.length).not.toBe(0);
                    expect(imgSrc).toBe(namespace.viewModel.searchResults[index].image);
                    expect($body.children().length).not.toBe(0);
                    expect(bodyIndex).toEqual(indexString);
                    expect($footer.length).not.toBe(0);
                    expect(footerIndex).toEqual(indexString);
                    expect(bookMarkIndex).toEqual(indexString);
                    expect($checkbox[0].checked).toEqual(Boolean(searchResult.selected));
                    // first option is not from data
                    expect($options.length).toEqual(searchResult.options.length + 1);
                    expect($options.eq(index + 1).text()).toEqual(searchResult.options[index].text);
                    expect($options.eq(index + 1).val()).toEqual(searchResult.options[index].value);
                });

                done();
            }, 200);
        });
    });
});
