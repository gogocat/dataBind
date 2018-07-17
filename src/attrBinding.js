import {getViewModelPropValue, isPlainObject, isEmptyObject, each} from './util';

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

    if (!isPlainObject(vmAttrObj)) {
        return;
    }

    // reject if nothing changed
    if (JSON.stringify(oldAttrObj) === JSON.stringify(vmAttrObj)) {
        return;
    }

    // reset old data and update it
    cache.elementData.viewModelProValue = {};

    if (isEmptyObject(oldAttrObj)) {
        each(vmAttrObj, (key, value)=> {
            cache.el.setAttribute(key, value);
            // populate with vmAttrObj data
            cache.elementData.viewModelProValue[key] = value;
        });
    } else {
        each(oldAttrObj, (key, value)=> {
            if (typeof vmAttrObj[key] === 'undefined') {
                // remove attribute if not present in current vm
                cache.el.removeAttribute(key);
            }
        });

        each(vmAttrObj, (key, value)=> {
            if (oldAttrObj[key] !== vmAttrObj[key]) {
                // update attribute if value changed
                cache.el.setAttribute(key, vmAttrObj[key]);
            }
            cache.elementData.viewModelProValue[key] = value;
        });
    }
};

export default attrBinding;
