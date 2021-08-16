import * as config from './config';

const hasIsArray = Array.isArray;

const REGEX = {
    BAD_TAGS: /<(script|del)(?=[\s>])[\w\W]*?<\/\1\s*>/ig,
    FOR_OF: /(.*?)\s+(?:in|of)\s+(.*)/,
    FUNCTION_PARAM: /\((.*?)\)/,
    HTML_TAG: /^[\s]*<([a-z][^\/\s>]+)/i,
    OBJECT_LITERAL: /^\{.+\}$/,
    PIPE: /\|/,
    WHITE_SPACES: /\s+/g,
};

const IS_SUPPORT_TEMPLATE = 'content' in document.createElement('template');

const WRAP_MAP = {
    div: ['div', '<div>', '</div>'],
    thead: ['table', '<table>', '</table>'],
    col: ['colgroup', '<table><colgroup>', '</colgroup></table>'],
    tr: ['tbody', '<table><tbody>', '</tbody></table>'],
    td: ['tr', '<table><tr>', '</tr></table>'],
};
WRAP_MAP.caption = WRAP_MAP.colgroup = WRAP_MAP.tbody = WRAP_MAP.tfoot = WRAP_MAP.thead;
WRAP_MAP.th = WRAP_MAP.td;

const isArray = (obj) => {
    return hasIsArray ? Array.isArray(obj) : Object.prototype.toString.call(obj) === '[object Array]';
};

const isJsObject = (obj) => {
    return obj !== null && typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Object]';
};

const isPlainObject = (obj) => {
    if (!isJsObject(obj)) {
        return false;
    }

    // If has modified constructor
    const ctor = obj.constructor;
    if (typeof ctor !== 'function') return false;

    // If has modified prototype
    const prot = ctor.prototype;
    if (isJsObject(prot) === false) return false;

    // If constructor does not have an Object-specific method
    if (prot.hasOwnProperty('isPrototypeOf') === false) {
        return false;
    }

    // Most likely a plain Object
    return true;
};

const isObjectLiteralString = (str = '') => {
    return REGEX.OBJECT_LITERAL.test(str);
};

const isEmptyObject = (obj) => {
    if (isJsObject(obj)) {
        return Object.getOwnPropertyNames(obj).length === 0;
    }
    return false;
};

function getFirstHtmlStringTag(htmlString) {
    const match = htmlString.match(REGEX.HTML_TAG);
    if (match) {
        return match[1];
    }
    return null;
}

function removeBadTags(htmlString = '') {
    return htmlString.replace(REGEX.BAD_TAGS, '');
}

function createHtmlFragment(htmlString) {
    if (typeof htmlString !== 'string') {
        return null;
    }
    // use template element
    if (IS_SUPPORT_TEMPLATE) {
        const template = document.createElement('template');
        template.innerHTML = removeBadTags(htmlString);
        return template.content;
    }
    // use document fragment with wrap html tag for tr, td etc.
    const fragment = document.createDocumentFragment();
    const queryContainer = document.createElement('div');
    const firstTag = getFirstHtmlStringTag(htmlString);
    const wrap = WRAP_MAP[firstTag || 'div'];

    if (wrap[0] === 'div') {
        return document.createRange().createContextualFragment(htmlString);
    }

    queryContainer.insertAdjacentHTML('beforeend', `${wrap[1]}${htmlString}${wrap[2]}`);

    const query = queryContainer.querySelector(wrap[0]);

    while (query.firstChild) {
        fragment.appendChild(query.firstChild);
    }

    return fragment;
}

const generateElementCache = (bindingAttrs) => {
    const elementCache = {};

    for (const i in bindingAttrs) {
        if (bindingAttrs.hasOwnProperty(i)) {
            if (isArray(bindingAttrs)) {
                elementCache[bindingAttrs[i]] = [];
            } else {
                elementCache[i] = [];
            }
        }
    }

    return elementCache;
};


// simplified version of Lodash _.get
const _get = function get(obj, path, def) {
    function everyFunc(step) {
        return !(step && (obj = obj[step]) === undefined);
    }
    const fullPath = path
        .replace(/\[/g, '.')
        .replace(/]/g, '')
        .split('.')
        .filter(Boolean);

    return fullPath.every(everyFunc) ? obj : def;
};

/**
 * getViewModelValue
 * @description walk a object by provided string path. eg 'a.b.c'
 * @param {object} viewModel
 * @param {string} prop
 * @return {object}
 */
const getViewModelValue = (viewModel, prop) => {
    return _get(viewModel, prop);
};

