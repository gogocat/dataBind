/* eslint-disable no-invalid-this */
import {
    getViewModelValue,
    resolveViewModelContext,
    resolveParamList,
} from './util';

/**
 * focusBinding
 * DOM decleartive on focus event binding
 * event handler bind to viewModel method according to the DOM attribute
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 * @param {boolean} forceRender
 */
const focusBinding = (cache, viewModel, bindingAttrs, forceRender) => {
    const handlerName = cache.dataKey;
    let paramList = cache.parameters;
    let viewModelContext;
    const APP = viewModel.APP || viewModel.$root.APP;

    if (!handlerName || (!forceRender && !APP.$rootElement.contains(cache.el))) {
        return;
    }

    const handlerFn = getViewModelValue(viewModel, handlerName);

    if (typeof handlerFn === 'function') {
        viewModelContext = resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? resolveParamList(viewModel, paramList) : [];

        function focusHandler(e) {
            const args = [e, e.currentTarget].concat(paramList);
            handlerFn.apply(viewModelContext, args);
        }

        cache.el.removeEventListener('focus', focusHandler, false);
        cache.el.addEventListener('focus', focusHandler, false);
    }
};

export default focusBinding;
