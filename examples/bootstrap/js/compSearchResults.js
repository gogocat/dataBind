// databing compSearchResults

(function (window) {
    const isGithubPage = window.location.hostname === 'gogocat.github.io';
    const examplePath = isGithubPage ? 'https://gogocat.github.io/dataBind/examples/' : '/examples/';
    let compSearchResults;
    const searchUrl = `${examplePath}/bootstrap/js/searchResult.json`;
    const featureAdsResultUrl = `${examplePath}/bootstrap/js/featureAdsResult.json`;
    const searchResultColumns = document.getElementById('search-result-columns');
    const converResultsData = function (data) {
        const ret = [];
        data.forEach((item) => {
            const newItem = Object.assign({}, item);
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
    const viewModel = {
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
        getSearchResults(formData) {
            const self = this;

            this.isNewSearch = JSON.stringify(self.currentQuery) !== JSON.stringify(formData);

            self.currentQuery = formData;

            fetch(searchUrl)
                .then(response => response.json())
                .then((data) => {
                    // mock network delay
                    setTimeout(() => {
                        self.loading = false;
                        self.onSearchResult(data);
                        compSearchResults.publish('SEARCH-COMPLETED', data);
                    }, 1000);
                })
                .catch((error) => {
                    self.loading = false;
                    compSearchResults.publish('SEARCH-COMPLETED', {
                        fail: error,
                    });
                    self.logError(error);
                });
        },
        getMessageCheckBoxAttr(data) {
            return {
                id: data.id,
                name: data.id,
            };
        },
        getMessageCheckBoxLabelAttr(data) {
            return {
                for: data.id,
            };
        },
        onSearchResult(data) {
            let newResults = [];

            if (this.isNewSearch) {
                searchResultColumns.innerHTML = '';
                this.searchResults.length = 0;
            }
            // first search result - remove current results (featured items)
            if (compSearchResults.isServerRendered && !this.replacedInitResults) {
                searchResultColumns.innerHTML = '';
                this.searchResultTitle = 'Search results';
                this.searchResults.length = 0;
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
        logError() {

            console.warn('search result error: ', arguments);
        },
        onMoreResults() {
            // get same mock result as example only
            this.loading = true;
            this.updateStatus();
            this.getSearchResults();
        },
        onAdBookmarkClick(e, el) {
            const activeCss = 'active';
            const isActivated = el.classList.contains(activeCss);
            const resultIndex = el.getAttribute('data-index');

            this.searchResults[resultIndex].bookmarked = !isActivated;
            this.searchResults[resultIndex].bookmarkedCss = isActivated ? '' : 'active';
            this.updateStatus();
        },
        onAdMessageCheck(e, el, newValue, oldValue) {
            console.log('onAdMessageCheck: ', el, newValue, oldValue);
            this.updateStatus();
        },
        onMessageTriggerClick(e, el) {
            compSearchResults.publish('TRIGGER-MESSAGE-DIALOG', this.selectedResults);
            console.log('onMessageTriggerClick: ', el);
        },
        updateStatus(opt) {
            this.selectedResults = this.searchResults.filter((result, index) => {
                return result.selected;
            });
            this.messageTriggerCss = this.selectedResults.length ? 'show' : '';
            compSearchResults.render(opt);
        },
    };

    // get server rendered featureAdsResults then init compSearchResults
    fetch(featureAdsResultUrl)
        .then(response => response.json())
        .then((featureAdsResultData) => {
            viewModel.searchResults = converResultsData(featureAdsResultData);

            const searchResultsElement = document.querySelector('[data-bind-comp="search-results-component"]');
            compSearchResults = dataBind.init(searchResultsElement, viewModel);
            compSearchResults
                .render() // overwrite default server rendered option
                .then((comp) => {
                    const self = comp;
                    // subscribe events
                    compSearchResults.subscribe('SEARCH-AD', self.viewModel.getSearchResults);
                    // for debug only
                    window.compSearchResultsViewModel = self.viewModel;
                    window.compSearchResults = compSearchResults;
                    console.log('compSearchResults rendered', window.compSearchResults);
                });
        });
})(window);
