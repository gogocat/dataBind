/* eslint-disable no-invalid-this */
import * as config from './config';
import * as util from './util';
import createBindingCache from './domWalker';
import {Binder, createBindingOption} from './binder';

let forOfCount = 0;

/**
 * wrapCommentAround
 * @param {number} id
 * @param {domFragment} fragment
 * @return {object} DOM fragment
 * @description
 * wrap frament with comment node
 */
const wrapCommentAround = (id, fragment) => {
    let commentBegin;
    let commentEnd;
    let prefix = config.commentPrefix + id;
    commentBegin = document.createComment(prefix);
    commentEnd = document.createComment(prefix + '-end');
    fragment.insertBefore(commentBegin, fragment.firstChild);
    fragment.appendChild(commentEnd);
    return fragment;
};

/**
 * removeElemnetsByCommentWrap
 * @param {object} forOfBindingData
 * @return {undefined}
 * @description remove elments by range
 */
const removeElemnetsByCommentWrap = (forOfBindingData) => {
    return forOfBindingData.docRange.deleteContents();
};

/**
 * removeDomTemplateElement
 * @param {object} forOfBindingData
 * @return {object} null
 */
const removeDomTemplateElement = (forOfBindingData) => {
    // first render - forElement is live DOM element so has parentNode
    if (forOfBindingData.el.parentNode) {
        return forOfBindingData.el.parentNode.removeChild(forOfBindingData.el);
    }
    removeElemnetsByCommentWrap(forOfBindingData);
};

/**
 * setDocRangeEndAfter
 * @param {object} node
 * @param {object} forOfBindingData
 * @description
 * recursive execution to find last wrapping comment node
 * and set as forOfBindingData.docRange.setEndAfter
 * if not found deleteContents will has no operation
 */
const setDocRangeEndAfter = (node, forOfBindingData) => {
    let id = forOfBindingData.id;
    let startTextContent = config.commentPrefix + id;
    let endTextContent = startTextContent + '-end';

    node = node.nextSibling;

    // check last wrap comment node
    if (node) {
        if (node.nodeType === 8 && node.textContent === endTextContent) {
            forOfBindingData.docRange.setEndAfter(node);
        }
        setDocRangeEndAfter(node, forOfBindingData);
    }
};

const createIterationViewModel = ({forOfBindingData, viewModel, iterationData, keys, index}) => {
    let iterationVm = {};
    iterationVm[forOfBindingData.iterator.alias] = keys
        ? iterationData[keys[index]]
        : iterationData[index];
    // populate common binding data reference
    iterationVm[config.bindingDataReference.rootDataKey] = viewModel;
    iterationVm[config.bindingDataReference.currentIndex] = index;
    return iterationVm;
};

const generateForOfElements = (forOfBindingData, viewModel, bindingAttrs, iterationData, keys) => {
    let fragment = document.createDocumentFragment();
    let iterationDataLength = forOfBindingData.iterationSize;
    let clonedItem;
    let iterationVm;
    let iterationBindingCache;
    let i = 0;

    // create or clear exisitng iterationBindingCache
    forOfBindingData.iterationBindingCache = forOfBindingData.iterationBindingCache
        ? (forOfBindingData.iterationBindingCache.length = 0)
        : [];

    // generate forOf and append to DOM
    for (i = 0; i < iterationDataLength; i += 1) {
        clonedItem = util.cloneDomNode(forOfBindingData.el);
        // create an iterationVm match iterator alias
        iterationVm = createIterationViewModel({
            forOfBindingData: forOfBindingData,
            viewModel: viewModel,
            iterationData: iterationData,
            keys: keys,
            index: i,
        });
        // create bindingCache per iteration
        iterationBindingCache = createBindingCache(clonedItem, bindingAttrs);
        forOfBindingData.iterationBindingCache.push(iterationBindingCache);

        applyBindings({
            elementCache: forOfBindingData.iterationBindingCache[i],
            viewModel: iterationVm,
            bindingAttrs: bindingAttrs,
            isRegenerate: true,
        });

        fragment.appendChild(clonedItem);
    }

    return fragment;
};

