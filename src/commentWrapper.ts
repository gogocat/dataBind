
import * as config from './config';
import * as util from './util';
import type {BindingCache} from './types';

const createClonedElementCache = (bindingData: BindingCache): BindingCache => {
    const clonedElement = bindingData.el.cloneNode(true);
    bindingData.fragment = document.createDocumentFragment();
    bindingData.fragment.appendChild(clonedElement);
    return bindingData;
};

const setCommentPrefix = (bindingData: BindingCache): BindingCache => {
    if (!bindingData || !bindingData.type) {
        return bindingData;
    }
    let commentPrefix = '';
    const dataKeyMarker = bindingData.dataKey ? bindingData.dataKey.replace(util.REGEX.WHITE_SPACES, '_') : '';

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
const setDocRangeEndAfter = (node: Node | null, bindingData: BindingCache): void => {
    if (!bindingData.commentPrefix) {
        setCommentPrefix(bindingData);
    }
    const startTextContent = bindingData.commentPrefix as string;
    const endTextContent = startTextContent + config.commentSuffix;
    node = node.nextSibling;

    // check last wrap comment node
    if (node) {
        if (node.nodeType === 8 && node.textContent === endTextContent) {
            return (bindingData.docRange as Range).setEndBefore(node);
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
const wrapCommentAround = (bindingData: BindingCache, node: Node | DocumentFragment): Node | DocumentFragment => {
    let prefix = '';
    if (!bindingData.commentPrefix) {
        setCommentPrefix(bindingData);
    }
    prefix = bindingData.commentPrefix as string;
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
const removeElemnetsByCommentWrap = (bindingData: BindingCache): void => {
    if (!bindingData.docRange) {
        bindingData.docRange = document.createRange();
    }
    const docRange = bindingData.docRange as Range;
    try {
        if (bindingData.previousNonTemplateElement) {
            // update docRange start and end match the wrapped comment node
            docRange.setStartBefore(bindingData.previousNonTemplateElement.nextSibling as Node);
            setDocRangeEndAfter(bindingData.previousNonTemplateElement.nextSibling, bindingData);
        } else {
            // insert before next non template element
            docRange.setStartBefore((bindingData.parentElement as HTMLElement).firstChild as Node);
            setDocRangeEndAfter((bindingData.parentElement as HTMLElement).firstChild, bindingData);
        }
    } catch (err: unknown) {
        console.log('error removeElemnetsByCommentWrap: ', err instanceof Error ? err.message : String(err));
    }

    docRange.deleteContents();
};

/**
 * removeDomTemplateElement
 * @param {object} bindingData
 * @return {object} null
 */
const removeDomTemplateElement = (bindingData: BindingCache): void => {
    // first render - forElement is live DOM element so has parentNode
    if (bindingData.el.parentNode) {
        bindingData.el.parentNode.removeChild(bindingData.el);
        return;
    }
    removeElemnetsByCommentWrap(bindingData);
};

const insertRenderedElements = (bindingData: BindingCache, fragment: DocumentFragment): void => {
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
