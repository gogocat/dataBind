import {bindingAttrs as configBindingAttrs} from './config';
import {getViewModelPropValue} from './util';
import {createClonedElementCache, wrapCommentAround} from './commentWrapper';
import {renderIfBinding, removeIfBinding} from './renderIfBinding';

/**
 * if-Binding
 * @description
 * DOM decleartive for binding.
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
const ifBinding = (cache, viewModel, bindingAttrs) => {
    let dataKey = cache.dataKey;

    if (!dataKey) {
        return;
    }

    cache.elementData = cache.elementData || {};
    cache.type = cache.type || configBindingAttrs.if;

    let oldViewModelProValue = cache.elementData.viewModelProValue;
    let viewModelProValue = getViewModelPropValue(viewModel, cache);
    let shouldRender = Boolean(viewModelProValue);

    if (oldViewModelProValue === viewModelProValue && !cache.hasIterationBindingCache) {
        return;
    }

    // store new show status
    cache.elementData.viewModelProValue = viewModelProValue;

    // only create fragment once
    // wrap comment tag around
    // remove if attribute from original element to allow later dataBind parsing
    if (!cache.fragment) {
        wrapCommentAround(cache, cache.el);
        cache.el.removeAttribute(bindingAttrs.if);
        createClonedElementCache(cache);
    }

    if (!shouldRender) {
        // remove element
        removeIfBinding(cache);
    } else {
        // render element
        renderIfBinding({
            bindingData: cache,
            viewModel: viewModel,
            bindingAttrs: bindingAttrs,
        });
    }
};

export default ifBinding;
