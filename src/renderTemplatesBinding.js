import {bindingUpdateConditions} from './config';
import applyBinding from './applyBindingExport';
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
        elementCache[bindingAttrs.tmp].forEach((cache) => {
            applyBinding({
                elementCache: cache.bindingCache,
                updateOption: updateOption,
                bindingAttrs: bindingAttrs,
                viewModel: viewModel,
            });
        });
    }
    return true;
};

export default renderTemplatesBinding;
