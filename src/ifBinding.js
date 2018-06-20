import {bindingAttrs as configBindingAttrs} from './config';
import {getViewModelValue, resolveViewModelContext, resolveParamList} from './util';
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
    let paramList = cache.parameters;

    if (!dataKey) {
        return;
    }

    cache.elementData = cache.elementData || {};

    let oldRenderStatus = cache.elementData.renderStatus;
    let isInvertBoolean = dataKey.charAt(0) === '!';
    let shouldRender;
    let viewModelContext;

    cache.type = configBindingAttrs.if;
    dataKey = isInvertBoolean ? dataKey.substring(1) : dataKey;
    shouldRender = getViewModelValue(viewModel, dataKey);

    if (typeof shouldRender === 'function') {
        viewModelContext = resolveViewModelContext(viewModel, dataKey);
        paramList = paramList ? resolveParamList(viewModel, paramList) : [];
        let args = [oldRenderStatus, cache.el].concat(paramList);
        shouldRender = shouldRender.apply(viewModelContext, args);
    }

    shouldRender = Boolean(shouldRender);

    if (oldRenderStatus === shouldRender && !cache.hasIterationBindingCache) {
        return;
    }

    // store new show status
    cache.elementData.renderStatus = shouldRender;

    // reverse if has '!' expression from DOM deceleration
    if (isInvertBoolean) {
        shouldRender = !shouldRender;
    }

    // only create fragment once
    if (!cache.fragment) {
        createClonedElementCache(cache);
        wrapCommentAround(cache, cache.el);
        cache.el.removeAttribute(bindingAttrs.if);
    }

    if (!shouldRender) {
        // remove element
        removeIfBinding(cache);
        // remove cache.IterationBindingCache
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