// simplified version of Lodash _.set
// https://stackoverflow.com/questions/54733539/javascript-implementation-of-lodash-set-method
const _set = (obj, path, value) => {
    if (Object(obj) !== obj) return obj; // When obj is not an object
    // If not yet an array, get the keys from the string-path
    if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || [];

    // Iterate all of them except the last one
    path.slice(0, -1).reduce((a, c, i) =>
        Object(a[c]) === a[c] ? // Does the key exist and is its value an object?
        // Yes: then follow that path
            a[c] :
        // No: create the key. Is the next key a potential array-index?
            a[c] = Math.abs(path[i+1])>>0 === +path[i+1] ?
                [] : // Yes: assign a new array object
                {}, // No: assign a new plain object
    obj)[path[path.length-1]] = value; // Finally assign the value to the last key

    // Return the top-level object to allow chaining
    return obj;
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
    return _set(obj, prop, value);
};

const getViewModelPropValue = (viewModel, bindingCache) => {
    let dataKey = bindingCache.dataKey;
    let paramList = bindingCache.parameters;
    const isInvertBoolean = dataKey.charAt(0) === '!';

    if (isInvertBoolean) {
        dataKey = isInvertBoolean ? dataKey.substring(1) : dataKey;
    }

    let ret = getViewModelValue(viewModel, dataKey);

    if (typeof ret === 'function') {
        const viewModelContext = resolveViewModelContext(viewModel, dataKey);
        const oldViewModelProValue = bindingCache.elementData ? bindingCache.elementData.viewModelPropValue : null;
        paramList = paramList ? resolveParamList(viewModel, paramList) : [];
        // let args = [oldViewModelProValue, bindingCache.el].concat(paramList);
        const args = paramList.concat([oldViewModelProValue, bindingCache.el]);
        ret = ret.apply(viewModelContext, args);
    }

    ret = isInvertBoolean ? !Boolean(ret) : ret;

    // call through fitlers to get final value
    ret = filtersViewModelPropValue({
        value: ret,
        viewModel: viewModel,
        bindingCache: bindingCache,
    });

    return ret;
};

const filtersViewModelPropValue = ({value, viewModel, bindingCache}) => {
    let ret = value;
    if (bindingCache.filters) {
        each(bindingCache.filters, (index, filter) => {
            const viewModelContext = resolveViewModelContext(viewModel, filter);
            const filterFn = getViewModelValue.call(viewModelContext, viewModelContext, filter);
            try {
                ret = filterFn.call(viewModelContext, ret);
            } catch (err) {
                throwErrorMessage(err, `Invalid filter: ${filter}`);
            }
        });
    }
    return ret;
};

