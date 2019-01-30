/* eslint-disable no-invalid-this */
import * as config from './config';
import * as util from './util';

const createClonedElementCache = (bindingData) => {
    const clonedElement = bindingData.el.cloneNode(true);
    bindingData.fragment = document.createDocumentFragment();
    bindingData.fragment.appendChild(clonedElement);
    return bindingData;
};

const setCommentPrefix = (bindingData) => {
    if (!bindingData || !bindingData.type) {
        return;
    }
    let commentPrefix = '';
    const dataKeyMarker = bindingData.dataKey ? bindingData.dataKey.replace(util.REGEX.WHITESPACES, '_') : '';

    switch (bindingData.type) {
    case config.bindingAttrs.forOf:
        commentPrefix = config.commentPrefix.forOf;
        break;
    case config.bindingAttrs.if:
        commentPrefix = config.commentPrefix.if;
        break;
    case config.bindingAttrs.case:
        commentPrefix = config.commentPrefix.case;
        break;
    case config.bindingAttrs.default:
        commentPrefix = config.commentPrefix.default;
        break;
    }
    bindingData.commentPrefix = commentPrefix + dataKeyMarker;
    return bindingData;
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
    if (!bindingData.commentPrefix) {
        setCommentPrefix(bindingData);
    }
    const startTextContent = bindingData.commentPrefix;
    const endTextContent = startTextContent + config.commentSuffix;
    node = node.nextSibling;

    // check last wrap comment node
    if (node) {
        if (node.nodeType === 8 && node.textContent === endTextContent) {
            return bindingData.docRange.setEndBefore(node);
        }
        setDocRangeEndAfter(node, bindingData);
    }
};

/**
 * wrapCommentAround
 * @param {object} bindingData
 * @param {Node} node
 * @return {object} DOM fragment
 * @description
 * wrap frament with comment node
 */
const wrapCommentAround = (bindingData, node) => {
    let prefix = '';
    if (!bindingData.commentPrefix) {
        setCommentPrefix(bindingData);
    }
    prefix = bindingData.commentPrefix;
    const commentBegin = document.createComment(prefix);
    const commentEnd = document.createComment(prefix + config.commentSuffix);
    // document fragment - logic for ForOf binding
    // check node.parentNode because node could be from cache and no longer in DOM
    if (node.nodeType === 11) {
        node.insertBefore(commentBegin, node.firstChild);
        node.appendChild(commentEnd);
    } else if (node.parentNode) {
        node.parentNode.insertBefore(commentBegin, node);
        util.insertAfter(node.parentNode, commentEnd, node);
        // update bindingData details
        bindingData.previousNonTemplateElement = node.previousSibling;
        bindingData.nextNonTemplateElement = node.nextSibling;
        bindingData.parentElement = node.previousSibling.parentElement;
    }

    return node;
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
    try {
        if (bindingData.previousNonTemplateElement) {
            // update docRange start and end match the wrapped comment node
            bindingData.docRange.setStartBefore(bindingData.previousNonTemplateElement.nextSibling);
            setDocRangeEndAfter(bindingData.previousNonTemplateElement.nextSibling, bindingData);
        } else {
            // insert before next non template element
            bindingData.docRange.setStartBefore(bindingData.parentElement.firstChild);
            setDocRangeEndAfter(bindingData.parentElement.firstChild, bindingData);
        }
    } catch (err) {
        console.log('error removeElemnetsByCommentWrap: ', err.message);
    }

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
        return bindingData.el.parentNode.removeChild(bindingData.el);
    }
    removeElemnetsByCommentWrap(bindingData);
};

const insertRenderedElements = (bindingData, fragment) => {
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

export {
    createClonedElementCache,
    setCommentPrefix,
    wrapCommentAround,
    removeElemnetsByCommentWrap,
    removeDomTemplateElement,
    setDocRangeEndAfter,
    insertRenderedElements,
};
