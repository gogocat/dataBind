import {getViewModelPropValue, isPlainObject, isEmptyObject} from './util';

/**
 * attrBinding
 * @description
 * DOM decleartive attr binding. update elenment attributes
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
const attrBinding = (cache, viewModel, bindingAttrs) => {
    let dataKey = cache.dataKey;

    if (!dataKey) {
        return;
    }

    cache.elementData = cache.elementData || {};
    cache.elementData.viewModelProValue = cache.elementData.viewModelProValue || {};

    const oldAttrObj = cache.elementData.viewModelProValue;
    const vmAttrObj = getViewModelPropValue(viewModel, cache);

    if (!isPlainObject(vmAttrObj) || isEmptyObject(vmAttrObj)) {
        // reject if vmAttrListObj is not an object or empty
        return;
    }

    // reject if nothing changed
    if (JSON.stringify(oldAttrObj) === JSON.stringify(vmAttrObj)) {
        return;
    }

    // get current DOM element attributes object
    // let domAttrObj = util.getNodeAttrObj(cache.el, [bindingAttrs.attr]);

    if (isEmptyObject(oldAttrObj)) {
        for (let key in vmAttrObj) {
            if (vmAttrObj.hasOwnProperty(key)) {
                cache.el.setAttribute(key, vmAttrObj[key]);
            }
        }
    } else {
        for (let key in oldAttrObj) {
            if (oldAttrObj.hasOwnProperty(key)) {
                if (vmAttrObj[key] === undefined) {
                    // remove attribute if not present in current vm
                    cache.el.removeAttribute(key);
                }
            }
        }
        for (let key in vmAttrObj) {
            if (vmAttrObj.hasOwnProperty(key)) {
                if (oldAttrObj[key] !== vmAttrObj[key]) {
                    // update attribute if value changed
                    cache.el.setAttribute(key, vmAttrObj[key]);
                }
            }
        }
    }
    // update element data
    cache.elementData.viewModelProValue = vmAttrObj;
};

export default attrBinding;
