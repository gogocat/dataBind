/* eslint-disable no-invalid-this */
import * as config from './config';
import * as util from './util';

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

const renderForOfBinding = (forOfBindingData, data, bindingAttrs) => {
    if (!forOfBindingData || !data) {
        return;
    }
    let keys;
    let dataLength;
    let i = 0;
    let clonedItem;
    let fragment = document.createDocumentFragment();

    // populate template and append to fragment
    if (util.isArray(data)) {
        dataLength = data.length;
    } else if (util.isPlainObject(data)) {
        keys = Object.keys(data);
        dataLength = keys.length;
    } else {
        throw new TypeError('data is not an plain object or array');
    }

    // remove orignal node for-of attributes
    forOfBindingData.el.removeAttribute(bindingAttrs.forOf);

    // loop to redner but not other binding update yet
    for (i = 0; i < dataLength; i += 1) {
        clonedItem = util.createDomTemplate(forOfBindingData.el);
        // result = iterprolate(clonedItem, data[i], i);
        fragment.appendChild(clonedItem);
    }

    // assign forOf internal id to forOfBindingData once
    if (typeof forOfBindingData.id === 'undefined') {
        forOfBindingData.id = forOfCount;
        forOfCount += 1;
    }

    // wrap around with comment
    fragment = wrapCommentAround(forOfBindingData.id, fragment);

    // remove original dom template
    removeDomTemplateElement(forOfBindingData);

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
