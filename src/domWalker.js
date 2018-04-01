import * as util from './util';

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

const createBindingCache = ({rootNode = null, bindingAttrs = {}, skipCheck}) => {
    let bindingCache = {};

    if (!rootNode instanceof window.Node) {
        throw new TypeError('walkDOM: Expected a DOM node');
    }

    bindingAttrsMap = bindingAttrsMap || util.invertObj(bindingAttrs);

    const rootSkipCheck = (node) => {
        return node.tagName === 'SVG';
    };

    const defaultSkipCheck = (node) => {
        return node.tagName === 'SVG' || node.getAttribute(bindingAttrs.comp);
    };

    const populateBindingCache = (node, attrObj, key) => {
        let attrValue;
        let cacheData;

        if (bindingAttrsMap[key] && attrObj[key]) {
            bindingCache[key] = bindingCache[key] || [];
            attrValue = attrObj[key].trim();
            cacheData = {
                el: node,
                dataKey: attrValue,
            };

            // for store function call parameters eg. '$index', '$root'
            // useful with DOM for-loop template as reference to binding data
            let paramList = util.getFunctionParameterList(attrValue);
            if (paramList) {
                cacheData.parameters = paramList;
                cacheData.dataKey = cacheData.dataKey.replace(util.REGEX.FUNCTIONPARAM, '').trim();
            }

            bindingCache[key].push(cacheData);
        }
    };

    const parseNode = (node, skipCheckFn = defaultSkipCheck) => {
        let attrObj;
        let isSkipForOfChild = false;

        if (node.nodeType === 1 && node.hasAttributes()) {
            if (skipCheckFn(node)) {
                return false;
            }

            if (typeof skipCheck === 'function' && skipCheck(node)) {
                return false;
            }

            // when creating sub bindingCache if is for tmp binding
            // skip same element that has forOf binding the  forOf is alredy parsed
            attrObj = getAttributesObject(node);

            if (attrObj[bindingAttrs.forOf]) {
                isSkipForOfChild = true;
                populateBindingCache(node, attrObj, bindingAttrs.forOf);
            } else {
                Object.keys(attrObj).forEach((key) => {
                    populateBindingCache(node, attrObj, key);
                });
            }

            // after cache forOf skip parse child nodes
            if (isSkipForOfChild) {
                return false;
            }
        }
        return true;
    };

    if (parseNode(rootNode, rootSkipCheck)) {
        walkDOM(rootNode, parseNode);
    }
    return bindingCache;
};

export default createBindingCache;
