(function($, window){

let fiberComponent = {};
const fiberViewModel = {
    containerAttr: {style: 'width:auto'},
    containerCss: 'container',
    dots: [],
    dotCss: 'dot',
    updateView: function(opt) {
        this.APP.render(opt);
    }
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
        createDotList(newSize, x + newSize, y + newSize / 2)
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
    `;
    
    return dot;
}

// populate dot data in viewModel
// fiberViewModel.dots = createDotList();

// start binding on DOM ready
$(document).ready(function() {
    // formComponentC - test for-of binding
    fiberComponent = dataBind.init($('[data-jq-comp="fiberDemoComponent"]'), fiberViewModel);
    fiberComponent.render().then(function() {
        // for debug
        console.log(fiberComponent);
        window.fiberComponent = fiberComponent;
        updateDotsData(fiberViewModel);
    });
});

function updateDotsData(viewModel, oldText, oldHoveredDot) {
    const remainder = getElapsedSecond() % 10;
    const text = Math.floor(remainder);
    let scaleXFactor = ((1 + (5 - Math.abs(5 - remainder)) / 10) / 2.1);
    const hoveredDot = null // wrappedTriangle.querySelector(":hover");
    
    // fiberViewModel.dots.forEach(dot => (dot.text = text));

    /*
    if (hoveredDot) {
        hoveredDot.style.background = "#ff0";
        hoveredDot.textContent = `*${text}*`;
    }
    if (oldHoveredDot && hoveredDot !== oldHoveredDot) {
        oldHoveredDot.style.background = "#61dafb";
        oldHoveredDot.textContent = text;
    }
    */

    fiberViewModel.containerAttr.style = `transform: scaleX(${scaleXFactor}) scaleY(0.7) translateZ(0.1px)`;
    fiberComponent.render();
    // requestAnimationFrame(() => updateDotsData(fiberViewModel, text, hoveredDot));
};

function getElapsedSecond() {
    return (new Date().getTime() - startTime.getTime()) / 1000;
}

// requestAnimationFrame(updateDOM);


/*
// UPDATE 
function updateDOM(oldText, oldHoveredDot) {
    const remainder = getElapsedSecond() % 10;
    const text = Math.floor(remainder);
    const hoveredDot = wrappedTriangle.querySelector(":hover");
    if (text !== oldText) {
        dots.forEach(dot => (dot.textContent = text));
    }
    if (hoveredDot) {
        hoveredDot.style.background = "#ff0";
        hoveredDot.textContent = `*${text}*`;
    }
    if (oldHoveredDot && hoveredDot !== oldHoveredDot) {
        oldHoveredDot.style.background = "#61dafb";
        oldHoveredDot.textContent = text;
    }
    transformContainer((1 + (5 - Math.abs(5 - remainder)) / 10) / 2.1);
    requestAnimationFrame(() => updateDOM(text, hoveredDot));
}

function transformContainer(scaleXFactor) {
    container.style.transform = `scaleX(${scaleXFactor}) scaleY(0.7) translateZ(0.1px)`;
}
*/


})(jQuery, window);