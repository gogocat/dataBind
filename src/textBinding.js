import {getViewModelValue, resolveViewModelContext, resolveParamList} from './util';

/**
 * textBinding
 * * @description
 * DOM decleartive text binding update dom textnode with viewModel data
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 * @param {boolean} forceRender
 */
const textBinding = (cache, viewModel, bindingAttrs, forceRender) => {
    let dataKey = cache.dataKey;
    let paramList = cache.parameters;
    let viewModelContext;
    let APP = viewModel.APP || viewModel.$root.APP;

    // NOTE: this doesn't work for for-of, if and switch bindings because element was not in DOM
    if (!dataKey || (!forceRender && !APP.$rootElement.contains(cache.el))) {
        return;
    }

    let newValue = getViewModelValue(viewModel, dataKey);
    if (typeof newValue === 'function') {
        viewModelContext = resolveViewModelContext(viewModel, newValue);
        paramList = paramList ? resolveParamList(viewModel, paramList) : [];
        let args = paramList.slice(0);
        newValue = newValue.apply(viewModelContext, args);
    }
    let oldValue = cache.el.textContent;

    if (typeof newValue !== 'undefined' && typeof newValue !== 'object' && newValue !== null) {
        if (newValue !== oldValue) {
            cache.el.textContent = newValue;
        }
    }
};

export default textBinding;
