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

const createBindingCache = (rootNode = null, bindingAttrs = {}, skipCheck) => {
    let bindingCache = {};

    if (!rootNode instanceof window.Node) {
        throw new TypeError('walkDOM: Expected a DOM node');
    }

    bindingAttrsMap = bindingAttrsMap || util.invertObj(bindingAttrs);

    const rootSkipCheck = (node) => {
        return node.tagName === 'SVG';
    };

    const defaultSkipCheck =
        typeof skipCheck === 'function'
            ? skipCheck
            : (node) => {
                return node.tagName === 'SVG' || node.getAttribute(bindingAttrs.comp);
            };

    const parseNode = (node, skipCheckFn = defaultSkipCheck) => {
        let attrObj;
        let attrValue;
        let cacheData;

        if (node.nodeType === 1 && node.hasAttributes()) {
            if (skipCheckFn(node)) {
                return false;
            }

            attrObj = getAttributesObject(node);

            Object.keys(attrObj).forEach((key) => {
                if (bindingAttrsMap[key] && attrObj[key]) {
                    bindingCache[key] = bindingCache[key] || [];
                    attrValue = attrObj[key].trim();
                    cacheData = {
                        el: node,
                        dataKey: attrValue,
                    };

                    // TODO - for store function call parameters eg. '$data', '$root'
                    // useful with DOM for-loop template as reference to binding data
                    let paramList = util.getFunctionParameterList(attrValue);
                    if (paramList) {
                        cacheData.parameters = paramList;
                        cacheData.dataKey = cacheData.dataKey
                            .replace(util.REGEX.FUNCTIONPARAM, '')
                            .trim();
                    }

                    bindingCache[key].push(cacheData);
                }
            });

            // after cache forOf skip parse child nodes
            if (attrObj[bindingAttrs.forOf]) {
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
