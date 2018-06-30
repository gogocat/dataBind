import {getViewModelPropValue} from './util';

/**
 * showBinding
 * @description
 * DOM decleartive show binding. Make binding show/hide according to viewModel data (boolean)
 * viewModel data can function but must return boolean
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
const showBinding = (cache, viewModel, bindingAttrs) => {
    let dataKey = cache.dataKey;

    if (!dataKey) {
        return;
    }

    cache.elementData = cache.elementData || {};

    let oldShowStatus = cache.elementData.viewModelPropValue;
    let isInvertBoolean = dataKey.charAt(0) === '!';
    let shouldShow;

    shouldShow = getViewModelPropValue(viewModel, cache);

    // do nothing if data in viewModel is undefined
    if (typeof shouldShow !== 'undefined' && shouldShow !== null) {
        shouldShow = Boolean(shouldShow);

        // reject if nothing changed
        if (oldShowStatus === shouldShow) {
            return;
        }

        // store new show status
        cache.elementData.viewModelPropValue = shouldShow;

        // reverse if has '!' expression from DOM deceleration
        if (isInvertBoolean) {
            shouldShow = !shouldShow;
        }
        if (!shouldShow) {
            cache.el.style.setProperty('display', 'none');
        } else {
            cache.el.style.removeProperty('display');
            if (cache.el.style.cssText === '') {
                cache.el.removeAttribute('style');
            }
        }
    }
};

export default showBinding;
