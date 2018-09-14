import {bindingAttrs as configBindingAttrs, constants} from './config';
import {getViewModelPropValue, each, removeElement} from './util';
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

    if (!dataKey || (cache.isOnce && !cache.hasIterationBindingCache)) {
        return;
    }

    cache.elementData = cache.elementData || {};
    cache.type = cache.type || configBindingAttrs.if;

    let oldViewModelProValue = cache.elementData.viewModelPropValue;
    // getViewModelPropValue could be return undefined or null
    let viewModelPropValue = getViewModelPropValue(viewModel, cache) || false;

    if (cache.filters && cache.filters.length) {
        each(cache.filters, (index, value) => {
            if (value === constants.filters.ONCE) {
                cache.isOnce = true;
            } else {
                // TODO - curry value to each pipe
            }
        });
    }

    // do nothing if viewModel value not changed and no child bindings
    if (oldViewModelProValue === viewModelPropValue && !cache.hasIterationBindingCache) {
        return;
    }

    let shouldRender = Boolean(viewModelPropValue);
    // store new show status
    cache.elementData.viewModelPropValue = viewModelPropValue;

    // remove element
    if (!shouldRender && cache.isOnce && cache.el.parentNode) {
        removeElement(cache.el);
        // TODO remove this from bindingCache
        return;
    }

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

        if (cache.isOnce) {
            delete cache.fragment;
            // TODO remove this from bindingCache
        }
    }
};

export default ifBinding;
