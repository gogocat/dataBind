/* eslint-disable no-invalid-this */
import * as config from './config';
import * as util from './util';
import createBindingCache from './domWalker';
import {Binder, createBindingOption, renderTemplatesBinding} from './binder';

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

/**
 * wrapCommentAround
 * @param {object} bindingData
 * @param {domFragment} fragment
 * @return {object} DOM fragment
 * @description
 * wrap frament with comment node
 */
const wrapCommentAround = (bindingData, fragment) => {
    let commentBegin;
    let commentEnd;
    const dataKeyMarker = bindingData.dataKey ? bindingData.dataKey.replace(util.REGEX.WHITESPACES, '_') : '';
    const prefix = config.commentPrefix + dataKeyMarker;
    commentBegin = document.createComment(prefix);
    commentEnd = document.createComment(prefix + '-end');
    fragment.insertBefore(commentBegin, fragment.firstChild);
    fragment.appendChild(commentEnd);
    return fragment;
};

/**
 * removeElemnetsByCommentWrap
 * @param {object} bindingData
 * @return {undefined}
 * @description remove elments by range
 */
const removeElemnetsByCommentWrap = (bindingData) => {
    if (!bindingData.docRange) {
        bindingData.docRange = document.createRange();
    }

    // insert rendered fragment after the previousNonTemplateElement
    if (bindingData.previousNonTemplateElement) {
        // update docRange start and end match the wrapped comment node
        bindingData.docRange.setStartBefore(bindingData.previousNonTemplateElement.nextSibling);
        setDocRangeEndAfter(bindingData.previousNonTemplateElement.nextSibling, bindingData);
    } else {
        // insert before next non template element
        // update docRange start and end match the wrapped comment node
        bindingData.docRange.setStartBefore(bindingData.parentElement.firstChild);
        setDocRangeEndAfter(bindingData.parentElement.firstChild, bindingData);
    }

    // TODO - clean up before remove
    // loop over bindingData.iterationBindingCache and call jquery remove data

    return bindingData.docRange.deleteContents();
};

/**
 * removeDomTemplateElement
 * @param {object} bindingData
 * @return {object} null
 */
const removeDomTemplateElement = (bindingData) => {
    // first render - forElement is live DOM element so has parentNode
    if (bindingData.el.parentNode) {
        // TODO - clean up before remove
        // loop over bindingData.iterationBindingCache and call jquery remove data
        return bindingData.el.parentNode.removeChild(bindingData.el);
    }
    removeElemnetsByCommentWrap(bindingData);
};

/**
 * setDocRangeEndAfter
 * @param {object} node
 * @param {object} bindingData
 * @description
 * recursive execution to find last wrapping comment node
 * and set as bindingData.docRange.setEndAfter
 * if not found deleteContents will has no operation
 * @return {undefined}
 */
const setDocRangeEndAfter = (node, bindingData) => {
    const dataKeyMarker = bindingData.dataKey ? bindingData.dataKey.replace(util.REGEX.WHITESPACES, '_') : '';
    let startTextContent = config.commentPrefix + dataKeyMarker;
    let endTextContent = startTextContent + '-end';

    node = node.nextSibling;

    // check last wrap comment node
    if (node) {
        if (node.nodeType === 8 && node.textContent === endTextContent) {
            return bindingData.docRange.setEndAfter(node);
        }
        setDocRangeEndAfter(node, bindingData);
    }
};

const insertRenderedElements = (bindingData, fragment) => {
    // wrap around with comment
    fragment = wrapCommentAround(bindingData, fragment);

    // remove original dom template
    removeDomTemplateElement(bindingData);

    // insert rendered fragment after the previousNonTemplateElement
    if (bindingData.previousNonTemplateElement) {
        util.insertAfter(bindingData.parentElement, fragment, bindingData.previousNonTemplateElement);
    } else {
        // insert before next non template element
        if (bindingData.nextNonTemplateElement) {
            bindingData.parentElement.insertBefore(fragment, bindingData.nextNonTemplateElement);
        } else if (bindingData.parentElement) {
            // insert from parent
            bindingData.parentElement.appendChild(fragment);
        }
    }
};

export default renderForOfBinding;
