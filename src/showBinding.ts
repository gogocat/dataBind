import {getViewModelPropValue} from './util';
import type {BindingCache, ViewModel, BindingAttrs} from './types';

/**
 * showBinding
 * @description
 * DOM decleartive show binding. Make binding show/hide according to viewModel data (boolean)
 * viewModel data can function but must return boolean
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
const showBinding = (cache: BindingCache, viewModel: ViewModel, _bindingAttrs: BindingAttrs, _forceRender?: boolean): void => {
    const dataKey = cache.dataKey;
    let currentInlineSytle: CSSStyleDeclaration | Record<string, never> = {};
    let currentInlineDisplaySytle = '';
    let shouldShow = true;

    if (!dataKey) {
        return;
    }

    cache.elementData = cache.elementData || {};

    const oldShowStatus = cache.elementData.viewModelPropValue;

    // store current element display default style once only
    if (
        typeof cache.elementData.displayStyle === 'undefined' ||
        typeof cache.elementData.computedStyle === 'undefined'
    ) {
        currentInlineSytle = cache.el.style;
        currentInlineDisplaySytle = currentInlineSytle.display;
        // use current inline style if defined
        if (currentInlineDisplaySytle) {
            // set to 'block' if is 'none'
            cache.elementData.displayStyle = currentInlineDisplaySytle === 'none' ? 'block' : currentInlineDisplaySytle;
            cache.elementData.computedStyle = null;
        } else {
            const computeStyle = window.getComputedStyle(cache.el, null).getPropertyValue('display');
            cache.elementData.displayStyle = null;
            cache.elementData.computedStyle = computeStyle;
        }
    }

    shouldShow = getViewModelPropValue(viewModel, cache);

    // treat undefined || null as false.
    // eg if property doesn't exsits in viewModel, it will treat as false to hide element
    shouldShow = Boolean(shouldShow);

    // reject if nothing changed
    if (oldShowStatus === shouldShow) {
        return;
    }

    if (!shouldShow) {
        if (cache.el.style.display !== 'none') {
            cache.el.style.setProperty('display', 'none');
        }
    } else {
        if (cache.elementData.computedStyle || cache.el.style.display === 'none') {
            if (cache.elementData.computedStyle === 'none') {
                // default display is none in css rule, so use display 'block'
                cache.el.style.setProperty('display', 'block');
            } else {
                // has default displayable type so just remove inline display 'none'
                if (currentInlineSytle.length > 1) {
                    cache.el.style.removeProperty('display');
                } else {
                    cache.el.removeAttribute('style');
                }
            }
        } else {
            // element default display was inline style, so restore it
            cache.el.style.setProperty('display', cache.elementData.displayStyle);
        }
    }

    // store new show status
    cache.elementData.viewModelPropValue = shouldShow;
};

export default showBinding;
