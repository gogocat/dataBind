
const fiberViewModel = {
    containerAttr: {style: 'width:auto'},
    containerCss: 'container',
    dots: [],
    dotCss: 'dot',
    onHoverDot: {
        in: function(e, $el, index) {
            $el.style.background = '#ff0';
            this.dots[index].isMouseOver = true;
        },
        out: function(e, $el, index) {
            $el.style.background = '#61dafb';
            this.dots[index].isMouseOver = false;
        },
    },
    updateView(opt) {
        this.APP.render(opt);
    },
};

const startTime = new Date();
const targetSize = 25;
const dotSize = targetSize * 1.3;

/* dots */
function createDotList(size = 1000, x = 0, y = 0) {
    if (size <= targetSize) {
        return [createDot(x - targetSize / 2, y - targetSize / 2)];
    }
    const newSize = size / 2;
    return createDotList(newSize, x, y - newSize / 2).concat(
        createDotList(newSize, x - newSize, y + newSize / 2),
        createDotList(newSize, x + newSize, y + newSize / 2),
    );
}

function createDot(x, y) {
    const dot = {
        attr: {},
    };
    dot.attr.style = `
        left: ${x}px;
        top: ${y}px;
        width: ${dotSize}px;
        height: ${dotSize}px;
        line-height: ${dotSize}px;
        background: #61dafb;
    `.replace(/\n\s+/g, '');

    return dot;
}

function recursiveUpdateDotsData(viewModel) {
    const remainder = getElapsedSecond() % 10;
    const text = Math.floor(remainder) + '';
    const scaleXFactor = (1 + (5 - Math.abs(5 - remainder)) / 10) / 2.1;

    // update viewModel data
    viewModel.dots.forEach((dot) => {
        dot.text = dot.isMouseOver ? `*${text}*` : text;
    });

    viewModel.containerAttr.style = `transform: scaleX(${scaleXFactor}) scaleY(0.7) translateZ(0.1px)`;

    // update view
    fiberComponent.render();
    // recursive call this function
    requestAnimationFrame(() => recursiveUpdateDotsData(viewModel));
}

function getElapsedSecond() {
    return (new Date().getTime() - startTime.getTime()) / 1000;
}

// populate dot data in viewModel
fiberViewModel.dots = createDotList();

// start binding on DOM ready
// formComponentC - test for-of binding
const fiberComponent = dataBind.init(document.querySelector('[data-bind-comp="fiberDemoComponent"]'), fiberViewModel);
fiberComponent.render().then(function() {
    // for debug
    console.log(fiberComponent);
    window.fiberComponent = fiberComponent;

    // recursive
    recursiveUpdateDotsData(fiberViewModel);
});

