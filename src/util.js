// require to use lodash
_ = window._ || {};

const hasIsArray = Array.isArray;

const REGEX = {
    FUNCTIONPARAM: /\((.*?)\)/,
    WHITESPACES: /\s+/g,
    FOROF: /(.*?)\s+(?:in|of)\s+(.*)/,
};

const generateElementCache = (bindingAttrs) => {
    let elementCache = {};
    $.each(bindingAttrs, function(k, v) {
        elementCache[v] = [];
    });
    return elementCache;
};

const isArray = (obj) => {
    return hasIsArray
        ? Array.isArray(obj)
        : Object.prototype.toString.call(obj) === '[object Array]';
};

const isJsObject = (obj) => {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        Object.prototype.toString.call(obj) === '[object Object]'
    );
};

const isPlainObject = (obj) => {
    let ctor;
    let prot;

    if (!isJsObject(obj)) {
        return false;
    }

    // If has modified constructor
    ctor = obj.constructor;
    if (typeof ctor !== 'function') return false;

    // If has modified prototype
    prot = ctor.prototype;
    if (isJsObject(prot) === false) return false;

    // If constructor does not have an Object-specific method
    if (prot.hasOwnProperty('isPrototypeOf') === false) {
        return false;
    }

    // Most likely a plain Object
    return true;
};

const isEmptyObject = (obj) => {
    if (isJsObject(obj)) {
        return Object.getOwnPropertyNames(obj).length === 0;
    }
    return false;
};

/**
 * getViewModelValue
 * @description walk a object by provided string path. eg 'a.b.c'
 * @param {object} obj
 * @param {string} prop
 * @return {object}
 */
const getViewModelValue = (obj, prop) => {
    return _.get(obj, prop);
};

/**
 * setViewModelValue
 * @description populate viewModel object by path string
 * @param {object} obj
 * @param {string} prop
 * @param {string} value
 * @return {call} underscore set
 */
const setViewModelValue = (obj, prop, value) => {
    return _.set(obj, prop, value);
};

const parseStringToJson = (str) => {
    // fix unquote or single quote keys and replace single quote to double quote
    let ret = str
        .replace(/(\s*?{\s*?|\s*?,\s*?)(['"])?([a-zA-Z0-9]+)(['"])?:/g, '$1"$3":')
        .replace(/'/g, '"');
    return JSON.parse(ret);
};

/**
 * arrayRemoveMatch
 * @description remove match items in fromArray out of toArray
 * @param {array} toArray
 * @param {array} frommArray
 * @return {boolean}
 */
const arrayRemoveMatch = (toArray, frommArray) => {
    return toArray.filter((value, index) => {
        return frommArray.indexOf(value) < 0;
    });
};

const getFormData = ($form) => {
    let sArray = $form.serializeArray();
    let data = {};

    sArray.map((n) => {
        data[n['name']] = n['value'];
    });

    return data;
};

/**
 * getFunctionParameterList
 * @description convert parameter string to arrary
 * eg. '("a","b","c")' > ["a","b","c"]
 * @param {string} str
 * @return {array} paramlist
 */
const getFunctionParameterList = (str) => {
    let paramlist = str.match(REGEX.FUNCTIONPARAM);

    if (paramlist && paramlist[1]) {
        paramlist = paramlist[1].split(',');
        paramlist.forEach(function(v, i) {
            paramlist[i] = v.trim();
        });
    }
    return paramlist;
};

const invertObj = (sourceObj) => {
    return Object.keys(sourceObj).reduce(function(obj, key) {
        obj[sourceObj[key]] = key;
        return obj;
    }, {});
};

/**
 * debounce
 * @description decorate a function to be debounce using requestAnimationFrame
 * @param {function} fn
 * @param {context} ctx
 * @return {function}
 */
const debounceRaf = (fn, ctx = null) => {
    return (function(fn, ctx) {
        let dfObj = $.Deferred(); // eslint-disable-line new-cap
        let rafId = 0;

        // return decorated fn
        return function() {
            let args;
            /* eslint-disable prefer-rest-params */
            args = Array.from ? Array.from(arguments) : Array.prototype.slice.call(arguments);

            window.cancelAnimationFrame(rafId);
            rafId = window.requestAnimationFrame(() => {
                $.when(fn.apply(ctx, args)).then(
                    dfObj.resolve.apply(ctx, arguments),
                    dfObj.reject.apply(ctx, arguments),
                    dfObj.notify.apply(ctx, arguments)
                );
                dfObj = $.Deferred(); // eslint-disable-line new-cap
            });
            /* eslint-enable prefer-rest-params */
            return dfObj.promise();
        };
    })(fn, ctx);
};

/**
 * getNodeAttrObj
 * @description convert Node attributes object to a json object
 * @param {object} node
 * @param {array} skipList
 * @return {object}
 */
const getNodeAttrObj = (node, skipList) => {
    let attrObj;
    let attributesLength = 0;
    let skipArray;

    if (!node || node.nodeType !== 1 || !node.hasAttributes()) {
        return attrObj;
    }
    if (skipList) {
        skipArray = [];
        skipArray = typeof skipList === 'string' ? skipArray.push(skipList) : skipList;
    }
    attrObj = {};
    attributesLength = node.attributes.length;

    if (attributesLength) {
        for (let i = 0; i < attributesLength; i += 1) {
            let attribute = node.attributes.item(i);
            attrObj[attribute.nodeName] = attribute.nodeValue;
        }
    }

    if (isArray(skipArray)) {
        skipArray.forEach((item) => {
            if (attrObj[item]) {
                delete attrObj[item];
            }
        });
    }
    return attrObj;
};

/**
 * extend
 * @param {boolean} isDeepMerge
 * @param {object} target
 * @param {object} sources
 * @return {object} merged object
 */
const extend = (isDeepMerge = false, target, ...sources) => {
    if (!sources.length) {
        return target;
    }
    const source = sources.shift();
    if (source === undefined) {
        return target;
    }

    if (!isDeepMerge) {
        return Object.assign(target, ...sources);
    }

    if (isMergebleObject(target) && isMergebleObject(source)) {
        Object.keys(source).forEach((key) => {
            if (isMergebleObject(source[key])) {
                if (!target[key]) {
                    target[key] = {};
                }
                extend(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        });
    }

    return extend(true, target, ...sources);
};

const isObject = (item) => {
    return item !== null && typeof item === 'object';
};

const isMergebleObject = (item) => {
    return isObject(item) && !isArray(item);
};

/**
 * createDomTemplate
 * @param {object} element
 * @return {object} cloned element
 * @description helper function to clone node
 */
const createDomTemplate = (element) => {
    return element.cloneNode(true);
};

/**
 * insertAfter
 * @param {object} parentNode
 * @param {object} newNode
 * @param {object} referenceNode
 * @return {object} node
 * @description helper function to insert new node before the reference node
 */
const insertAfter = (parentNode, newNode, referenceNode) => {
    let refNextElement =
        referenceNode && referenceNode.nextSibling ? referenceNode.nextSibling : null;
    return parentNode.insertBefore(newNode, refNextElement);
};

export {
    REGEX,
    isArray,
    isPlainObject,
    isEmptyObject,
    extend,
    generateElementCache,
    getViewModelValue,
    setViewModelValue,
    parseStringToJson,
    debounceRaf,
    arrayRemoveMatch,
    getFormData,
    getFunctionParameterList,
    invertObj,
    getNodeAttrObj,
    createDomTemplate,
    insertAfter,
};
