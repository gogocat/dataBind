const viewModel = {
    id: 'objectLiteralId',
    heading: 'Test attribute binding',
    attrObj: {
        style: 'width:300px',
        ref: 'newRef',
    },
    attrFn: function($data) {
        return {
            id: 'newId',
            ref: 'newRef2',
        };
    },
    updateView: function(opt) {
        this.APP.render(opt);
    },
};

const attrComponent = dataBind.init(
    document.querySelector('[data-bind-comp="attr-component"]'),
    viewModel,
);

attrComponent
    .render()
    .then(() => {
        // for debug
        console.log(attrComponent);
        window.attrComponent = attrComponent;
    });
