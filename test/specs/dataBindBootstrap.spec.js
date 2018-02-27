describe('Given dataBindBootstrp initised', function() {
    var namespace = {};
    var converResultsData = function(data) {
        ret = [];
        data.forEach(function(item, index) {
            var newItem = $.extend({}, item);
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

    beforeEach(function() {
        var searchUrl = '/test/mocks/searchResult.json';
        // var featureAdsResultUrl = '/test/mocks/featureAdsResult.json';
        var el = {
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
                var self = this;

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
                var newResults = [];

                if (this.isNewSearch) {
                    el.searchResultColumns.empty();
                    this.searchResults.length = 0;
                }
                // first search result - remove current results (featured items)
                if (
                    namespace.searchResultsComponent.isServerRendered &&
                    !this.replacedInitResults
                ) {
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
                var activeCss = 'active';
                var isActivated = $el.hasClass(activeCss);
                var resultIndex = $el.attr('data-index');

                this.searchResults[resultIndex].bookmarked = !isActivated;
                this.searchResults[resultIndex].bookmarkedCss = isActivated ? '' : 'active';
                this.updateStatus();
            },
            onAdMessageCheck: function(e, $el, newValue, oldValue) {
                expect(newValue).not.toBe(oldValue);
                this.updateStatus();
            },
            onMessageTriggerClick: function(e, $el) {
                namespace.searchResultsComponent.publish(
                    'TRIGGER-MESSAGE-DIALOG',
                    this.selectedResults
                );
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
                this.selectedProviders =
                    selectedAdData.length > 1 ? 'advertisers ID: ' : 'advertiser ID:';
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

        namespace.searchBarComponent = dataBind.init(
            $('[data-jq-comp="search-bar"]'),
            namespace.searchBarComponentVM
        );
        namespace.searchBarComponent.render().then(function() {
            var self = this;
            namespace.searchBarComponent.subscribe(
                'SEARCH-COMPLETED',
                self.viewModel.onSearchCompleted
            );
        });

        namespace.searchResultsComponent = dataBind.init(
            $('[data-jq-comp="search-results-component"]'),
            namespace.searchResultsComponentVM
        );
        namespace.searchResultsComponent
            .render() // overwrite default server rendered option
            .then(function() {
                var self = this;
                // subscribe events
                namespace.searchResultsComponent.subscribe(
                    'SEARCH-AD',
                    self.viewModel.getSearchResults
                );
            });

        namespace.messageDialogComponent = dataBind.init(
            $('[data-jq-comp="message-dialog-component"]'),
            namespace.messageDialogComponentVM
        );
        namespace.messageDialogComponent.render().then(function() {
            var self = this;
            namespace.messageDialogComponent.subscribe(
                'TRIGGER-MESSAGE-DIALOG',
                self.viewModel.onTriggerSelectedAds
            );

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

    afterEach(function() {
        /*
        // clean up all app/components
        for (var prop in namespace) {
            if (namespace.hasOwnProperty(prop)) {
                delete namespace[prop];
            }
        }
        */
    });

    it('Then [data-jq-comp="search-bar"] should has bond with namespace.searchBarComponentVM', function(done) {
        var $searchBar = $('[data-jq-comp="search-bar"]');
        var searchBarRoot = $searchBar.data('$root');

        setTimeout(function() {
            expect(searchBarRoot).toBeDefined();
            expect(searchBarRoot).toEqual(jasmine.objectContaining(namespace.searchBarComponentVM));
            done();
        }, 200);
    });

    it('When [data-jq-comp="search-bar"] was server rendered then show binding should not update element', function(done) {
        setTimeout(function() {
            expect(namespace.searchBarComponent.isServerRendered).toBe(true);
            expect(namespace.searchBarComponentVM.searching).toBe(false);
            expect($('.spinner--search').is(':visible')).toBe(true);
            done();
        }, 200);
    });

    it('When change #searchWord input value to "Handyman" viewModel onSearchWordChange should have been called', function(done) {
        var newSearchWord = 'Handyman';
        setTimeout(function() {
            $('#searchWord')
                .val(newSearchWord)
                .trigger('change');
            expect(namespace.searchBarComponentVM.onSearchWordChange).toHaveBeenCalled();
            expect(namespace.searchBarComponentVM.searchWord).toEqual(newSearchWord);
            namespace.searchBarComponentVM.onSearchWordChange.calls.reset();
            done();
        }, 200);
    });

    it('When change #location input value to "Melbourne" viewModel onSearchLocationChange should have been called', function(done) {
        var newLocation = 'Melbourne';
        setTimeout(function() {
            $('#location')
                .val(newLocation)
                .trigger('change');
            expect(namespace.searchBarComponentVM.onSearchLocationChange).toHaveBeenCalled();
            expect(namespace.searchBarComponentVM.searchLocation).toEqual(newLocation);
            namespace.searchBarComponentVM.onSearchLocationChange.calls.reset();
            done();
        }, 200);
    });

    it('When [data-jq-comp="search-bar"] was server rendered "data-server-rendered" attribute should have removed', function(done) {
        setTimeout(function() {
            expect($('[data-jq-comp="search-bar"]').attr('data-server-rendered')).not.toBeDefined();
            done();
        }, 200);
    });

    it('When click ".search-bar__btn" button with search word and location. Then onSearchSubmit handler in viewModel should have been called', function(done) {
        var newSearchWord = 'Air Conditioner';
        var newLocation = 'Sydney';

        setTimeout(function() {
            $('#searchWord').val(newSearchWord);
            $('#location').val(newLocation);
            $('.search-bar__btn').trigger('click');
            done();
        }, 200);
    });
});
