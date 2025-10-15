import {
    extend,
    getViewModelPropValue,
    isPlainObject,
    isEmptyObject,
    isObjectLiteralString,
    parseBindingObjectString,
    each,
} from './util';
import type {BindingCache, ViewModel, PlainObject} from './types';

/**
 * attrBinding
 * @description
 * DOM decleartive attr binding. update elenment attributes
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
const attrBinding = (cache: BindingCache = {} as BindingCache, viewModel: ViewModel, _bindingAttrs?: unknown, _forceRender?: unknown): void => {
    if (!cache.dataKey) {
        return;
    }
    // check if Object Literal String style dataKey
    const isObjLiteralStr = isObjectLiteralString(cache.dataKey);

    // resolve vmAttrObj, when Object Literal String style if will be object without resolve each value
    // otherwise, resolve value from viewModel
    const vmAttrObj = isObjLiteralStr ? parseBindingObjectString(cache.dataKey) : getViewModelPropValue(viewModel, cache);

    // vmAttrObj must be a plain object
    if (!isPlainObject(vmAttrObj)) {
        return;
    }

    // populate cache.elementData if not exits
    // check and set default cache.elementData.viewModelPropValue
    cache.elementData = cache.elementData || {};
    cache.elementData.viewModelPropValue = cache.elementData.viewModelPropValue || {};

    // start diff comparison
    // reject if nothing changed by comparing
    // cache.elementData.viewModelPropValue (previous render) vs vmAttrObj(current render)
    if (JSON.stringify(cache.elementData.viewModelPropValue) === JSON.stringify(vmAttrObj)) {
        return;
    }

    if (isObjLiteralStr) {
        // resolve each value in vmAttrObj
        each(vmAttrObj, (key: string, value: unknown) => {
            // resolve value from viewModel including $data and $root
            // from viewModel.$data or viewModel.$root
            (vmAttrObj as PlainObject)[key] = getViewModelPropValue(viewModel, {dataKey: value, el: cache.el} as BindingCache);
        });
    }

    // shortcut for reading cache.elementData.viewModelPropValue
    const oldAttrObj = cache.elementData.viewModelPropValue;

    // start set element attribute - oldAttrObj is empty meaning no previous render
    if (isEmptyObject(oldAttrObj)) {
        each(vmAttrObj, (key: string, value: unknown) => {
            if (typeof value !== 'undefined') {
                cache.el.setAttribute(key, String(value));
                // populate cache.elementData.viewModelPropValue for future comparison
                if (!isObjLiteralStr && cache.elementData) {
                    cache.elementData.viewModelPropValue[key] = value;
                }
            }
        });
    } else {
        // loop oldAttrObj, remove attribute not present in current vmAttrObj
        each(oldAttrObj as PlainObject, (key: string, _value: unknown) => {
            if (typeof (vmAttrObj as PlainObject)[key] === 'undefined') {
                cache.el.removeAttribute(key);
            }
        });

        // loop vmAttrObj, set attribute not present in oldAttrObj
        each(vmAttrObj, (key: string, value: unknown) => {
            if (typeof value !== 'undefined') {
                if ((oldAttrObj as PlainObject)[key] !== (vmAttrObj as PlainObject)[key]) {
                    cache.el.setAttribute(key, String((vmAttrObj as PlainObject)[key]));
                    // populate cache.elementData.viewModelPropValue for future comparison
                    if (!isObjLiteralStr && cache.elementData) {
                        cache.elementData.viewModelPropValue[key] = value;
                    }
                }
            }
        });
    }

    // for object literal style binding
    // set viewModelPropValue for future diff comaprison
    // note: vmAttrObj is a not fully resolve object, each value is still string unresloved
    if (isObjLiteralStr) {
        cache.elementData.viewModelPropValue = extend(false, {}, vmAttrObj);
    }
};

export default attrBinding;
