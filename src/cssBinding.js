import {getViewModelPropValue, isPlainObject, arrayRemoveMatch, each} from './util';

/**
 * cssBinding
 * @description
 * DOM decleartive css binding. update classlist.
 * viewModel data can function but must return JSOL.
 * added css class if value is true
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 * @param {boolean} forceRender
 */
const cssBinding = (cache, viewModel, bindingAttrs, forceRender) => {
    let dataKey = cache.dataKey;
    let APP = viewModel.APP || viewModel.$root.APP;

    if (!dataKey || (!forceRender && !APP.$rootElement.contains(cache.el))) {
        return;
    }

    cache.elementData = cache.elementData || {};
    cache.elementData.viewModelPropValue = cache.elementData.viewModelPropValue || '';

    // let $element = $(cache.el);
    let oldCssList = cache.elementData.viewModelPropValue;
    let newCssList = '';
    let vmCssListObj = getViewModelPropValue(viewModel, cache);
    let vmCssListArray = [];
    let isViewDataObject = false;
    let isViewDataString = false;
    let cssList = [];

    if (typeof vmCssListObj === 'string') {
        isViewDataString = true;
    } else if (isPlainObject(vmCssListObj)) {
        isViewDataObject = true;
    } else {
        // reject if vmCssListObj is not an object or string
        return;
    }

    if (isViewDataObject) {
        newCssList = JSON.stringify(vmCssListObj);
    } else {
        newCssList = vmCssListObj.replace(/\s\s+/g, ' ').trim();
        vmCssListArray = newCssList.split(' ');
    }
    // reject if nothing changed
    if (oldCssList === newCssList) {
        return;
    }

    // get current css classes from element
    let domCssList = cache.el.classList;
    // clone domCssList as new array
    let domCssListLength = domCssList.length;
    for (let i = 0; i < domCssListLength; i += 1) {
        cssList.push(domCssList[i]);
    }

    if (isViewDataObject) {
        each(vmCssListObj, function(k, v) {
            let i = cssList.indexOf(k);
            if (v === true) {
                cssList.push(k);
            } else if (i !== -1) {
                cssList.splice(i, 1);
            }
        });
    } else if (isViewDataString) {
        // remove oldCssList items from cssList
        cssList = arrayRemoveMatch(cssList, oldCssList);
        cssList = cssList.concat(vmCssListArray);
    }

    // unique cssList array
    cssList = cssList.filter((v, i, a) => {
        return a.indexOf(v) === i;
    });

    cssList = cssList.join(' ');
    // update element data
    cache.elementData.viewModelPropValue = newCssList;
    // replace all css classes
    cache.el.setAttribute('class', cssList);
};

export default cssBinding;
