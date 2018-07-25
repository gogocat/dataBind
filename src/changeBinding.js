/* eslint-disable no-invalid-this */
import {getViewModelValue, setViewModelValue, resolveViewModelContext, resolveParamList} from './util';

/**
 * changeBinding
 * @description input element on change event binding. DOM -> viewModel update
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 * @param {boolean} forceRender
 */
const changeBinding = (cache, viewModel, bindingAttrs, forceRender) => {
    let handlerName = cache.dataKey;
    let paramList = cache.parameters;
    let modelDataKey = cache.el.getAttribute(bindingAttrs.model);
    let handlerFn;
    let newValue = '';
    let oldValue = '';
    let viewModelContext;
    let APP = viewModel.APP || viewModel.$root.APP;

    if (!handlerName || (!forceRender && !APP.$rootElement.contains(cache.el))) {
        return;
    }

    handlerFn = getViewModelValue(viewModel, handlerName);

    if (typeof handlerFn === 'function') {
        viewModelContext = resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? resolveParamList(viewModel, paramList) : [];

        // assing on change event
        $(cache.el)
            .off('change.databind')
            .on('change.databind', function(e) {
                let $this = $(this);
                let isCheckbox = $this.is(':checkbox');
                newValue = isCheckbox ? $this.prop('checked') : _.escape($this.val());
                // set data to viewModel
                if (modelDataKey) {
                    oldValue = getViewModelValue(viewModel, modelDataKey);
                    setViewModelValue(viewModel, modelDataKey, newValue);
                }
                let args = [e, $this, newValue, oldValue].concat(paramList);
                handlerFn.apply(viewModelContext, args);
                oldValue = newValue;
            });
    }
};

export default changeBinding;
