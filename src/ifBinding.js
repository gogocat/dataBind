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

    let oldRenderStatus = cache.elementData.renderStatus;
    let shouldRender;

    cache.type = configBindingAttrs.if;

    shouldRender = getViewModelPropValue(viewModel, cache);

    shouldRender = Boolean(shouldRender);

    if (oldRenderStatus === shouldRender && !cache.hasIterationBindingCache) {
        return;
    }

    // store new show status
    cache.elementData.renderStatus = shouldRender;

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
        // remove cache.IterationBindingCache to prevent memory leak
        if (cache.hasIterationBindingCache) {
            cache.iterationBindingCache = {};
            cache.hasIterationBindingCache = false;
        }
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
