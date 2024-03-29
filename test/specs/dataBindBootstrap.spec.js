/* eslint-disable max-len */
describe('Given dataBindBootstrp initised', () => {
    const namespace = {};
    const converResultsData = function(data) {
        ret = [];
        data.forEach(function(item, index) {
            const newItem = $.extend({}, item);
            if (newItem.bookmarked) {
                newItem.bookmarkedCss = 'active';
            }
            if (newItem.highlight) {
                newItem.highlightCss = 'result-item--highlight';
            }
            ret.push(newItem);
        });
        return ret;
    };

    jasmine.getFixtures().fixturesPath = 'test';

    beforeEach(() => {
        const searchUrl = '/test/mocks/searchResult.json';
        // var featureAdsResultUrl = '/test/mocks/featureAdsResult.json';
        const el = {
            searchResultColumns: '#search-result-columns',
            messageModal: '#message-modal',
            messageTextArea: '#message',
        };

        loadFixtures('./fixtures/dataBindBootstrap.html');

        $.each(el, function(k, v) {
            el[k] = $(v);
        });

        namespace.searchBarComponentVM = {
            searchWord: '',
            searchLocation: '',
            searching: false,
            onSearchWordChange: function(e, $el, newValue, oldValue) {
                console.log('onSearchWordChange');
                expect(typeof e.preventDefault).toBe('function');
                expect($el instanceof jQuery).toBe(true);
                expect(newValue).not.toBe(oldValue);
            },
            onSearchLocationChange: function(e, $el, newValue, oldValue) {
                expect(typeof e.preventDefault).toBe('function');
                expect($el instanceof jQuery).toBe(true);
                expect(newValue).not.toBe(oldValue);
            },
            onSearchSubmit: function(e, $form, formData) {
                e.preventDefault();
                expect($form instanceof jQuery).toBe(true);
                expect($form[0].tagName).toBe('FORM');
                expect($.isPlainObject(formData)).toBe(true);

                // TODO: may be test publish even elsewhere
                formData.searchWord = formData.searchWord.trim();
                formData.location = formData.location.trim();
                namespace.searchBarComponent.publish('SEARCH-AD', formData);

                this.searching = true;
                this.updateStatus();
            },
            onSearchCompleted: function() {
                this.searching = false;
                this.updateStatus();
            },
            updateStatus: function() {
                namespace.searchBarComponent.render();
            },
        };

        namespace.searchResultsComponentVM = {
            searchResultTitle: 'Featured service providers',
            messageTriggerCss: '',
            bookmarkCss: '',
            searchResults: [],
            selectedResults: [],
            startIndex: -1,
            loading: false,
            showMore: false,
            replacedInitResults: false,
            isNewSearch: false,
            currentQuery: null,
            getSearchResults: function(formData) {
                const self = this;

                this.isNewSearch = JSON.stringify(self.currentQuery) !== JSON.stringify(formData);

                self.currentQuery = formData;

                $.getJSON(searchUrl, self.currentQuery)
                    .done(function(data) {
                        // mock network delay
                        setTimeout(function() {
                            self.loading = false;
                            self.onSearchResult(data);
                            namespace.searchResultsComponent.publish('SEARCH-COMPLETED', data);
                        }, 20);
                    })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        this.loading = false;
                        namespace.searchResultsComponent.publish('SEARCH-COMPLETED', {
                            fail: errorThrown,
                        });
                        self.logError(jqXHR, textStatus, errorThrown);
                    });
            },
            onSearchResult: function(data) {
                let newResults = [];

                if (this.isNewSearch) {
                    el.searchResultColumns.empty();
                    this.searchResults.length = 0;
                }
                // first search result - remove current results (featured items)
                if (namespace.searchResultsComponent.isServerRendered && !this.replacedInitResults) {
                    this.searchResultTitle = 'Search results';
                    this.replacedInitResults = true;
                } else {
                    // using append template logic - results will be append into existing results
                    // mark startIndex using current last item index
                    this.startIndex = this.searchResults.length - 1;
                }
                // covert raw data to searchResults view data
                newResults = converResultsData(data);
                // add new results into current searchResults
                this.searchResults = this.searchResults.concat(newResults);
                // flag display showMore button
                this.showMore = true;
                // update template which use startIndex to append new content
                this.updateStatus({
                    templateBinding: true,
                });
            },
            logError: function() {
                console.warn('search result error: ', ...rest);
            },
            onMoreResults: function() {
                // get same mock result as example only
                this.loading = true;
                this.updateStatus();
                this.getSearchResults();
            },
            onAdBookmarkClick: function(e, $el) {
                const activeCss = 'active';
                const isActivated = $el.hasClass(activeCss);
                const resultIndex = $el.attr('data-index');

                this.searchResults[resultIndex].bookmarked = !isActivated;
                this.searchResults[resultIndex].bookmarkedCss = isActivated ? '' : 'active';
                this.updateStatus();
            },
            onAdMessageCheck: function(e, $el, newValue, oldValue) {
                expect(newValue).not.toBe(oldValue);
                this.updateStatus();
            },
            onMessageTriggerClick: function(e, $el) {
                namespace.searchResultsComponent.publish('TRIGGER-MESSAGE-DIALOG', this.selectedResults);
                console.log('onMessageTriggerClick: ', $el);
            },
            updateStatus: function(opt) {
                this.selectedResults = this.searchResults.filter(function(result, index) {
                    return result.selected;
                });
                this.messageTriggerCss = this.selectedResults.length ? 'show' : '';
                namespace.searchResultsComponent.render(opt);
            },
        };

        namespace.messageDialogComponentVM = {
            numSelectedProviders: '',
            selectedAdData: [],
            adIds: [],
            selectedProviders: '',
            defaultMessageText: 'Hi,\nCould you please provide a quote for the following work:\n',
            sendingMessage: false,
            onMessageSubmit: function(e, $el, formData) {
                e.preventDefault();
                formData.ids = this.adIds;
                this.sendingMessage = true;
                this.updateStatus();
                console.log('post data: ', formData);
            },
            onTriggerSelectedAds: function(selectedAdData) {
                this.selectedAdData = selectedAdData;
                this.numSelectedProviders = selectedAdData.length > 1 ? selectedAdData.length : '';
                this.selectedProviders = selectedAdData.length > 1 ? 'advertisers ID: ' : 'advertiser ID:';
                this.adIds = selectedAdData.map(function(item, index) {
                    return item.id;
                });
                this.selectedProviders += this.adIds.toString();
                this.updateStatus();
            },
            updateStatus: function() {
                namespace.messageDialogComponent.render();
            },
        };

        namespace.searchBarComponent = dataBind.init(document.querySelector('[data-bind-comp="search-bar"]'), namespace.searchBarComponentVM);
        namespace.searchBarComponent.render().then(function(ctx) {
            const self = ctx;
            namespace.searchBarComponent.subscribe('SEARCH-COMPLETED', self.viewModel.onSearchCompleted);
        });

        namespace.searchResultsComponent = dataBind.init(
            document.querySelector('[data-bind-comp="search-results-component"]'),
            namespace.searchResultsComponentVM,
        );
        namespace.searchResultsComponent
            .render() // overwrite default server rendered option
            .then(function(ctx) {
                const self = ctx;
                // subscribe events
                namespace.searchResultsComponent.subscribe('SEARCH-AD', self.viewModel.getSearchResults);
            });

        namespace.messageDialogComponent = dataBind.init(
            document.querySelector('[data-bind-comp="message-dialog-component"]'),
            namespace.messageDialogComponentVM,
        );
        namespace.messageDialogComponent.render().then(function(ctx) {
            const self = ctx;
            namespace.messageDialogComponent.subscribe('TRIGGER-MESSAGE-DIALOG', self.viewModel.onTriggerSelectedAds);

            el.messageModal.on('shown.bs.modal', function() {
                el.messageTextArea[0].defaultValue = self.viewModel.defaultMessageText;
                el.messageTextArea.focus();
            });

            el.messageModal.on('hidden.bs.modal', function() {
                el.messageTextArea[0].defaultValue = self.viewModel.defaultMessageText;
                self.viewModel.sendingMessage = false;
            });
        });

        // jasmine spies
        spyOn(namespace.searchBarComponentVM, 'onSearchWordChange');
        spyOn(namespace.searchBarComponentVM, 'onSearchLocationChange');
        // spyOn(namespace.searchBarComponentVM, 'onSearchSubmit');
    });

    afterEach(() => {
        // clean up all app/components
        for (const prop in namespace) {
            if (namespace.hasOwnProperty(prop)) {
                delete namespace[prop];
            }
        }
    });

    it('Then [data-bind-comp="search-bar"] should has bond with namespace.searchBarComponentVM', (done) => {
        const $searchBar = $('[data-bind-comp="search-bar"]');
        const searchBarRoot = $searchBar[0]['$root'];

        setTimeout(function() {
            expect(searchBarRoot).toBeDefined();
            expect(searchBarRoot).toEqual(jasmine.objectContaining(namespace.searchBarComponentVM));
            done();
        }, 200);
    });

    it('When [data-bind-comp="search-bar"] was server rendered then show binding should not update element', (done) => {
        setTimeout(function() {
            expect(namespace.searchBarComponent.isServerRendered).toBe(true);
            expect(namespace.searchBarComponentVM.searching).toBe(false);
            expect($('.spinner--search').is(':visible')).toBe(true);
            done();
        }, 300);
    });

    it('When change #searchWord input value to "Handyman" viewModel onSearchWordChange should have been called', (done) => {
        const newSearchWord = 'Handyman';
        setTimeout(function() {
            const $searchInput = document.getElementById('searchWord');
            const evt = document.createEvent('HTMLEvents');
            evt.initEvent('change', true, true);

            $searchInput.value = newSearchWord;
            $searchInput.dispatchEvent(evt);

            expect(namespace.searchBarComponentVM.onSearchWordChange).toHaveBeenCalled();
            expect(namespace.searchBarComponentVM.searchWord).toEqual(newSearchWord);
            namespace.searchBarComponentVM.onSearchWordChange.calls.reset();
            done();
        }, 200);
    });

    it('When change #location input value to "Melbourne" viewModel onSearchLocationChange should have been called', (done) => {
        const newLocation = 'Melbourne';
        setTimeout(function() {
            const $locationInput = document.getElementById('location');
            const evt = document.createEvent('HTMLEvents');
            evt.initEvent('change', true, true);

            $locationInput.value = newLocation;
            $locationInput.dispatchEvent(evt);

            expect(namespace.searchBarComponentVM.onSearchLocationChange).toHaveBeenCalled();
            expect(namespace.searchBarComponentVM.searchLocation).toEqual(newLocation);
            namespace.searchBarComponentVM.onSearchLocationChange.calls.reset();
            done();
        }, 200);
    });

    it('When [data-bind-comp="search-bar"] was server rendered "data-server-rendered" attribute should have removed', (done) => {
        setTimeout(function() {
            expect($('[data-bind-comp="search-bar"]').attr('data-server-rendered')).not.toBeDefined();
            done();
        }, 200);
    });
});
