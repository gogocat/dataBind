// databing compSearchResults

(function($, window) {
    const isGithubPage = window.location.hostname === 'gogocat.github.io';

    const examplePath = isGithubPage ? 'https://gogocat.github.io/dataBind/examples/' : '/examples/';

    let compSearchResults;

    let searchUrl = `${examplePath}bootstrap/js/searchResult.json`;

    let featureAdsResultUrl = `${examplePath}bootstrap/js/featureAdsResult.json`;

    let $searchResultColumns = $('#search-result-columns');

    let converResultsData = function(data) {
        ret = [];
        data.forEach(function(item, index) {
            let newItem = $.extend({}, item);
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

    let viewModel = {
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
            let self = this;

            this.isNewSearch = JSON.stringify(self.currentQuery) !== JSON.stringify(formData);

            self.currentQuery = formData;

            $.getJSON(searchUrl, self.currentQuery)
                .done(function(data) {
                    // mock network delay
                    setTimeout(function() {
                        self.loading = false;
                        self.onSearchResult(data);
                        compSearchResults.publish('SEARCH-COMPLETED', data);
                    }, 1000);
                })
                .fail(function(jqXHR, textStatus, errorThrown) {
                    this.loading = false;
                    compSearchResults.publish('SEARCH-COMPLETED', {
                        fail: errorThrown,
                    });
                    self.logError(jqXHR, textStatus, errorThrown);
                });
        },
        onSearchResult: function(data) {
            let newResults = [];

            if (this.isNewSearch) {
                $searchResultColumns.empty();
                this.searchResults.length = 0;
            }
            // first search result - remove current results (featured items)
            if (compSearchResults.isServerRendered && !this.replacedInitResults) {
                // $searchResultColumns.empty();
                this.searchResultTitle = 'Search results';
                // this.searchResults.length = 0;
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

            console.log('onSearchResult: ', data);
        },
        logError: function() {
            console.warn('search result error: ', arguments);
        },
        onMoreResults: function() {
            // get same mock result as example only
            this.loading = true;
            this.updateStatus();
            this.getSearchResults();
        },
        onAdBookmarkClick: function(e, $el) {
            let activeCss = 'active';

            let isActivated = $el.hasClass(activeCss);

            let resultIndex = $el.attr('data-index');

            this.searchResults[resultIndex].bookmarked = !isActivated;
            this.searchResults[resultIndex].bookmarkedCss = isActivated ? '' : 'active';
            this.updateStatus();
        },
        onAdMessageCheck: function(e, $el, newValue, oldValue) {
            console.log('onAdMessageCheck: ', $el, newValue, oldValue);
            this.updateStatus();
        },
        onMessageTriggerClick: function(e, $el) {
            compSearchResults.publish('TRIGGER-MESSAGE-DIALOG', this.selectedResults);
            console.log('onMessageTriggerClick: ', $el);
        },
        updateStatus: function(opt) {
            this.selectedResults = this.searchResults.filter(function(result, index) {
                return result.selected;
            });
            this.messageTriggerCss = this.selectedResults.length ? 'show' : '';
            compSearchResults.render(opt);
        },
    };

    // get server rendered featureAdsResults then init compSearchResults
    $.getJSON(featureAdsResultUrl).done(function(featureAdsResultData) {
        viewModel.searchResults = converResultsData(featureAdsResultData);

        compSearchResults = dataBind.init($('[data-jq-comp="search-results-component"]'), viewModel);
        compSearchResults
            .render() // overwrite default server rendered option
            .then(function(comp) {
                let self = comp;
                // subscribe events
                compSearchResults.subscribe('SEARCH-AD', self.viewModel.getSearchResults);
                // for debug only
                window.compSearchResultsViewModel = self.viewModel;
                window.compSearchResults = compSearchResults;
                console.log('compSearchResults rendered', window.compSearchResults);
            });
    });
})(jQuery, window);
