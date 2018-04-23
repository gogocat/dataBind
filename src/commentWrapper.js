/* eslint-disable no-invalid-this */
import * as config from './config';
import * as util from './util';
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

export {
    wrapCommentAround,
    removeElemnetsByCommentWrap,
    removeDomTemplateElement,
    setDocRangeEndAfter,
    insertRenderedElements,
};
