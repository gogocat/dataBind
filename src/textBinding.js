import {getViewModelValue, resolveViewModelContext, resolveParamList} from './util';

/**
 * textBinding
 * * @description
 * DOM decleartive text binding update dom textnode with viewModel data
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
const textBinding = (cache, viewModel, bindingAttrs) => {
    let dataKey = cache.dataKey;
    let paramList = cache.parameters;
    let viewModelContext;

    if (!dataKey) {
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