import {getViewModelValue, resolveViewModelContext, resolveParamList, isPlainObject, arrayRemoveMatch} from './util';

/**
 * cssBinding
 * @description
 * DOM decleartive css binding. update classlist.
 * viewModel data can function but must return JSOL.
 * added css class if value is true
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
const cssBinding = (cache, viewModel, bindingAttrs) => {
    let dataKey = cache.dataKey;
    let paramList = cache.parameters;

    if (!dataKey) {
        return;
    }

    cache.elementData = cache.elementData || {};
    cache.elementData.cssList = cache.elementData.cssList || '';

    let $element = $(cache.el);
    let oldCssList = cache.elementData.cssList;
    let newCssList = '';
    let vmCssListObj = getViewModelValue(viewModel, dataKey);
    let vmCssListArray;
    let isViewDataObject = false;
    let isViewDataString = false;
    let domCssList;
    let cssList = [];
    let viewModelContext;

    if (typeof vmCssListObj === 'function') {
        viewModelContext = resolveViewModelContext(viewModel, dataKey);
        paramList = paramList ? resolveParamList(viewModel, paramList) : [];
        let args = [oldCssList, $element].concat(paramList);
        vmCssListObj = vmCssListObj.apply(viewModelContext, args);
    }

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
    domCssList = cache.el.classList;
    // clone domCssList as new array
    let domCssListLength = domCssList.length;
    for (let i = 0; i < domCssListLength; i += 1) {
        cssList.push(domCssList[i]);
    }

    if (isViewDataObject) {
        // TODO: optimise this use pure js loop
        $.each(vmCssListObj, function(k, v) {
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
    cssList = _.uniq(cssList).join(' ');
    // replace all css classes
    // TODO: this is the slowness part. Try only update changed css in the classList
    // rather than replace the whole class attribute
    cache.el.setAttribute('class', cssList);
    // update element data
    cache.elementData.cssList = newCssList;
};

export default cssBinding;
