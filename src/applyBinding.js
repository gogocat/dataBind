import hoverBinding from './hoverBinding';
import changeBinding from './changeBinding';
import modelBinding from './modelBinding';
import textBinding from './textBinding';
import showBinding from './showBinding';
import cssBinding from './cssBinding';
import attrBinding from './attrBinding';
import forOfBinding from './forOfBinding'; // depends renderForOfBinding -> this , renderIteration
import ifBinding from './ifBinding';
import switchBinding from './switchBinding';
import createEventBinding from './createEventBinding';

function applyBinding({ctx, elementCache, updateOption, bindingAttrs, viewModel}) {
    if (!elementCache || !updateOption) {
        return;
    }

    // the follow binding should be in order for better efficiency

    // apply forOf Binding
    if (updateOption.forOfBinding && elementCache[bindingAttrs.forOf] && elementCache[bindingAttrs.forOf].length) {
        elementCache[bindingAttrs.forOf].forEach((cache) => {
            forOfBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
        });
    }

    // apply attr Binding
    if (updateOption.attrBinding && elementCache[bindingAttrs.attr] && elementCache[bindingAttrs.attr].length) {
        elementCache[bindingAttrs.attr].forEach((cache) => {
            attrBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
        });
    }

    // apply if Binding
    if (updateOption.ifBinding && elementCache[bindingAttrs.if] && elementCache[bindingAttrs.if].length) {
        elementCache[bindingAttrs.if].forEach((cache) => {
            ifBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
        });
    }

    // apply show Binding
    if (updateOption.showBinding && elementCache[bindingAttrs.show] && elementCache[bindingAttrs.show].length) {
        elementCache[bindingAttrs.show].forEach((cache) => {
            showBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
        });
    }

    // apply switch Binding
    if (updateOption.switchBinding && elementCache[bindingAttrs.switch] && elementCache[bindingAttrs.switch].length) {
        elementCache[bindingAttrs.switch].forEach((cache) => {
            switchBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
        });
    }

    // apply text binding
    if (updateOption.textBinding && elementCache[bindingAttrs.text] && elementCache[bindingAttrs.text].length) {
        elementCache[bindingAttrs.text].forEach((cache) => {
            textBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
        });
    }

    // apply cssBinding
    if (updateOption.cssBinding && elementCache[bindingAttrs.css] && elementCache[bindingAttrs.css].length) {
        elementCache[bindingAttrs.css].forEach((cache) => {
            cssBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
        });
    }

    // apply model binding
    if (updateOption.modelBinding && elementCache[bindingAttrs.model] && elementCache[bindingAttrs.model].length) {
        elementCache[bindingAttrs.model].forEach((cache) => {
            modelBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
        });
    }

    // apply change binding
    if (updateOption.changeBinding && elementCache[bindingAttrs.change] && elementCache[bindingAttrs.change].length) {
        elementCache[bindingAttrs.change].forEach((cache) => {
            changeBinding({
                bindingAttrs,
                cache,
                forceRender: updateOption.forceRender,
                type: 'change',
                viewModel,
            });
        });
    }

    // apply submit binding
    if (updateOption.submitBinding && elementCache[bindingAttrs.submit] && elementCache[bindingAttrs.submit].length) {
        elementCache[bindingAttrs.submit].forEach((cache) => {
            createEventBinding({
                cache,
                forceRender: updateOption.forceRender,
                type: 'submit',
                viewModel,
            });
        });
    }

    // apply click binding
    if (updateOption.clickBinding && elementCache[bindingAttrs.click] && elementCache[bindingAttrs.click].length) {
        elementCache[bindingAttrs.click].forEach((cache) => {
            createEventBinding({
                cache,
                forceRender: updateOption.forceRender,
                type: 'click',
                viewModel,
            });
        });
    }

    // apply double click binding
    if (updateOption.dblclickBinding && elementCache[bindingAttrs.dblclick] && elementCache[bindingAttrs.dblclick].length) {
        elementCache[bindingAttrs.dblclick].forEach((cache) => {
            createEventBinding({
                cache,
                forceRender: updateOption.forceRender,
                type: 'dblclick',
                viewModel,
            });
        });
    }

    // apply blur binding
    if (updateOption.blurBinding && elementCache[bindingAttrs.blur] && elementCache[bindingAttrs.blur].length) {
        elementCache[bindingAttrs.blur].forEach((cache) => {
            createEventBinding({
                cache,
                forceRender: updateOption.forceRender,
                type: 'blur',
                viewModel,
            });
        });
    }

    // apply focus binding
    if (updateOption.focusBinding && elementCache[bindingAttrs.focus] && elementCache[bindingAttrs.focus].length) {
        elementCache[bindingAttrs.focus].forEach((cache) => {
            createEventBinding({
                cache,
                forceRender: updateOption.forceRender,
                type: 'focus',
                viewModel,
            });
        });
    }

    // apply hover binding
    if (updateOption.hoverBinding && elementCache[bindingAttrs.hover] && elementCache[bindingAttrs.hover].length) {
        elementCache[bindingAttrs.hover].forEach((cache) => {
            hoverBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
        });
    }

    // apply input binding - eg html range input
    if (updateOption.inputBinding && elementCache[bindingAttrs.input] && elementCache[bindingAttrs.input].length) {
        elementCache[bindingAttrs.input].forEach((cache) => {
            changeBinding({
                bindingAttrs,
                cache,
                forceRender: updateOption.forceRender,
                type: 'input',
                viewModel,
            });
        });
    }
}

export default applyBinding;
