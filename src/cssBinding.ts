import {
    getViewModelPropValue,
    isPlainObject,
    arrayRemoveMatch,
    each,
} from './util';
import type {BindingCache, ViewModel, BindingAttrs, PlainObject} from './types';

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
const cssBinding = (cache: BindingCache, viewModel: ViewModel, bindingAttrs: BindingAttrs, forceRender: boolean): void => {
    const dataKey = cache.dataKey;
    const APP = viewModel.APP || viewModel.$root?.APP;

    if (!dataKey || (!forceRender && !(APP?.$rootElement as HTMLElement)?.contains(cache.el))) {
        return;
    }

    cache.elementData = cache.elementData || {};
    cache.elementData.viewModelPropValue = cache.elementData.viewModelPropValue || '';

    const oldCssList = cache.elementData.viewModelPropValue;
    let newCssList = '';
    const vmCssListObj = getViewModelPropValue(viewModel, cache);
    let vmCssListArray: string[] = [];
    let isViewDataObject = false;
    let isViewDataString = false;
    let cssList: string[] = [];

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
        newCssList = (vmCssListObj as string).replace(/\s\s+/g, ' ').trim();
        vmCssListArray = newCssList.split(' ');
    }
    // reject if nothing changed
    if (oldCssList === newCssList) {
        return;
    }

    // get current css classes from element
    const domCssList = cache.el.classList;
    // clone domCssList as new array
    const domCssListLength = domCssList.length;
    for (let i = 0; i < domCssListLength; i += 1) {
        cssList.push(domCssList[i]);
    }

    if (isViewDataObject) {
        each(vmCssListObj as PlainObject, (k: string, v: unknown) => {
            const i = cssList.indexOf(k);
            if (v === true) {
                cssList.push(k);
            } else if (i !== -1) {
                cssList.splice(i, 1);
            }
        });
    } else if (isViewDataString) {
        // remove oldCssList items from cssList
        const oldCssArray = typeof oldCssList === 'string' && oldCssList ? oldCssList.split(' ') : [];
        cssList = arrayRemoveMatch(cssList, oldCssArray) as string[];
        cssList = cssList.concat(vmCssListArray);
    }

    // unique cssList array
    cssList = cssList.filter((v: string, i: number, a: string[]) => {
        return a.indexOf(v) === i;
    });

    const cssListString = cssList.join(' ');
    // update element data
    cache.elementData.viewModelPropValue = newCssList;
    // replace all css classes
    cache.el.setAttribute('class', cssListString);
};

export default cssBinding;
