import {getViewModelValue, resolveViewModelContext, resolveParamList, getFormData} from './util';

/**
 * submitBinding
 * @description on form submit binding. pass current form data as json object to handler
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 * @param {boolean} forceRender
 */
const submitBinding = (cache, viewModel, bindingAttrs, forceRender) => {
    const handlerName = cache.dataKey;
    let paramList = cache.parameters;
    let viewModelContext;
    const APP = viewModel.APP || viewModel.$root.APP;

    if (!handlerName || (!forceRender && !APP.$rootElement.contains(cache.el))) {
        return;
    }

    const handlerFn = getViewModelValue(viewModel, handlerName);
    const $element = $(cache.el);

    if (typeof handlerFn === 'function') {
        viewModelContext = resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? resolveParamList(viewModel, paramList) : [];
        // assing on change event
        $element.off('submit.databind').on('submit.databind', function(e) {
            const args = [e, $element, getFormData($element)].concat(paramList);
            handlerFn.apply(viewModelContext, args);
        });
    }
};

export default submitBinding;
