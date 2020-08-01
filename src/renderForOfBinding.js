/* eslint-disable no-invalid-this */
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
import {renderIteration} from './binder';
import {
    wrapCommentAround,
    removeElemnetsByCommentWrap,
    insertRenderedElements,
} from './commentWrapper';

const renderForOfBinding = ({bindingData, viewModel, bindingAttrs}) => {
    if (!bindingData || !viewModel || !bindingAttrs) {
        return;
    }
    let keys;
    let iterationDataLength;
    const iterationData = getViewModelPropValue(viewModel, bindingData.iterator);
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
        bindingData.iterationBindingCache.forEach(function(elementCache, i) {
            if (!isEmptyObject(elementCache)) {
                const iterationVm = createIterationViewModel({
                    bindingData: bindingData,
                    viewModel: viewModel,
                    iterationData: iterationData,
                    keys: keys,
                    index: i,
                });
                renderIteration({
                    elementCache: elementCache,
                    iterationVm: iterationVm,
                    bindingAttrs: bindingAttrs,
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

const createIterationViewModel = ({bindingData, viewModel, iterationData, keys, index}) => {
    const iterationVm = {};
    iterationVm[bindingData.iterator.alias] = keys ? iterationData[keys[index]] : iterationData[index];
    // populate common binding data reference
    iterationVm[bindingDataReference.rootDataKey] = viewModel.$root || viewModel;
    iterationVm[bindingDataReference.currentData] = iterationVm[bindingData.iterator.alias];
    iterationVm[bindingDataReference.currentIndex] = index;
    return iterationVm;
};

const generateForOfElements = (bindingData, viewModel, bindingAttrs, iterationData, keys) => {
    const fragment = document.createDocumentFragment();
    const iterationDataLength = bindingData.iterationSize;
    let clonedItem;
    let iterationVm;
    let iterationBindingCache;
    let i = 0;

    // create or clear exisitng iterationBindingCache
    if (isArray(bindingData.iterationBindingCache)) {
        bindingData.iterationBindingCache.length = 0;
    } else {
        bindingData.iterationBindingCache = [];
    }

    // generate forOf and append to DOM
    for (i = 0; i < iterationDataLength; i += 1) {
        clonedItem = cloneDomNode(bindingData.el);

        // create bindingCache per iteration
        iterationBindingCache = createBindingCache({
            rootNode: clonedItem,
            bindingAttrs: bindingAttrs,
        });

        bindingData.iterationBindingCache.push(iterationBindingCache);

        if (!isEmptyObject(iterationBindingCache)) {
            // create an iterationVm match iterator alias
            iterationVm = createIterationViewModel({
                bindingData: bindingData,
                viewModel: viewModel,
                iterationData: iterationData,
                keys: keys,
                index: i,
            });

            renderIteration({
                elementCache: bindingData.iterationBindingCache[i],
                iterationVm: iterationVm,
                bindingAttrs: bindingAttrs,
                isRegenerate: true,
            });
        }

        fragment.appendChild(clonedItem);
    }

    return fragment;
};

export default renderForOfBinding;
