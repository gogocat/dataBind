import {invertObj, extractFilterList, getFunctionParameterList, REGEX} from './util';
import {constants} from './config';

let bindingAttrsMap;

/**
 * walkDOM
 * @description by Douglas Crockford - walk each DOM node and calls provided callback function
 * start walk from firstChild
 * @param {object} node
 * @param {function} func
 */
const walkDOM = (node, func) => {
    let parseChildNode = true;
    node = node.firstElementChild;
    while (node) {
        parseChildNode = func(node);
        if (parseChildNode) {
            walkDOM(node, func);
        }
        node = node.nextElementSibling;
    }
};

const getAttributesObject = (node) => {
    const ret = {};
    Array.prototype.slice.call(node.attributes).forEach((item) => {
        ret[item.name] = item.value;
    });
    return ret;
};

const checkSkipChildParseBindings = (attrObj = {}, bindingAttrs) => {
    return [bindingAttrs.forOf, bindingAttrs.if, bindingAttrs.case, bindingAttrs.default].filter((type) => {
        return typeof attrObj[type] !== 'undefined';
    });
};

const rootSkipCheck = (node) => {
    return node.tagName === 'SVG';
};

const defaultSkipCheck = (node, bindingAttrs) => {
    return node.tagName === 'SVG' || node.hasAttribute(bindingAttrs.comp);
};

const populateBindingCache = ({node, attrObj, bindingCache, type}) => {
    let attrValue;
    let cacheData;

    if (bindingAttrsMap && bindingAttrsMap[type] && typeof attrObj[type] !== 'undefined') {
        bindingCache[type] = bindingCache[type] || [];
        attrValue = attrObj[type].trim();
        cacheData = {
            el: node,
            dataKey: attrValue,
        };

        // populate cacheData.filters. update filterList first item as dataKey
        cacheData = extractFilterList(cacheData);

        // populate cacheData.parameters
        // for store function call parameters eg. '$index', '$root'
        // useful with DOM for-loop template as reference to binding data
        const paramList = getFunctionParameterList(cacheData.dataKey);
        if (paramList) {
            cacheData.parameters = paramList;
            cacheData.dataKey = cacheData.dataKey.replace(REGEX.FUNCTION_PARAM, '').trim();
        }
        // store parent array reference to cacheData
        cacheData[constants.PARENT_REF] = bindingCache[type];
        bindingCache[type].push(cacheData);
    }
    return bindingCache;
};

const createBindingCache = ({rootNode = null, bindingAttrs = {}, skipCheck, isRenderedTemplate = false}) => {
    let bindingCache = {};

    if (!rootNode instanceof window.Node) {
        throw new TypeError('walkDOM: Expected a DOM node');
    }

    bindingAttrsMap = bindingAttrsMap || invertObj(bindingAttrs);

    const parseNode = (node, skipNodeCheckFn = defaultSkipCheck) => {
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
        let iterateList = [];

        if (hasSkipChildParseBindings.length) {
            isSkipForOfChild = true;
            iterateList = hasSkipChildParseBindings;
        } else if (isRenderedTemplate && attrObj[bindingAttrs.tmp]) {
            // skip current node parse if was called by node has template binding and already rendered
            return true;
        } else {
            iterateList = Object.keys(attrObj);
        }

        iterateList.forEach((key) => {
            // skip for switch case and default bining
            if (key !== bindingAttrs.case && key !== bindingAttrs.default) {
                bindingCache = populateBindingCache({
                    node: node,
                    attrObj: attrObj,
                    bindingCache: bindingCache,
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
