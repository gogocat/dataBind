import {bindingUpdateConditions} from './config';
import * as applyBindingModule from './applyBinding';
import createBindingOption from './createBindingOption';
import renderTemplate from './renderTemplate';
import type {ElementCache, ViewModel, BindingAttrs} from './types';
import type {BindingOption} from './createBindingOption';

interface BinderContext {
    updateElementCache: (opt: {
        allCache?: boolean;
        templateCache?: boolean;
        elementCache?: ElementCache;
        isRenderedTemplates?: boolean;
    }) => void;
}

const renderTemplatesBinding = ({
    ctx,
    elementCache,
    updateOption,
    bindingAttrs,
    viewModel,
}: {
    ctx: BinderContext;
    elementCache: ElementCache;
    updateOption: BindingOption;
    bindingAttrs: BindingAttrs;
    viewModel: ViewModel;
}): boolean => {
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
            elementCache[bindingAttrs.tmp].forEach(($element: unknown) => {
                renderTemplate($element as import('./types').BindingCache, viewModel, bindingAttrs, elementCache);
            });
            // update cache after all template(s) rendered
            ctx.updateElementCache({
                templateCache: true,
                elementCache,
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
                ctx,
                elementCache: elementCache[bindingAttrs.tmp][i].bindingCache as ElementCache,
                updateOption,
                bindingAttrs,
                viewModel,
            });
        }
    }
    return true;
};

export default renderTemplatesBinding;
