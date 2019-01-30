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
    const handlerName = cache.dataKey;
    let paramList = cache.parameters;
    const modelDataKey = cache.el.getAttribute(bindingAttrs.model);
    let newValue = '';
    let oldValue = '';
    let viewModelContext;
    const APP = viewModel.APP || viewModel.$root.APP;

    if (!handlerName || (!forceRender && !APP.$rootElement.contains(cache.el))) {
        return;
    }

    const handlerFn = getViewModelValue(viewModel, handlerName);

    if (typeof handlerFn === 'function') {
        viewModelContext = resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? resolveParamList(viewModel, paramList) : [];

        // assing on change event
        $(cache.el)
            .off('change.databind')
            .on('change.databind', function(e) {
                const $this = $(this);
                const isCheckbox = $this.is(':checkbox');
                newValue = isCheckbox ? $this.prop('checked') : _.escape($this.val());
                // set data to viewModel
                if (modelDataKey) {
                    oldValue = getViewModelValue(viewModel, modelDataKey);
                    setViewModelValue(viewModel, modelDataKey, newValue);
                }
                const args = [e, $this, newValue, oldValue].concat(paramList);
                handlerFn.apply(viewModelContext, args);
                oldValue = newValue;
            });
    }
};

export default changeBinding;
