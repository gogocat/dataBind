import {invertObj, getFunctionParameterList, REGEX} from './util';

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
    let ret = {};
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

        // for store function call parameters eg. '$index', '$root'
        // useful with DOM for-loop template as reference to binding data
        let paramList = getFunctionParameterList(attrValue);
        if (paramList) {
            cacheData.parameters = paramList;
            cacheData.dataKey = cacheData.dataKey.replace(REGEX.FUNCTIONPARAM, '').trim();
        }

        bindingCache[type].push(cacheData);
    }
    return bindingCache;
};

const createBindingCache = ({rootNode = null, bindingAttrs = {}, skipCheck}) => {
    let bindingCache = {};

    if (!rootNode instanceof window.Node) {
        throw new TypeError('walkDOM: Expected a DOM node');
    }

    bindingAttrsMap = bindingAttrsMap || invertObj(bindingAttrs);

    const parseNode = (node, skipNodeCheckFn = defaultSkipCheck) => {
        let attrObj;
        let isSkipForOfChild = false;

        if (node.nodeType !== 1 || !node.hasAttributes()) {
            return true;
        }
        if (skipNodeCheckFn(node, bindingAttrs) || (typeof skipCheck === 'function' && skipCheck(node))) {
            return false;
        }

        // when creating sub bindingCache if is for tmp binding
        // skip same element that has forOf binding the  forOf is alredy parsed
        attrObj = getAttributesObject(node);
        const hasSkipChildParseBindings = checkSkipChildParseBindings(attrObj, bindingAttrs);
        let iterateList = Object.keys(attrObj);

        if (hasSkipChildParseBindings.length) {
            isSkipForOfChild = true;
            iterateList = hasSkipChildParseBindings;
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
