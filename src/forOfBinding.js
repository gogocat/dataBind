/* eslint-disable no-invalid-this */
import * as config from './config';
import * as util from './util';
import createBindingCache from './domWalker';
import Binder from './binder';

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

const renderForOfBinding = (forOfBindingData, viewModel, bindingAttrs) => {
    if (!forOfBindingData || !viewModel || !bindingAttrs) {
        return;
    }
    let keys;
    let iterationDataLength;
    let i = 0;
    let clonedItem;
    let fragment = document.createDocumentFragment();
    let iterationData = util.getViewModelValue(viewModel, forOfBindingData.iterator.dataKey);
    let iterationBindingCache;
    let iterationVm;
    let isRegenerateCache = false;

    // populate template and append to fragment
    if (util.isArray(iterationData)) {
        iterationDataLength = iterationData.length;
    } else if (util.isPlainObject(iterationData)) {
        keys = Object.keys(iterationData);
        iterationDataLength = keys.length;
    } else {
        throw new TypeError('iterationData is not an plain object or array');
    }

    // store iterationDataLength
    // only regenerate cache if iterationDataLength changed
    if (typeof forOfBindingData.iterationSize === 'undefined') {
        forOfBindingData.iterationSize = iterationDataLength;
        isRegenerateCache = true;
    } else {
        isRegenerateCache = forOfBindingData.iterationSize !== iterationDataLength;
    }

    // remove orignal node for-of attributes
    forOfBindingData.el.removeAttribute(bindingAttrs.forOf);

    // prepare elementCache as object for each iteration parse
    forOfBindingData.elementCache = [];

    // loop to redner but not other binding update yet
    for (i = 0; i < iterationDataLength; i += 1) {
        clonedItem = util.cloneDomNode(forOfBindingData.el);
        // create an iterationVm match iterator alias
        iterationVm = {};
        iterationVm[forOfBindingData.iterator.alias] = keys
            ? iterationData[keys[i]]
            : iterationData[i];
        iterationVm['$root'] = viewModel;

        // create bindingCache per iteration
        if (isRegenerateCache) {
            iterationBindingCache = createBindingCache(clonedItem, bindingAttrs);
            forOfBindingData.elementCache.push(iterationBindingCache);
        }

        // apply binding to render with iterationVm
        // TODO - update option need to be dynamic for templateBinding and forOfBinding always true
        // event bindings will bind context to 'viewModel' but here will bind to iterationVm context
        Binder.applyBinding({
            elementCache: forOfBindingData.elementCache[i],
            updateOption: {
                templateBinding: true,
                textBinding: true,
                cssBinding: true,
                showBinding: true,
                modelBinding: true,
                attrBinding: true,
                forOfBinding: true,
                changeBinding: true,
                clickBinding: true,
                dblclickBinding: true,
                blurBinding: true,
                focusBinding: true,
                submitBinding: true,
            },
            bindingAttrs: bindingAttrs,
            viewModel: iterationVm,
        });

        fragment.appendChild(clonedItem);
    }

    // wrap around with comment
    fragment = wrapCommentAround(forOfBindingData.id, fragment);

    // remove original dom template
    removeDomTemplateElement(forOfBindingData);

    // assign forOf internal id to forOfBindingData once
    if (typeof forOfBindingData.id === 'undefined') {
        forOfBindingData.id = forOfCount;
        forOfCount += 1;
    }

    // create range object
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
        // update docRange end setting
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
        // update docRange end settings
        forOfBindingData.docRange.setStartBefore(forOfBindingData.parentElement.firstChild);
        setDocRangeEndAfter(forOfBindingData.parentElement.firstChild, forOfBindingData);
    }
};

export default renderForOfBinding;
