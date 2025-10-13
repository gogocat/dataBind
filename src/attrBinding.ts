import {
    extend,
    getViewModelPropValue,
    isPlainObject,
    isEmptyObject,
    isObjectLiteralString,
    parseBindingObjectString,
    each,
} from './util';

/**
 * attrBinding
 * @description
 * DOM decleartive attr binding. update elenment attributes
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
const attrBinding = (cache: any = {}, viewModel: any, _bindingAttrs?: any, _forceRender?: any): void => {
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
        each(vmAttrObj, (key: any, value: any) => {
            // resolve value from viewModel including $data and $root
            // from viewModel.$data or viewModel.$root
            vmAttrObj[key] = getViewModelPropValue(viewModel, {dataKey: value} as any);
        });
    }

    // shortcut for reading cache.elementData.viewModelPropValue
    const oldAttrObj = cache.elementData.viewModelPropValue;

    // start set element attribute - oldAttrObj is empty meaning no previous render
    if (isEmptyObject(oldAttrObj)) {
        each(vmAttrObj, (key: any, value: any) => {
            if (typeof value !== 'undefined') {
                cache.el.setAttribute(key, value);
                // populate cache.elementData.viewModelPropValue for future comparison
                if (!isObjLiteralStr) {
                    cache.elementData.viewModelPropValue[key] = value;
                }
            }
        });
    } else {
        // loop oldAttrObj, remove attribute not present in current vmAttrObj
        each(oldAttrObj, (key: any, _value: any) => {
            if (typeof vmAttrObj[key] === 'undefined') {
                cache.el.removeAttribute(key);
            }
        });

        // loop vmAttrObj, set attribute not present in oldAttrObj
        each(vmAttrObj, (key: any, value: any) => {
            if (typeof value !== 'undefined') {
                if (oldAttrObj[key] !== vmAttrObj[key]) {
                    cache.el.setAttribute(key, vmAttrObj[key]);
                    // populate cache.elementData.viewModelPropValue for future comparison
                    if (!isObjLiteralStr) {
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
