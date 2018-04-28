(function($, window) {
    let myComponent;
    const viewModel = {
        renderIntro: false,
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
