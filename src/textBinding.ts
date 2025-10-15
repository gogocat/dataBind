import {getViewModelPropValue} from './util';
import type {BindingCache, ViewModel, BindingAttrs} from './types';

/**
 * textBinding
 * * @description
 * DOM decleartive text binding update dom textnode with viewModel data
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 * @param {boolean} forceRender
 */
const textBinding = (cache: BindingCache, viewModel: ViewModel, bindingAttrs: BindingAttrs, forceRender: boolean): void => {
    const dataKey = cache.dataKey;
    const APP = viewModel.APP || viewModel.$root?.APP;

    // NOTE: this doesn't work for for-of, if and switch bindings because element was not in DOM
    if (!dataKey || (!forceRender && !(APP?.$rootElement as HTMLElement)?.contains(cache.el))) {
        return;
    }

    const newValue = getViewModelPropValue(viewModel, cache);
    const oldValue = cache.el.textContent;

    if (typeof newValue !== 'undefined' && typeof newValue !== 'object' && newValue !== null) {
        if (newValue !== oldValue) {
            cache.el.textContent = String(newValue);
        }
    }
};

export default textBinding;