const insertRenderedElements = (forOfBindingData, fragment) => {
    // wrap around with comment
    fragment = wrapCommentAround(forOfBindingData.id, fragment);

    // remove original dom template
    removeDomTemplateElement(forOfBindingData);

    // create range object
    // TODO: if user deleted content. Then needs to clean up using Range.detach()
    if (!forOfBindingData.docRange) {
        forOfBindingData.docRange = document.createRange();
    }

    // insert rendered fragment after the previousNonTemplateElement
    if (forOfBindingData.previousNonTemplateElement) {
        util.insertAfter(
            forOfBindingData.parentElement,
            fragment,
            forOfBindingData.previousNonTemplateElement
        );
        // update docRange start and end match the wrapped comment node
        forOfBindingData.docRange.setStartBefore(
            forOfBindingData.previousNonTemplateElement.nextSibling
        );
        setDocRangeEndAfter(
            forOfBindingData.previousNonTemplateElement.nextSibling,
            forOfBindingData
        );
    } else {
        // insert before next non template element
        if (forOfBindingData.nextNonTemplateElement) {
            forOfBindingData.parentElement.insertBefore(
                fragment,
                forOfBindingData.nextNonTemplateElement
            );
        } else {
            // insert from parent
            forOfBindingData.parentElement.appendChild(fragment);
        }
        // update docRange start and end match the wrapped comment node
        forOfBindingData.docRange.setStartBefore(forOfBindingData.parentElement.firstChild);
        setDocRangeEndAfter(forOfBindingData.parentElement.firstChild, forOfBindingData);
    }
};

const applyBindings = ({elementCache, viewModel, bindingAttrs, isRegenerate}) => {
    let bindingUpdateOption;
    if (isRegenerate) {
        bindingUpdateOption = createBindingOption(config.bindingUpdateConditions.init);
    } else {
        bindingUpdateOption = createBindingOption();
    }

    Binder.applyBinding({
        elementCache: elementCache,
        updateOption: bindingUpdateOption,
        bindingAttrs: bindingAttrs,
        viewModel: viewModel,
    });
};

const renderForOfBinding = (forOfBindingData, viewModel, bindingAttrs) => {
    if (!forOfBindingData || !viewModel || !bindingAttrs) {
        return;
    }
    let keys;
    let iterationDataLength;
    let iterationData = util.getViewModelValue(viewModel, forOfBindingData.iterator.dataKey);
    let isRegenerate = false;

    // check iterationData and set iterationDataLength
    if (util.isArray(iterationData)) {
        iterationDataLength = iterationData.length;
    } else if (util.isPlainObject(iterationData)) {
        keys = Object.keys(iterationData);
        iterationDataLength = keys.length;
    } else {
        throw new TypeError('iterationData is not an plain object or array');
    }

    // assign forOf internal id to forOfBindingData once
    if (typeof forOfBindingData.id === 'undefined') {
        forOfBindingData.id = forOfCount;
        forOfCount += 1;
        // store iterationDataLength
        forOfBindingData.iterationSize = iterationDataLength;
        // remove orignal node for-of attributes
        forOfBindingData.el.removeAttribute(bindingAttrs.forOf);
        isRegenerate = true;
    } else {
        // only regenerate cache if iterationDataLength changed
        isRegenerate = forOfBindingData.iterationSize !== iterationDataLength;
    }

    if (!isRegenerate) {
        forOfBindingData.iterationBindingCache.forEach(function(elementCache, i) {
            let iterationVm = createIterationViewModel({
                forOfBindingData: forOfBindingData,
                viewModel: viewModel,
                iterationData: iterationData,
                keys: keys,
                index: i,
            });
            applyBindings({
                elementCache: elementCache,
                viewModel: iterationVm,
                bindingAttrs: bindingAttrs,
                isRegenerate: false,
            });
        });

        return;
    }

    // generate forOfBinding elements into fragment
    let fragment = generateForOfElements(
        forOfBindingData,
        viewModel,
        bindingAttrs,
        iterationData,
        keys
    );
    // insert fragment content into DOM
    return insertRenderedElements(forOfBindingData, fragment);
};

export default renderForOfBinding;
