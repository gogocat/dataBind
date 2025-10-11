import {bindingUpdateConditions} from './config';
import * as applyBindingModule from './applyBinding.js';
import createBindingOption from './createBindingOption';
import renderTemplate from './renderTemplate';

const renderTemplatesBinding = ({ctx, elementCache, updateOption, bindingAttrs, viewModel}) => {
    if (!elementCache || !bindingAttrs) {
        return false;
    }
    // render and apply binding to template(s) and forOf DOM
    if (elementCache[bindingAttrs.tmp] && elementCache[bindingAttrs.tmp].length) {
        // when re-render call with {templateBinding: true}
        // template and nested templates
        if (updateOption.templateBinding) {
            // overwrite updateOption with 'init' bindingUpdateConditions
            updateOption = createBindingOption(bindingUpdateConditions.init);

            // forEach is correct here - nested templates are added to array but rendered recursively
            // We don't want the loop to re-render templates that were already rendered via recursion
            elementCache[bindingAttrs.tmp].forEach(($element) => {
                renderTemplate($element, viewModel, bindingAttrs, elementCache);
            });
            // update cache after all template(s) rendered
            ctx.updateElementCache({
                templateCache: true,
                elementCache: elementCache,
                isRenderedTemplates: true,
            });
        }
        // enforce render even element is not in DOM tree
        updateOption.forceRender = true;

        // apply bindings to rendered templates element
        // Use namespace import to access the function at runtime,
        // which breaks the circular dependency during module initialization
        // Use for loop to handle templates added during rendering
        for (let i = 0; i < elementCache[bindingAttrs.tmp].length; i++) {
            applyBindingModule.default({
                elementCache: elementCache[bindingAttrs.tmp][i].bindingCache,
                updateOption: updateOption,
                bindingAttrs: bindingAttrs,
                viewModel: viewModel,
            });
        }
    }
    return true;
};

export default renderTemplatesBinding;
