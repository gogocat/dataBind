
import {bindingAttrs as configBindingAttrs, bindingDataReference} from './config';
import {
    getViewModelPropValue,
    isArray,
    isPlainObject,
    throwErrorMessage,
    cloneDomNode,
    isEmptyObject,
} from './util';
import createBindingCache from './domWalker';
import renderIteration from './renderIteration';
import {
    wrapCommentAround,
    removeElemnetsByCommentWrap,
    insertRenderedElements,
} from './commentWrapper';
import type {ViewModel, BindingCache, BindingAttrs, ElementCache} from './types';

const renderForOfBinding = ({bindingData, viewModel, bindingAttrs}: {
    bindingData: BindingCache;
    viewModel: ViewModel;
    bindingAttrs: BindingAttrs;
}): void => {
    if (!bindingData || !viewModel || !bindingAttrs) {
        return;
    }
    let keys: string[] | undefined;
    let iterationDataLength: number;
    // FIX: Use bindingData.iterator instead of bindingData to get the iteration data
    // The iterator object has the dataKey pointing to the array/object to iterate over
    const iterationData = getViewModelPropValue(viewModel, bindingData.iterator as BindingCache);
    let isRegenerate = false;

    // check iterationData and set iterationDataLength
    if (isArray(iterationData)) {
        iterationDataLength = iterationData.length;
    } else if (isPlainObject(iterationData)) {
        keys = Object.keys(iterationData);
        iterationDataLength = keys.length;
    } else {
        // throw error but let script contince to run
        return throwErrorMessage(null, 'iterationData is not an plain object or array');
    }

    // flag as pared for-of logic with bindingData.type
    if (!bindingData.type) {
        bindingData.type = configBindingAttrs.forOf;
        wrapCommentAround(bindingData, bindingData.el);
    }

    // assign forOf internal id to bindingData once
    if (typeof bindingData.iterationSize === 'undefined') {
        // store iterationDataLength
        bindingData.iterationSize = iterationDataLength;
        // remove orignal node for-of attributes
        bindingData.el.removeAttribute(bindingAttrs.forOf);
        isRegenerate = true;
    } else {
        // only regenerate cache if iterationDataLength changed
        isRegenerate = bindingData.iterationSize !== iterationDataLength;
        // update iterationSize
        bindingData.iterationSize = iterationDataLength;
    }

    if (!isRegenerate) {
        (bindingData.iterationBindingCache as ElementCache[])?.forEach((elementCache: ElementCache, i: number) => {
            if (!isEmptyObject(elementCache)) {
                const iterationVm = createIterationViewModel({
                    bindingData,
                    viewModel,
                    iterationData,
                    keys,
                    index: i,
                });
                renderIteration({
                    elementCache,
                    iterationVm,
                    bindingAttrs,
                    isRegenerate: false,
                });
            }
        });

        return;
    }

    // generate forOfBinding elements into fragment
    const fragment = generateForOfElements(bindingData, viewModel, bindingAttrs, iterationData, keys);

    removeElemnetsByCommentWrap(bindingData);

    // insert fragment content into DOM
    return insertRenderedElements(bindingData, fragment);
};

/**
 * createIterationViewModel
 * @description
 * create an virtual viewModel for render binding while in loop iteration
 * $data is the current data in the loop eg. data in array
 * $root is point to top level viewModel
 * $index is the current loop index
 * @param {*} param0
 * @return {object} virtual viewModel
 */
const createIterationViewModel = ({bindingData, viewModel, iterationData, keys, index}: {
    bindingData: BindingCache;
    viewModel: ViewModel;
    iterationData: unknown;
    keys: string[] | undefined;
    index: number;
}): ViewModel => {
    const iterationVm: ViewModel = {};
    const alias = bindingData.iterator?.alias;
    if (alias) {
        iterationVm[alias] = keys ? (iterationData as Record<string, unknown>)[keys[index]] : (iterationData as unknown[])[index];
    }
    // populate common binding data reference
    iterationVm[bindingDataReference.rootDataKey] = viewModel.$root || viewModel;
    iterationVm[bindingDataReference.currentData] = alias ? iterationVm[alias] : undefined;
    iterationVm[bindingDataReference.currentIndex] = index;
    return iterationVm;
};

const generateForOfElements = (
    bindingData: BindingCache,
    viewModel: ViewModel,
    bindingAttrs: BindingAttrs,
    iterationData: unknown,
    keys: string[] | undefined,
): DocumentFragment => {
    const fragment = document.createDocumentFragment();
    const iterationDataLength = bindingData.iterationSize as number;
    let clonedItem: HTMLElement;
    let iterationVm: ViewModel;
    let iterationBindingCache: ElementCache;
    let i = 0;

    // create or clear exisitng iterationBindingCache
    if (isArray(bindingData.iterationBindingCache)) {
        (bindingData.iterationBindingCache as ElementCache[]).length = 0;
    } else {
        bindingData.iterationBindingCache = [];
    }

    // generate forOf and append to DOM
    for (i = 0; i < iterationDataLength; i += 1) {
        clonedItem = cloneDomNode(bindingData.el);

        // create bindingCache per iteration
        iterationBindingCache = createBindingCache({
            rootNode: clonedItem,
            bindingAttrs,
        });

        (bindingData.iterationBindingCache as ElementCache[]).push(iterationBindingCache);

        if (!isEmptyObject(iterationBindingCache)) {
            // create an iterationVm match iterator alias
            iterationVm = createIterationViewModel({
                bindingData,
                viewModel,
                iterationData,
                keys,
                index: i,
            });

            renderIteration({
                elementCache: (bindingData.iterationBindingCache as ElementCache[])[i],
                iterationVm,
                bindingAttrs,
                isRegenerate: true,
            });
        }

        fragment.appendChild(clonedItem);
    }

    return fragment;
};

export default renderForOfBinding;
