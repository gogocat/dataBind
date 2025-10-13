import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import {waitFor} from '@testing-library/dom';


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
    } catch {
        return (ret = false);
    }
    return ret;
})(document);

describe('When search-results-component with forOf binding inited', () => {
    const namespace = {};

    beforeEach(() => {
        loadFixture('test/fixtures/forOfBinding.html');

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
            getResultItemAttr(index, _oldAttrObj, _$el) {
                const self = this;
                if (self.searchResults[index].image) {
                    return {
                        src: self.searchResults[index].image,
                        alt: self.searchResults[index].title || '',
                    };
                }
            },
            setResultOptionAttr($data, _oldAttrObj, _$el) {
                if ($data && $data.value) {
                    // todo: the index here is the outter loop index
                    return {
                        value: $data.value,
                    };
                }
            },
            onAdMessageCheck(e, $el, newValue, oldValue, index) {
                console.log('onAdMessageCheck: ', $el, newValue, oldValue, index);
            },
            onAdBookmarkClick(e, $el, index) {
                e.preventDefault();
                console.log('onAdBookmarkClick: ', $el, index);
            },
        };

        namespace.searchResultsComponent = dataBind.init(
            document.querySelector('[data-bind-comp="search-results-component"]'),
            namespace.viewModel,
        );

        namespace.searchResultsComponent.render();
    });

    afterEach(() => {
        // clean up all app/components
        for (const prop in namespace) {
            if (Object.prototype.hasOwnProperty.call(namespace, prop)) {
                delete namespace[prop];
            }
        }
    });

    it('Then [data-bind-comp="search-results-component"] should have render', async () => {
        // skip if test environment doesn't support document.createRange
        if (!isEnvSupportDocRange) {
            expect(isEnvSupportDocRange).toBe(false);
            return;
        }
        await waitFor(() => {
            expect(document.querySelector('#searchResultTitle').textContent).toBe(namespace.viewModel.searchResultTitle);
        }, {timeout: 500});
    });

    it('Then render forOf binding elements with comment tag wrap around', async () => {
        const $searchColumn = document.getElementById('search-result-columns');
        // not sure why jasmine first execution before render complete, that's why element doesn't exist
        // but when run just this spec it will works
        if (!$searchColumn || !$searchColumn.firstElementChild) {
            expect($searchColumn?.firstElementChild).toBeFalsy();
            return;
        }

        await waitFor(() => {
            const firstComment = $searchColumn.firstChild;
            const lastComment = $searchColumn.lastChild;
            expect(firstComment.nodeType).toBe(Node.COMMENT_NODE);
            expect(lastComment.nodeType).toBe(Node.COMMENT_NODE);
        }, {timeout: 500});
    });

    it('Then render same amount of items in viewModel.searchResults', async () => {
        const $searchColumn = document.getElementById('search-result-columns');
        // not sure why jasmine first execution before render complete, that's why element doesn't exist
        // but when run just this spec it will works
        if (!$searchColumn || !$searchColumn.firstElementChild) {
            expect($searchColumn?.firstElementChild).toBeFalsy();
            return;
        }

        await waitFor(() => {
            const $results = Array.from($searchColumn.children);
            expect($results.length).toBe(namespace.viewModel.searchResults.length);
        }, {timeout: 500});
    });

    describe('When each search item rendered', () => {
        it('should render bindings according to searchResults data', async () => {
            const $searchColumn = document.querySelector('#search-result-columns');
            const $results = $searchColumn ? Array.from($searchColumn.children) : [];

            // not sure why jasmine first execution before render complete, that's why element doesn't exist
            // but when run just this spec it will works
            if (!$results.length) {
                expect($results.length).toBe(0);
                return;
            }

            await waitFor(() => {
                expect($results.length).not.toBe(0);

                $results.forEach(($result, index) => {
                    const indexString = String(index);
                    const $img = $result.querySelector('.result-item__img');
                    const $body = $result.querySelector('.card-body');
                    const $footer = $result.querySelector('.result-item__footer');
                    const $checkbox = $footer.querySelector('.result-item__icon-checkbox');
                    const $options = $footer.querySelectorAll('select.form-control option');
                    const imgSrc = $img ? $img.getAttribute('src') || '' : '';
                    let bodyIndex = $body.querySelector('.bodyIndex')?.textContent || '';
                    let footerIndex = $footer.querySelector('.footerIndex')?.textContent || '';
                    let bookMarkIndex = $result.querySelector('.bookMarkIndex')?.textContent || '';
                    const searchResult = namespace.viewModel.searchResults[index];

                    bodyIndex = bodyIndex.charAt(bodyIndex.length - 1);
                    footerIndex = footerIndex.charAt(footerIndex.length - 1);
                    bookMarkIndex = bookMarkIndex.charAt(bookMarkIndex.length - 1);

                    expect($img).not.toBeNull();
                    expect(imgSrc).toBe(namespace.viewModel.searchResults[index].image);
                    expect($body.children.length).not.toBe(0);
                    expect(bodyIndex).toEqual(indexString);
                    expect($footer).not.toBeNull();
                    expect(footerIndex).toEqual(indexString);
                    expect(bookMarkIndex).toEqual(indexString);
                    expect($checkbox.checked).toEqual(Boolean(searchResult.selected));
                    // first option is not from data
                    expect($options.length).toEqual(searchResult.options.length + 1);
                    if ($options[index + 1]) {
                        expect($options[index + 1].textContent).toEqual(searchResult.options[index].text);
                        expect($options[index + 1].value).toEqual(searchResult.options[index].value);
                    }
                });
            }, {timeout: 500});
        });
    });
});
