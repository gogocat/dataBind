import {bindingAttrs as configBindingAttrs, constants} from './config';
import {getViewModelPropValue, removeElement} from './util';
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

    if (!dataKey || (cache.isOnce && cache.hasIterationBindingCache === false)) {
        return;
    }

    cache.elementData = cache.elementData || {};
    cache.type = cache.type || configBindingAttrs.if;

    let oldViewModelProValue = cache.elementData.viewModelPropValue;
    // getViewModelPropValue could be return undefined or null
    let viewModelPropValue = getViewModelPropValue(viewModel, cache) || false;

    // do nothing if viewModel value not changed and no child bindings
    if (oldViewModelProValue === viewModelPropValue && !cache.hasIterationBindingCache) {
        return;
    }

    let shouldRender = Boolean(viewModelPropValue);

    // remove this cache from parent array
    if (!shouldRender && cache.isOnce && cache.el.parentNode) {
        removeElement(cache.el);
        // delete cache.fragment;
        if (viewModel.APP.postProcessQueue) {
            viewModel.APP.postProcessQueue.push(
                ((cache, index) => () => {
                    cache[constants.PARENT_REF].splice(index, 1);
                })(cache, cache[constants.PARENT_REF].indexOf(cache))
            );
        }
        return;
    }

    // store new show status
    cache.elementData.viewModelPropValue = viewModelPropValue;

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

        // if render once
        // remove this cache from parent array if no child caches
        if (cache.isOnce && !cache.hasIterationBindingCache) {
            // delete cache.fragment;
            if (viewModel.APP.postProcessQueue) {
                viewModel.APP.postProcessQueue.push(
                    ((cache, index) => () => {
                        cache[constants.PARENT_REF].splice(index, 1);
                    })(cache, cache[constants.PARENT_REF].indexOf(cache))
                );
            }
        }
    }
};

export default ifBinding;
