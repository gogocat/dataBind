declare const createClonedElementCache: (bindingData: any) => any;
declare const setCommentPrefix: (bindingData: any) => any;
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
declare const setDocRangeEndAfter: (node: any, bindingData: any) => void;
/**
 * wrapCommentAround
 * @param {object} bindingData
 * @param {Node} node
 * @return {object} DOM fragment
 * @description
 * wrap frament with comment node
 */
declare const wrapCommentAround: (bindingData: any, node: any) => any;
/**
 * removeElemnetsByCommentWrap
 * @param {object} bindingData
 * @return {undefined}
 * @description remove elments by range
 */
declare const removeElemnetsByCommentWrap: (bindingData: any) => void;
/**
 * removeDomTemplateElement
 * @param {object} bindingData
 * @return {object} null
 */
declare const removeDomTemplateElement: (bindingData: any) => void;
declare const insertRenderedElements: (bindingData: any, fragment: any) => void;
export { createClonedElementCache, setCommentPrefix, wrapCommentAround, removeElemnetsByCommentWrap, removeDomTemplateElement, setDocRangeEndAfter, insertRenderedElements, };
//# sourceMappingURL=commentWrapper.d.ts.map