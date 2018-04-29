import {bindingAttrs as configBindingAttrs} from './config';
import {getViewModelValue, resolveViewModelContext, resolveParamList} from './util';
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

    cache.type = configBindingAttrs.forOf;

    // store element insertion reference
    cache.parentElement = cache.el.parentElement;
    cache.previousNonTemplateElement = cache.el.previousSibling;
    cache.nextNonTemplateElement = cache.el.nextSibling;

    dataKey = isInvertBoolean ? dataKey.substring(1) : dataKey;
    shouldRender = getViewModelValue(viewModel, dataKey);

    // do nothing if data in viewModel is undefined
    if (typeof shouldRender === 'undefined' || shouldRender === null) {
        return;
    }

    if (typeof shouldRender === 'function') {
        viewModelContext = resolveViewModelContext(viewModel, dataKey);
        paramList = paramList ? resolveParamList(viewModel, paramList) : [];
        let args = [oldRenderStatus, cache.el].concat(paramList);
        shouldRender = shouldRender.apply(viewModelContext, args);
    }

    shouldRender = Boolean(shouldRender);

    // reject if nothing changed
    if (oldRenderStatus === shouldRender) {
        return;
    }

    // store new show status
    cache.elementData.renderStatus = shouldRender;

    // reverse if has '!' expression from DOM deceleration
    if (isInvertBoolean) {
        shouldRender = !shouldRender;
    }

    if (!shouldRender) {
        // remove element
        removeIfBinding({
            bindingData: cache,
            viewModel: viewModel,
            bindingAttrs: bindingAttrs,
        });
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
