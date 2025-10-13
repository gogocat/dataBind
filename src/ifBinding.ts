import {bindingAttrs as configBindingAttrs, constants} from './config';
import {getViewModelPropValue, removeElement} from './util';
import {createClonedElementCache, wrapCommentAround} from './commentWrapper';
import {renderIfBinding, removeIfBinding} from './renderIfBinding';
import type { BindingCache, ViewModel, BindingAttrs } from './types';

/**
 * if-Binding
 * @description
 * DOM decleartive for binding.
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
const ifBinding = (cache: BindingCache, viewModel: ViewModel, bindingAttrs: BindingAttrs, _forceRender?: boolean): void => {
    const dataKey = cache.dataKey;

    // isOnce only return if there is no child bindings
    if (!dataKey || (cache.isOnce && cache.hasIterationBindingCache === false)) {
        return;
    }

    cache.elementData = cache.elementData || {};
    cache.type = cache.type || configBindingAttrs.if;

    const oldViewModelProValue = cache.elementData.viewModelPropValue;
    // getViewModelPropValue could be return undefined or null
    const viewModelPropValue = getViewModelPropValue(viewModel, cache) || false;

    // do nothing if viewModel value not changed and no child bindings
    if (oldViewModelProValue === viewModelPropValue && !cache.hasIterationBindingCache) {
        return;
    }

    const shouldRender = Boolean(viewModelPropValue);

    // remove this cache from parent array
    if (!shouldRender && cache.isOnce && cache.el.parentNode) {
        removeElement(cache.el);
        // delete cache.fragment;
        removeBindingInQueue({
            viewModel: viewModel,
            cache: cache,
        });
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
            removeBindingInQueue({
                viewModel: viewModel,
                cache: cache,
            });
        }
    }
};

const removeBindingInQueue = ({viewModel, cache}: {viewModel: ViewModel; cache: BindingCache}): boolean => {
    let ret = false;
    if (viewModel.APP?.postProcessQueue) {
        const parentRef = cache[constants.PARENT_REF] as BindingCache[];
        viewModel.APP.postProcessQueue.push(
            ((cache: BindingCache, index: number) => () => {
                parentRef.splice(index, 1);
            })(cache, parentRef.indexOf(cache)),
        );
        ret = true;
    }
    return ret;
};

export default ifBinding;
