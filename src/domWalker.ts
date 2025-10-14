import {invertObj, extractFilterList, getFunctionParameterList, REGEX} from './util';
import {constants} from './config';
import type {PlainObject, BindingAttrs, ElementCache, BindingCache} from './types';

let bindingAttrsMap: PlainObject | undefined;

/**
 * walkDOM
 * @description by Douglas Crockford - walk each DOM node and calls provided callback function
 * start walk from firstChild
 * @param {object} node
 * @param {function} func
 */
const walkDOM = (node: HTMLElement, func: (node: HTMLElement) => boolean): void => {
    let parseChildNode = true;
    let currentNode = node.firstElementChild as HTMLElement | null;
    while (currentNode) {
        parseChildNode = func(currentNode);
        if (parseChildNode) {
            walkDOM(currentNode, func);
        }
        currentNode = currentNode.nextElementSibling as HTMLElement | null;
    }
};

const getAttributesObject = (node: HTMLElement): PlainObject => {
    const ret: PlainObject = {};
    Array.prototype.slice.call(node.attributes).forEach((item: Attr) => {
        ret[item.name] = item.value;
    });
    return ret;
};

const checkSkipChildParseBindings = (attrObj: PlainObject = {}, bindingAttrs: BindingAttrs): string[] => {
    return [bindingAttrs.forOf, bindingAttrs.if, bindingAttrs.case, bindingAttrs.default].filter((type: string) => {
        return typeof attrObj[type] !== 'undefined';
    });
};

const rootSkipCheck = (node: HTMLElement): boolean => {
    return node.tagName === 'SVG';
};

const defaultSkipCheck = (node: HTMLElement, bindingAttrs: BindingAttrs): boolean => {
    return node.tagName === 'SVG' || node.hasAttribute(bindingAttrs.comp);
};

const populateBindingCache = ({node, attrObj, bindingCache, type}: {
    node: HTMLElement;
    attrObj: PlainObject;
    bindingCache: ElementCache;
    type: string;
}): ElementCache => {
    let attrValue: string;
    let cacheData: Partial<BindingCache>;

    if (bindingAttrsMap && bindingAttrsMap[type] && typeof attrObj[type] !== 'undefined') {
        bindingCache[type] = bindingCache[type] || [];
        attrValue = (attrObj[type] as string) || '';

        if (attrValue) {
            attrValue = attrValue.replace(REGEX.LINE_BREAKS_TABS, '').replace(REGEX.WHITE_SPACES, ' ').trim();
        }

        cacheData = {
            el: node,
            dataKey: attrValue,
        };

        // populate cacheData.filters. update filterList first item as dataKey
        cacheData = extractFilterList(cacheData);

        // populate cacheData.parameters
        // for store function call parameters eg. '$index', '$root'
        // useful with DOM for-loop template as reference to binding data
        const paramList = getFunctionParameterList(cacheData.dataKey || '');
        if (paramList) {
            cacheData.parameters = paramList;
            cacheData.dataKey = (cacheData.dataKey || '').replace(REGEX.FUNCTION_PARAM, '').trim();
        }
        // store parent array reference to cacheData
        cacheData[constants.PARENT_REF] = bindingCache[type];
        bindingCache[type].push(cacheData as BindingCache);
    }
    return bindingCache;
};

const createBindingCache = ({rootNode = null, bindingAttrs = {} as BindingAttrs, skipCheck, isRenderedTemplate = false}: {
    rootNode?: HTMLElement | null;
    bindingAttrs?: BindingAttrs;
    skipCheck?: (node: HTMLElement) => boolean;
    isRenderedTemplate?: boolean;
}): ElementCache => {
    let bindingCache: ElementCache = {};

    if (!(rootNode instanceof window.Node)) {
        throw new TypeError('walkDOM: Expected a DOM node');
    }

    bindingAttrsMap = bindingAttrsMap || invertObj(bindingAttrs);

    const parseNode = (
        node: HTMLElement,
        skipNodeCheckFn: (node: HTMLElement, bindingAttrs: BindingAttrs) => boolean = defaultSkipCheck,
    ): boolean => {
        let isSkipForOfChild = false;

        if (node.nodeType !== 1 || !node.hasAttributes()) {
            return true;
        }
        if (skipNodeCheckFn(node, bindingAttrs) || (typeof skipCheck === 'function' && skipCheck(node))) {
            return false;
        }

        // when creating sub bindingCache if is for tmp binding
        // skip same element that has forOf binding the  forOf is alredy parsed
        const attrObj = getAttributesObject(node);
        const hasSkipChildParseBindings = checkSkipChildParseBindings(attrObj, bindingAttrs);
        let iterateList: string[] = [];

        if (hasSkipChildParseBindings.length) {
            isSkipForOfChild = true;
            iterateList = hasSkipChildParseBindings;
        } else if (isRenderedTemplate && attrObj[bindingAttrs.tmp]) {
            // skip current node parse if was called by node has template binding and already rendered
            return true;
        } else {
            iterateList = Object.keys(attrObj);
        }

        iterateList.forEach((key: string) => {
            // skip for switch case and default bining
            if (key !== bindingAttrs.case && key !== bindingAttrs.default) {
                bindingCache = populateBindingCache({
                    node,
                    attrObj,
                    bindingCache,
                    type: key,
                });
            }
        });

        // after cache forOf skip parse child nodes
        if (isSkipForOfChild) {
            return false;
        }

        return true;
    };

    if (parseNode(rootNode, rootSkipCheck)) {
        walkDOM(rootNode, parseNode);
    }
    return bindingCache;
};

export default createBindingCache;
