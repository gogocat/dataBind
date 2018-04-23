/* eslint-disable no-invalid-this */
import * as config from './config';
import * as util from './util';
import createBindingCache from './domWalker';
import {Binder, createBindingOption, renderTemplatesBinding} from './binder';
import {insertRenderedElements} from './commentWrapper';

let forOfCount = 0;

const renderForOfBinding = ({bindingData, viewModel, bindingAttrs}) => {
    if (!bindingData || !viewModel || !bindingAttrs) {
        return;
    }
    let keys;
    let iterationDataLength;
    let iterationData = util.getViewModelValue(viewModel, bindingData.iterator.dataKey);
    let isRegenerate = false;

    // check iterationData and set iterationDataLength
    if (util.isArray(iterationData)) {
        iterationDataLength = iterationData.length;
    } else if (util.isPlainObject(iterationData)) {
        keys = Object.keys(iterationData);
        iterationDataLength = keys.length;
    } else {
        // throw error but let script contince to run
        return util.throwErrorMessage(null, 'iterationData is not an plain object or array');
    }

    // assign forOf internal id to bindingData once
    if (typeof bindingData.id === 'undefined') {
        bindingData.id = forOfCount;
        forOfCount += 1;
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
            let iterationVm = createIterationViewModel({
                bindingData: bindingData,
                viewModel: viewModel,
                iterationData: iterationData,
                keys: keys,
                index: i,
            });
            applyBindings({
                elementCache: elementCache,
                iterationVm: iterationVm,
                bindingAttrs: bindingAttrs,
                isRegenerate: false,
            });
        });

        return;
    }

    // generate forOfBinding elements into fragment
    let fragment = generateForOfElements(bindingData, viewModel, bindingAttrs, iterationData, keys);
    // insert fragment content into DOM
    return insertRenderedElements(bindingData, fragment);
};

const createIterationViewModel = ({bindingData, viewModel, iterationData, keys, index}) => {
    let iterationVm = {};
    iterationVm[bindingData.iterator.alias] = keys ? iterationData[keys[index]] : iterationData[index];
    // populate common binding data reference
    iterationVm[config.bindingDataReference.rootDataKey] = viewModel.$root || viewModel;
    iterationVm[config.bindingDataReference.currentData] = iterationVm[bindingData.iterator.alias];
    iterationVm[config.bindingDataReference.currentIndex] = index;
    return iterationVm;
};

const applyBindings = ({elementCache, iterationVm, bindingAttrs, isRegenerate}) => {
    let bindingUpdateOption;
    if (isRegenerate) {
        bindingUpdateOption = createBindingOption(config.bindingUpdateConditions.init);
    } else {
        bindingUpdateOption = createBindingOption();
    }

    // render and apply binding to template(s)
    // this is an share function therefore passing current APP 'this' context
    // viewModel is a dynamic generated iterationVm
    renderTemplatesBinding({
        ctx: iterationVm.$root.APP,
        elementCache: elementCache,
        updateOption: bindingUpdateOption,
        bindingAttrs: bindingAttrs,
        viewModel: iterationVm,
    });

    Binder.applyBinding({
        elementCache: elementCache,
        updateOption: bindingUpdateOption,
        bindingAttrs: bindingAttrs,
        viewModel: iterationVm,
    });
};

const generateForOfElements = (bindingData, viewModel, bindingAttrs, iterationData, keys) => {
    let fragment = document.createDocumentFragment();
    let iterationDataLength = bindingData.iterationSize;
    let clonedItem;
    let iterationVm;
    let iterationBindingCache;
    let i = 0;

    // create or clear exisitng iterationBindingCache
    if (util.isArray(bindingData.iterationBindingCache)) {
        bindingData.iterationBindingCache.length = 0;
    } else {
        bindingData.iterationBindingCache = [];
    }

    // generate forOf and append to DOM
    for (i = 0; i < iterationDataLength; i += 1) {
        clonedItem = util.cloneDomNode(bindingData.el);
        // create an iterationVm match iterator alias
        iterationVm = createIterationViewModel({
            bindingData: bindingData,
            viewModel: viewModel,
            iterationData: iterationData,
            keys: keys,
            index: i,
        });
        // create bindingCache per iteration
        iterationBindingCache = createBindingCache({
            rootNode: clonedItem,
            bindingAttrs: bindingAttrs,
        });

        bindingData.iterationBindingCache.push(iterationBindingCache);

        applyBindings({
            elementCache: bindingData.iterationBindingCache[i],
            iterationVm: iterationVm,
            bindingAttrs: bindingAttrs,
            isRegenerate: true,
        });

        fragment.appendChild(clonedItem);
    }

    return fragment;
};

export default renderForOfBinding;
