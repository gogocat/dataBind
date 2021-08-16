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
const attrBinding = (cache, viewModel, bindingAttrs) => {
    if (!cache.dataKey) {
        return;
    }
    // check if Object Literal String style dataKey
    const isObjLiteralStr = isObjectLiteralString(cache.dataKey);

    let vmAttrObj = {};

    // populate cache.elementData if not exits
    cache.elementData = cache.elementData || {};

    // parse object literal like dataKey eg. { id: $data.id, name: $data.id }
    if (isObjLiteralStr) {
        // parse parse object literal string to object
        vmAttrObj = parseBindingObjectString(cache.dataKey);
        // populate each value from viewModel
        each(vmAttrObj, (key, value)=> {
            // resolve value from viewModel including $data and $root
            // from viewModel.$data or viewModel.$root
            vmAttrObj[key] = getViewModelPropValue(viewModel, {dataKey: key});
        });
    } else {
        // resolve from viewModel
        vmAttrObj = getViewModelPropValue(viewModel, cache);
    }

    // vmAttrObj must be a plain object
    if (!isPlainObject(vmAttrObj)) {
        return;
    }

    // check and set default cache.elementData.viewModelPropValue
    cache.elementData.viewModelPropValue = cache.elementData.viewModelPropValue || {};

    // reject if nothing changed by comparing cache.elementData.viewModelPropValue (previous render) vs vmAttrObj(current render)
    if (JSON.stringify(cache.elementData.viewModelPropValue) === JSON.stringify(vmAttrObj)) {
        return;
    }

    // reset cache.elementData.viewModelPropValue
    cache.elementData.viewModelPropValue = {};

    const oldAttrObj = cache.elementData.viewModelPropValue;

    if (isEmptyObject(oldAttrObj)) {
        each(vmAttrObj, (key, value)=> {
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
        each(oldAttrObj, (key, value)=> {
            if (typeof vmAttrObj[key] === 'undefined') {
                cache.el.removeAttribute(key);
            }
        });

        // loop vmAttrObj, set attribute not present in oldAttrObj
        each(vmAttrObj, (key, value)=> {
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

    // for Object Literal only
    if (isObjLiteralStr) {
        cache.elementData.viewModelPropValue = extend({}, vmAttrObj);
    }
};

export default attrBinding;
