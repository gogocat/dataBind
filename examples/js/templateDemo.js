(($, window) => {
    let templateComponent;

    const viewModel = {
        heading: 'Test template binding',
        description: 'This is intro and it is looking good!',
        updateView(opt) {
            this.APP.render(opt);
        },
    };

    // start binding on DOM ready
    $(document).ready(() => {
        templateComponent = dataBind.init($('[data-jq-comp="temp-component"]'), viewModel);
        templateComponent.render().then(function() {
            // for debug
            console.log(templateComponent);
            window.templateComponent = templateComponent;
        });
    });
})(jQuery, window);