const parseStringToJson = (str) => {
    // fix unquote or single quote keys and replace single quote to double quote
    const ret = str.replace(/(\s*?{\s*?|\s*?,\s*?)(['"])?([a-zA-Z0-9]+)(['"])?:/g, '$1"$3":').replace(/'/g, '"');
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
    const data = {};

    if (!$form instanceof HTMLFormElement) {
        return data;
    }

    const formData = new FormData($form);

    formData.forEach((value, key) => {
        if (!Object.prototype.hasOwnProperty.call( Object, key ) ) {
            data[key] = value;
            return;
        }
        if (!Array.isArray(data[key])) {
            data[key] = [data[key]];
        }
        data[key].push(value);
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
    if (!str || str.length > config.maxDatakeyLength) {
        return;
    }
    let paramlist = str.match(REGEX.FUNCTION_PARAM);

    if (paramlist && paramlist[1]) {
        paramlist = paramlist[1].split(',');
        paramlist.forEach(function(v, i) {
            paramlist[i] = v.trim();
        });
    }
    return paramlist;
};

const extractFilterList = (cacheData) => {
    if (!cacheData || !cacheData.dataKey || cacheData.dataKey.length > config.maxDatakeyLength) {
        return cacheData;
    }
    const filterList = cacheData.dataKey.split(REGEX.PIPE);
    let isOnceIndex;
    cacheData.dataKey = filterList[0].trim();
    if (filterList.length > 1) {
        filterList.shift(0);
        filterList.forEach(function(v, i) {
            filterList[i] = v.trim();
            if (filterList[i] === config.constants.filters.ONCE) {
                cacheData.isOnce = true;
                isOnceIndex = i;
            }
        });
        // don't store filter 'once' - because it is internal logic not a property from viewModel
        if (isOnceIndex >= 0) {
            filterList.splice(isOnceIndex, 1);
        }
        cacheData.filters = filterList;
    }
    return cacheData;
};

const invertObj = (sourceObj) => {
    return Object.keys(sourceObj).reduce(function(obj, key) {
        obj[sourceObj[key]] = key;
        return obj;
    }, {});
};

const createDeferredObj = () => {
    const dfObj = {};

    dfObj.promise = new Promise((resolve, reject) => {
        dfObj.resolve = resolve;
        dfObj.reject = reject;
    });

    return dfObj;
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
        let dfObj = createDeferredObj();
        let rafId = 0;

        // return decorated fn
        return function() {
            /* eslint-disable prefer-rest-params */
            const args = Array.from ? Array.from(arguments) : Array.prototype.slice.call(arguments);

            window.cancelAnimationFrame(rafId);
            rafId = window.requestAnimationFrame(() => {
                try {
                    // fn is Binder.render function
                    fn.apply(ctx, args);
                    // dfObj.resolve is function provided in .then promise chain
                    // ctx is the current component
                    dfObj.resolve(ctx);
                } catch (err) {
                    console.error('error in rendering: ', err);
                    dfObj.reject(err);
                }

                // reset dfObj - otherwise then callbacks will not be in execution order
                // example:
                // myApp.render().then(function(){console.log('ok1')});
                // myApp.render().then(function(){console.log('ok2')});
                // myApp.render().then(function(){console.log('ok3')});
                // >> ok1, ok2, ok3
                dfObj = createDeferredObj();

                window.cancelAnimationFrame(rafId);
            });

            return dfObj.promise;
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
    let attributesLength = 0;
    let skipArray;

    if (!node || node.nodeType !== 1 || !node.hasAttributes()) {
        return;
    }
    if (skipList) {
        skipArray = [];
        skipArray = typeof skipList === 'string' ? skipArray.push(skipList) : skipList;
    }
    const attrObj = {};
    attributesLength = node.attributes.length;

    if (attributesLength) {
        for (let i = 0; i < attributesLength; i += 1) {
            const attribute = node.attributes.item(i);
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

const each = (obj, fn) => {
    if (typeof obj !== 'object' || typeof fn !== 'function') {
        return;
    }
    let keys = [];
    let keysLength = 0;
    const isArrayObj = isArray(obj);
    let key;
    let value;
    let i = 0;

    if (isArrayObj) {
        keysLength = obj.length;
    } else if (isJsObject(obj)) {
        keys = Object.keys(obj);
        keysLength = keys.length;
    } else {
        throw new TypeError('Object is not an array or object');
    }

    for (i = 0; i < keysLength; i += 1) {
        if (isArrayObj) {
            key = i;
            value = obj[i];
        } else {
            key = keys[i];
            value = obj[key];
        }
        fn(key, value);
    }
};

const isMergebleObject = (item) => {
    return isJsObject(item) && !isArray(item);
};

/**
 * cloneDomNode
 * @param {object} element
 * @return {object} cloned element
 * @description helper function to clone node
 */
const cloneDomNode = (element) => {
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
    const refNextElement = referenceNode && referenceNode.nextSibling ? referenceNode.nextSibling : null;
    return parentNode.insertBefore(newNode, refNextElement);
};

const resolveViewModelContext = (viewModel, datakey) => {
    let ret = viewModel;
    if (typeof datakey !== 'string') {
        return ret;
    }
    const bindingDataContext = datakey.split('.');
    if (bindingDataContext.length > 1) {
        if (bindingDataContext[0] === config.bindingDataReference.rootDataKey) {
            ret = viewModel[config.bindingDataReference.rootDataKey] || viewModel;
        } else if (bindingDataContext[0] === config.bindingDataReference.currentData) {
            ret = viewModel[config.bindingDataReference.currentData] || viewModel;
        }
    }
    return ret;
};

const resolveParamList = (viewModel, paramList) => {
    if (!viewModel || !isArray(paramList)) {
        return;
    }
    return paramList.map((param) => {
        param = param.trim();

        if (param === config.bindingDataReference.currentIndex) {
            // convert '$index' to value
            param = viewModel[config.bindingDataReference.currentIndex];
        } else if (param === config.bindingDataReference.currentData) {
            // convert '$data' to value or current viewModel
            param = viewModel[config.bindingDataReference.currentData] || viewModel;
        } else if (param === config.bindingDataReference.rootDataKey) {
            // convert '$root' to root viewModel
            param = viewModel[config.bindingDataReference.rootDataKey] || viewModel;
        }
        return param;
    });
};

const removeElement = (el) => {
    if (el && el.parentNode) {
        el.parentNode.removeChild(el);
    }
};

const emptyElement = (node) => {
    if (node && node.firstChild) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }
    return node;
};

const throwErrorMessage = (err = null, errorMessage = '') => {
    const message = err && err.message ? err.message : errorMessage;
    if (typeof console.error === 'function') {
        return console.error(message);
    }
    return console.log(message);
};

export {
    REGEX,
    arrayRemoveMatch,
    cloneDomNode,
    createHtmlFragment,
    debounceRaf,
    each,
    emptyElement,
    extend,
    extractFilterList,
    generateElementCache,
    getFormData,
    getFunctionParameterList,
    getNodeAttrObj,
    getViewModelPropValue,
    getViewModelValue,
    insertAfter,
    invertObj,
    isArray,
    isEmptyObject,
    isJsObject,
    isPlainObject,
    isObjectLiteralString,
    parseStringToJson,
    removeElement,
    resolveParamList,
    resolveViewModelContext,
    setViewModelValue,
    throwErrorMessage,
};
