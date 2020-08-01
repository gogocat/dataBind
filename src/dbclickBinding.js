/* eslint-disable no-invalid-this */
import {
    getViewModelValue,
    resolveViewModelContext,
    resolveParamList,
} from './util';

/**
 * dblclickBinding
 * DOM decleartive double click event binding
 * event handler bind to viewModel method according to the DOM attribute
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 * @param {boolean} forceRender
 */
const dblclickBinding = (cache, viewModel, bindingAttrs, forceRender) => {
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

        function dbclickHandler(e) {
            const args = [e, e.currentTarget].concat(paramList);
            handlerFn.apply(viewModelContext, args);
        }

        cache.el.removeEventListener('dblclick', dbclickHandler, false);
        cache.el.addEventListener('dblclick', dbclickHandler, false);
    }
};

export default dblclickBinding;
