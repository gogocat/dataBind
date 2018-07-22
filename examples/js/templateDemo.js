(($, window) => {
    let templateComponent;

    const viewModel = {
        heading: 'Test template binding',
        description: 'This is intro and it is looking good!',
        isDisplay: true,
        onHover: {
            in: function(e, $el) {
                let text = $el.text();
                $el.data('prevText', text);
                $el.text('**' + text + '**');
            },
            out: function(e, $el) {
                let text = $el.data('prevText') || '';
                $el.text(text);
            },
        },
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
