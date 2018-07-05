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

    // store current element display default style
    if (
        typeof cache.elementData.displayStyle === 'undefined' ||
        typeof cache.elementData.computedStyle === 'undefined'
    ) {
        // use current inline style if defined
        if (cache.el.style.display) {
            // set to 'block' if is 'none'
            cache.elementData.displayStyle = cache.el.style.display === 'none' ? 'block' : cache.el.style.display;
            cache.elementData.computedStyle = null;
        } else {
            let computeStyle = window.getComputedStyle(cache.el, null).getPropertyValue('display');
            if (!computeStyle || computeStyle === 'none') {
                cache.elementData.displayStyle = 'block';
                cache.elementData.computedStyle = null;
            } else {
                cache.elementData.displayStyle = null;
                cache.elementData.computedStyle = computeStyle;
            }
        }
    }

    let oldShowStatus = cache.elementData.viewModelPropValue;
    let shouldShow;

    shouldShow = getViewModelPropValue(viewModel, cache);

    // do nothing if data in viewModel is undefined
    if (typeof shouldShow !== 'undefined' && shouldShow !== null) {
        shouldShow = Boolean(shouldShow);

        // reject if nothing changed
        if (oldShowStatus === shouldShow) {
            return;
        }

        if (!shouldShow) {
            cache.el.style.setProperty('display', 'none');
        } else {
            if (cache.elementData.computedStyle) {
                cache.el.style.display = '';
            } else {
                cache.el.style.setProperty('display', cache.elementData.displayStyle);
            }
        }

        // store new show status
        cache.elementData.viewModelPropValue = shouldShow;
    }
};

export default showBinding;
