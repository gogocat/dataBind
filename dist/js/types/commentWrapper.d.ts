import type { BindingCache } from './types';
declare const createClonedElementCache: (bindingData: BindingCache) => BindingCache;
declare const setCommentPrefix: (bindingData: BindingCache) => BindingCache;
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
declare const setDocRangeEndAfter: (node: Node | null, bindingData: BindingCache) => void;
/**
 * wrapCommentAround
 * @param {object} bindingData
 * @param {Node} node
 * @return {object} DOM fragment
 * @description
 * wrap frament with comment node
 */
declare const wrapCommentAround: (bindingData: BindingCache, node: Node | DocumentFragment) => Node | DocumentFragment;
/**
 * removeElemnetsByCommentWrap
 * @param {object} bindingData
 * @return {undefined}
 * @description remove elments by range
 */
declare const removeElemnetsByCommentWrap: (bindingData: BindingCache) => void;
/**
 * removeDomTemplateElement
 * @param {object} bindingData
 * @return {object} null
 */
declare const removeDomTemplateElement: (bindingData: BindingCache) => void;
declare const insertRenderedElements: (bindingData: BindingCache, fragment: DocumentFragment) => void;
export { createClonedElementCache, setCommentPrefix, wrapCommentAround, removeElemnetsByCommentWrap, removeDomTemplateElement, setDocRangeEndAfter, insertRenderedElements, };
//# sourceMappingURL=commentWrapper.d.ts.map