// databing search-bar

(function($, window) {

    var compSearchBar,
        getFormData = function($form) {
            var sArray = $form.serializeArray(),
                data = {};
            sArray.map(function(n) {
                data[n['name']] = n['value'];
            });

            return data;
        },
        viewModel = {
            searchWord: '',
            searchLocation: '',
            searching: false,
            onSearchWordChange: function(e, $el, newValue, oldValue) {
                console.log('onSearchWordChange: ', ' newValue: ', newValue, ' oldValue: ', oldValue);
            },
            onSearchLocationChange: function(e, $el, newValue, oldValue) {
                console.log('onSearchWordChange: ', ' newValue: ', newValue, ' oldValue: ', oldValue);
            },
            onSearchSubmit: function(e, $form, formData) {
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
            onSearchCompleted: function() {
                this.searching = false;
                this.updateStatus();
            },
            updateStatus: function() {
                compSearchBar.render();
            }
        };

    $(document).ready(function() {

        compSearchBar = dataBind.init($('[data-jq-comp="search-bar"]'), viewModel);
        compSearchBar
            .render()
            .then(function() {
                var self = this;
                compSearchBar.subscribe('SEARCH-COMPLETED', self.viewModel.onSearchCompleted);
                // for debug only
                window.compSearchBarViewModel = self.viewModel;
                window.compSearchBar = compSearchBar;

                console.log('compSearchBar rendered', window.compSearchBar);
            });

    });
}(jQuery, window))