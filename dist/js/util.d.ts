import type { ViewModel, BindingCache, ElementCache, DeferredObj, PlainObject } from './types';
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
export declare const isArray: (obj: unknown) => obj is unknown[];
export declare const isJsObject: (obj: unknown) => obj is object;
export declare const isPlainObject: (obj: unknown) => obj is PlainObject;
export declare const isObjectLiteralString: (str?: string) => boolean;
export declare const isEmptyObject: (obj: unknown) => boolean;
export declare const createHtmlFragment: (htmlString: unknown) => DocumentFragment | null;
export declare const generateElementCache: (bindingAttrs: PlainObject | unknown[]) => ElementCache;
/**
 * getViewModelValue
 * @description walk a object by provided string path. eg 'a.b.c'
 * @param {object} viewModel
 * @param {string} prop
 * @return {object}
 */
export declare const getViewModelValue: (viewModel: ViewModel, prop: string) => unknown;
/**
 * setViewModelValue
 * @description populate viewModel object by path string
 * @param {object} obj
 * @param {string} prop
 * @param {string} value
 * @return {call} underscore set
 */
export declare const setViewModelValue: (obj: PlainObject, prop: string, value: unknown) => PlainObject;
export declare const getViewModelPropValue: (viewModel: ViewModel, bindingCache: BindingCache) => unknown;
export declare const parseStringToJson: (str: string) => PlainObject;
/**
 * arrayRemoveMatch
 * @description remove match items in fromArray out of toArray
 * @param {array} toArray
 * @param {array} frommArray
 * @return {boolean}
 */
export declare const arrayRemoveMatch: (toArray: unknown[], frommArray: unknown[]) => unknown[];
export declare const getFormData: ($form: HTMLFormElement) => PlainObject;
/**
 * getFunctionParameterList
 * @description convert parameter string to arrary
 * eg. '("a","b","c")' > ["a","b","c"]
 * @param {string} str
 * @return {array} paramlist
 */
export declare const getFunctionParameterList: (str: string) => string[] | undefined;
export declare const extractFilterList: (cacheData: Partial<BindingCache>) => Partial<BindingCache>;
export declare const invertObj: (sourceObj: PlainObject) => PlainObject;
export declare const createDeferredObj: () => DeferredObj;
/**
 * debounce
 * @description decorate a function to be debounce using requestAnimationFrame
 * @param {function} fn
 * @param {context} ctx
 * @return {function}
 */
export declare const debounceRaf: (fn: Function, ctx?: unknown) => Function;
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
export declare const extend: (isDeepMerge?: boolean, target?: PlainObject, ...sources: PlainObject[]) => PlainObject;
export declare const each: (obj: unknown[] | PlainObject, fn: Function) => void;
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
export declare const resolveParamList: (viewModel: ViewModel, paramList: unknown[]) => unknown[] | undefined;
export declare const removeElement: (el: HTMLElement) => void;
export declare const emptyElement: (node: HTMLElement) => HTMLElement;
/**
 * updateDomWithMinimalChanges
 * @description Updates DOM by comparing existing nodes with new fragment
 * Only modifies what changed - performs minimal DOM manipulation
 * @param {HTMLElement} targetElement - The existing DOM element to update
 * @param {DocumentFragment} newFragment - The new content to apply
 */
export declare const updateDomWithMinimalChanges: (targetElement: HTMLElement, newFragment: DocumentFragment) => void;
export declare const throwErrorMessage: (err?: unknown, errorMessage?: string) => void;
/**
 * parseBindingObjectString
 * @description parse bining object string to object with value always stringify
 * @param {string} str - eg '{ id: $data.id, name: $data.name }'
 * @return {object} - eg { id: '$data.id', name: '$data.name'}
 */
export declare const parseBindingObjectString: (str?: string) => Record<string, string> | null;
//# sourceMappingURL=util.d.ts.map