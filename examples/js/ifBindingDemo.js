(function($, window) {
    let myComponent;
    const viewModel = {
        renderIntro: false,
        heading: 'Test if binding',
        description: 'Looking good',
        renderItem: function(e, $el) {
            e.preventDefault();
            this.renderIntro = true;
            this.updateView();
        },
        removeItem: function(e, $el) {
            e.preventDefault();
            this.renderIntro = false;
            this.updateView();
        },
        updateView(opt) {
            this.APP.render(opt);
        },
    };

    // start binding on DOM ready
    $(document).ready(function() {
        // main formApp
        myComponent = dataBind.init($('[data-jq-comp="myComponent"]'), viewModel);
        myComponent.render().then(function() {
            // for debug
            console.log(myComponent);
            window.myComponent = myComponent;
        });
    });
})(jQuery, window);
