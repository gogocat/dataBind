// databing search-bar

(function (window) {
    let compSearchBar;

    const viewModel = {
        searchWord: '',
        searchLocation: '',
        searching: false,
        onSearchWordChange(e, el, newValue, oldValue) {
            console.log('onSearchWordChange: ', ' newValue: ', newValue, ' oldValue: ', oldValue);
        },
        onSearchLocationChange(e, el, newValue, oldValue) {
            console.log('onSearchWordChange: ', ' newValue: ', newValue, ' oldValue: ', oldValue);
        },
        onSearchSubmit(e, form, formData) {
            e.preventDefault();

            // simple validation
            if (!formData.searchWord || !formData.location) {
                return;
            }

            formData.searchWord = formData.searchWord.trim();
            formData.location = formData.location.trim();
            compSearchBar.publish('SEARCH-AD', formData);
            this.searching = true;
            this.updateStatus();
            console.log('onSearchSubmit: ', formData);
        },
        onSearchCompleted() {
            this.searching = false;
            this.updateStatus();
        },
        updateStatus() {
            compSearchBar.render();
        },
    };

    document.addEventListener('DOMContentLoaded', () => {
        const searchBarElement = document.querySelector('[data-bind-comp="search-bar"]');
        compSearchBar = dataBind.init(searchBarElement, viewModel);
        compSearchBar.render().then((comp) => {
            const self = comp;
            compSearchBar.subscribe('SEARCH-COMPLETED', self.viewModel.onSearchCompleted);
            // for debug only
            window.compSearchBarViewModel = self.viewModel;
            window.compSearchBar = compSearchBar;

            console.log('compSearchBar rendered', window.compSearchBar);
        });
    });
})(window);
