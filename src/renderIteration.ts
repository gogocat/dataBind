import {bindingUpdateConditions} from './config';
import createBindingOption from './createBindingOption';
import renderTemplatesBinding from './renderTemplatesBinding';
import * as applyBindingModule from './applyBinding';

/**
 * renderIteration
 * @param {object} opt
 * @description
 * render element's binding by supplied elementCache
 * This function is desidned for FoOf, If, switch bindings
 */
const renderIteration = ({elementCache, iterationVm, bindingAttrs, isRegenerate}: any): void => {
    const bindingUpdateOption = isRegenerate ? createBindingOption(bindingUpdateConditions.init) : createBindingOption();

    // enforce render even element is not in DOM tree
    bindingUpdateOption.forceRender = true;

    // render and apply binding to template(s)
    // this is an share function therefore passing current APP 'this' context
    // viewModel is a dynamic generated iterationVm
    renderTemplatesBinding({
        ctx: iterationVm.$root ? iterationVm.$root.APP : iterationVm.APP,
        elementCache,
        updateOption: bindingUpdateOption,
        bindingAttrs,
        viewModel: iterationVm,
    });

    // Use namespace import to access the function at runtime,
    // which breaks the circular dependency during module initialization
    applyBindingModule.default({
        ctx: iterationVm.$root ? iterationVm.$root.APP : iterationVm.APP,
        elementCache,
        updateOption: bindingUpdateOption,
        bindingAttrs,
        viewModel: iterationVm,
    });
};

export default renderIteration;
