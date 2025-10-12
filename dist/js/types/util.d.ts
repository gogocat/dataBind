import type { ViewModel, BindingCache, ElementCache, DeferredObj } from './types';
export declare const REGEX: {
    BAD_TAGS: RegExp;
    FOR_OF: RegExp;
    FUNCTION_PARAM: RegExp;
    HTML_TAG: RegExp;
    OBJECT_LITERAL: RegExp;
    PIPE: RegExp;
    WHITE_SPACES: RegExp;
    LINE_BREAKS_TABS: RegExp;
};
export declare const isArray: (obj: any) => obj is any[];
export declare const isJsObject: (obj: any) => obj is object;
export declare const isPlainObject: (obj: any) => boolean;
export declare const isObjectLiteralString: (str?: string) => boolean;
export declare const isEmptyObject: (obj: any) => boolean;
export declare function createHtmlFragment(htmlString: any): DocumentFragment | null;
export declare const generateElementCache: (bindingAttrs: any) => ElementCache;
/**
 * getViewModelValue
 * @description walk a object by provided string path. eg 'a.b.c'
 * @param {object} viewModel
 * @param {string} prop
 * @return {object}
 */
export declare const getViewModelValue: (viewModel: ViewModel, prop: string) => any;
/**
 * setViewModelValue
 * @description populate viewModel object by path string
 * @param {object} obj
 * @param {string} prop
 * @param {string} value
 * @return {call} underscore set
 */
export declare const setViewModelValue: (obj: any, prop: string, value: any) => any;
export declare const getViewModelPropValue: (viewModel: ViewModel, bindingCache: BindingCache) => any;
export declare const parseStringToJson: (str: string) => any;
/**
 * arrayRemoveMatch
 * @description remove match items in fromArray out of toArray
 * @param {array} toArray
 * @param {array} frommArray
 * @return {boolean}
 */
export declare const arrayRemoveMatch: (toArray: any[], frommArray: any[]) => any[];
export declare const getFormData: ($form: HTMLFormElement) => Record<string, any>;
/**
 * getFunctionParameterList
 * @description convert parameter string to arrary
 * eg. '("a","b","c")' > ["a","b","c"]
 * @param {string} str
 * @return {array} paramlist
 */
export declare const getFunctionParameterList: (str: string) => string[] | undefined;
export declare const extractFilterList: (cacheData: any) => any;
export declare const invertObj: (sourceObj: Record<string, any>) => Record<string, any>;
export declare const createDeferredObj: () => DeferredObj;
/**
 * debounce
 * @description decorate a function to be debounce using requestAnimationFrame
 * @param {function} fn
 * @param {context} ctx
 * @return {function}
 */
export declare const debounceRaf: (fn: Function, ctx?: any) => Function;
/**
 * getNodeAttrObj
 * @description convert Node attributes object to a json object
 * @param {object} node
 * @param {array} skipList
 * @return {object}
 */
export declare const getNodeAttrObj: (node: HTMLElement, skipList?: string | string[]) => Record<string, string> | undefined;
/**
 * extend
 * @param {boolean} isDeepMerge
 * @param {object} target
 * @param {object} sources
 * @return {object} merged object
 */
export declare const extend: (isDeepMerge?: boolean, target?: any, ...sources: any[]) => any;
export declare const each: (obj: any, fn: Function) => void;
/**
 * cloneDomNode
 * @param {object} element
 * @return {object} cloned element
 * @description helper function to clone node
 */
export declare const cloneDomNode: (element: HTMLElement) => HTMLElement;
/**
 * insertAfter
 * @param {object} parentNode
 * @param {object} newNode
 * @param {object} referenceNode
 * @return {object} node
 * @description helper function to insert new node before the reference node
 */
export declare const insertAfter: (parentNode: Node, newNode: Node, referenceNode: Node | null) => Node;
export declare const resolveViewModelContext: (viewModel: ViewModel, datakey: string) => ViewModel;
export declare const resolveParamList: (viewModel: ViewModel, paramList: any[]) => any[] | undefined;
export declare const removeElement: (el: HTMLElement) => void;
export declare const emptyElement: (node: HTMLElement) => HTMLElement;
export declare const throwErrorMessage: (err?: any, errorMessage?: string) => void;
/**
 * parseBindingObjectString
 * @description parse bining object string to object with value always stringify
 * @param {string} str - eg '{ id: $data.id, name: $data.name }'
 * @return {object} - eg { id: '$data.id', name: '$data.name'}
 */
export declare const parseBindingObjectString: (str?: string) => Record<string, string> | null;
//# sourceMappingURL=util.d.ts.map