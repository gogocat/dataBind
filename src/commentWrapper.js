/* eslint-disable no-invalid-this */
import * as config from './config';
import * as util from './util';

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
    }
    bindingData.commentPrefix = commentPrefix + dataKeyMarker;
    return bindingData;
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
    let commentBegin;
    let commentEnd;
    let prefix = '';
    if (!bindingData.commentPrefix) {
        setCommentPrefix(bindingData);
    }
    prefix = bindingData.commentPrefix;
    commentBegin = document.createComment(prefix);
    commentEnd = document.createComment(prefix + config.commentSuffix);
    // document fragment
    if (node.nodeType === 11) {
        node.insertBefore(commentBegin, node.firstChild);
        node.appendChild(commentEnd);
    } else {
        node.parentNode.insertBefore(commentBegin, node);
        util.insertAfter(node.parentNode, commentEnd, node);
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
    const isFoOfBinding = bindingData.type === config.bindingAttrs.forOf;
    if (!bindingData.docRange) {
        bindingData.docRange = document.createRange();
    }

    // insert rendered fragment after the previousNonTemplateElement
    if (bindingData.previousNonTemplateElement) {
        // update docRange start and end match the wrapped comment node
        if (isFoOfBinding) {
            bindingData.docRange.setStartBefore(bindingData.previousNonTemplateElement.nextSibling);
        } else {
            bindingData.docRange.setStartAfter(bindingData.previousNonTemplateElement.nextSibling);
        }
        setDocRangeEndAfter(bindingData.previousNonTemplateElement.nextSibling, bindingData);
    } else {
        // insert before next non template element
        // update docRange start and end match the wrapped comment node
        if (isFoOfBinding) {
            bindingData.docRange.setStartBefore(bindingData.parentElement.firstChild);
        } else {
            bindingData.docRange.setStartAfter(bindingData.parentElement.firstChild);
        }
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
    const isFoOfBinding = bindingData.type === config.bindingAttrs.forOf;
    if (!bindingData.commentPrefix) {
        setCommentPrefix(bindingData);
    }
    let startTextContent = bindingData.commentPrefix;
    let endTextContent = startTextContent + config.commentSuffix;
    node = node.nextSibling;

    // check last wrap comment node
    if (node) {
        if (node.nodeType === 8 && node.textContent === endTextContent) {
            if (isFoOfBinding) {
                return bindingData.docRange.setEndAfter(node);
            }
            return bindingData.docRange.setEndBefore(node);
        }
        setDocRangeEndAfter(node, bindingData);
    }
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
    setCommentPrefix,
    wrapCommentAround,
    removeElemnetsByCommentWrap,
    removeDomTemplateElement,
    setDocRangeEndAfter,
    insertRenderedElements,
};
