const viewModel = {
    id: 'objectLiteralId',
    heading: 'Test attribute binding',
    attrObj: {
        style: 'width:300px',
        ref: 'newRef',
    },
    attrFn() {
        return {
            id: 'newId',
            ref: 'newRef2',
        };
    },
    updateView(opt) {
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
