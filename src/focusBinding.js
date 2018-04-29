/* eslint-disable no-invalid-this */
import {getViewModelValue, resolveViewModelContext, resolveParamList} from './util';

/**
 * focusBinding
 * DOM decleartive on focus event binding
 * event handler bind to viewModel method according to the DOM attribute
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
const focusBinding = (cache, viewModel, bindingAttrs) => {
    let handlerName = cache.dataKey;
    let paramList = cache.parameters;
    let handlerFn;
    let viewModelContext;

    if (!handlerName) {
        return;
    }

    handlerFn = getViewModelValue(viewModel, handlerName);

    if (typeof handlerFn === 'function') {
        viewModelContext = resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? resolveParamList(viewModel, paramList) : [];
        $(cache.el)
            .off('focus.databind')
            .on('focus.databind', function(e) {
                let args = [e, $(this)].concat(paramList);
                handlerFn.apply(viewModelContext, args);
            });
    }
};

export default focusBinding;
