import * as config from './config';
import type {ViewModel, BindingCache, ElementCache, DeferredObj, WrapMap, PlainObject} from './types';

const hasIsArray = Array.isArray;

export const REGEX = {
    BAD_TAGS: /<(script|del)(?=[\s>])[\w\W]*?<\/\1\s*>/ig,
    FOR_OF: /(.*?)\s+(?:in|of)\s+(.*)/,
    FUNCTION_PARAM: /\((.*?)\)/,
    HTML_TAG: /^[\s]*<([a-z][^\/\s>]+)/i,
    OBJECT_LITERAL: /^\{.+\}$/,
    PIPE: /\|/,
    WHITE_SPACES: /\s+/g,
    LINE_BREAKS_TABS: /(\r\n|\n|\r|\t)/gm,
};

const IS_SUPPORT_TEMPLATE = 'content' in document.createElement('template');

const WRAP_MAP: WrapMap = {
    div: ['div', '<div>', '</div>'],
    thead: ['table', '<table>', '</table>'],
    col: ['colgroup', '<table><colgroup>', '</colgroup></table>'],
    tr: ['tbody', '<table><tbody>', '</tbody></table>'],
    td: ['tr', '<table><tr>', '</tr></table>'],
};
WRAP_MAP.caption = WRAP_MAP.colgroup = WRAP_MAP.tbody = WRAP_MAP.tfoot = WRAP_MAP.thead;
WRAP_MAP.th = WRAP_MAP.td;

export const isArray = (obj: unknown): obj is unknown[] => {
    return hasIsArray ? Array.isArray(obj) : Object.prototype.toString.call(obj) === '[object Array]';
};

export const isJsObject = (obj: unknown): obj is object => {
    return obj !== null && typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Object]';
};

export const isPlainObject = (obj: unknown): obj is PlainObject => {
    if (!isJsObject(obj)) {
        return false;
    }

    // If has modified constructor
    const ctor = (obj as PlainObject).constructor;
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

// test if string contains '{...}'. string must not contains tab, line breaks
export const isObjectLiteralString = (str: string = ''): boolean => {
    return REGEX.OBJECT_LITERAL.test(str);
};

export const isEmptyObject = (obj: unknown): boolean => {
    if (isJsObject(obj)) {
        return Object.getOwnPropertyNames(obj).length === 0;
    }
    return false;
};

const getFirstHtmlStringTag = (htmlString: string): string | null => {
    const match = htmlString.match(REGEX.HTML_TAG);
    if (match) {
        return match[1];
    }
    return null;
};

const removeBadTags = (htmlString: string = ''): string => {
    return htmlString.replace(REGEX.BAD_TAGS, '');
};

export const createHtmlFragment = (htmlString: unknown): DocumentFragment | null => {
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

    while (query && query.firstChild) {
        fragment.appendChild(query.firstChild);
    }

    return fragment;
};

export const generateElementCache = (bindingAttrs: PlainObject | unknown[]): ElementCache => {
    const elementCache: ElementCache = {};

    for (const i in bindingAttrs) {
        if (bindingAttrs.hasOwnProperty(i)) {
            if (isArray(bindingAttrs)) {
                elementCache[bindingAttrs[i] as string] = [];
            } else {
                elementCache[i] = [];
            }
        }
    }

    return elementCache;
};


/**
 * List of dangerous property names that should not be accessed
 * to prevent prototype pollution attacks
 */
const DANGEROUS_PROPS = ['__proto__', 'constructor', 'prototype'];

/**
 * Check if a property name is safe to access
 */
const isSafeProperty = (prop: string): boolean => {
    return !DANGEROUS_PROPS.includes(prop);
};

// simplified version of Lodash _.get with prototype pollution protection
const _get = (obj: unknown, path: string, def?: unknown): unknown => {
    const fullPath = path
        .replace(/\[/g, '.')
        .replace(/]/g, '')
        .split('.')
        .filter(Boolean);

    let current: unknown = obj;
    for (const step of fullPath) {
        // Prevent access to dangerous properties
        if (!step || !isSafeProperty(step)) {
            return def;
        }

        if (current == null) {
            return def;
        }

        current = (current as PlainObject)[step];

        if (current === undefined) {
            return def;
        }
    }

    return current;
};

/**
 * getViewModelValue
 * @description walk a object by provided string path. eg 'a.b.c'
 * @param {object} viewModel
 * @param {string} prop
 * @return {object}
 */
export const getViewModelValue = (viewModel: ViewModel, prop: string): unknown => {
    return _get(viewModel, prop);
};

// simplified version of Lodash _.set with prototype pollution protection
// https://stackoverflow.com/questions/54733539/javascript-implementation-of-lodash-set-method
const _set = (obj: PlainObject, path: string | string[], value: unknown): PlainObject => {
    if (Object(obj) !== obj) return obj; // When obj is not an object

    // If not yet an array, get the keys from the string-path
    let pathArray: string[];
    if (!Array.isArray(path)) {
        pathArray = path.toString().match(/[^.[\]]+/g) || [];
    } else {
        pathArray = path;
    }

    // Check all keys in path for dangerous properties
    for (const key of pathArray) {
        if (!isSafeProperty(key)) {
            console.warn(`Blocked attempt to set dangerous property: ${key}`);
            return obj;
        }
    }

    // Iterate all of them except the last one
    const lastKey = pathArray[pathArray.length - 1];
    const target = pathArray.slice(0, -1).reduce((a: PlainObject, c: string, i: number) => {
        // Prevent setting dangerous properties
        if (!isSafeProperty(c)) {
            return a;
        }

        if (Object(a[c]) === a[c]) {
            // Key exists and is an object, follow that path
            return a[c] as PlainObject;
        }

        // Create the key. Is the next key a potential array-index?
        const nextKey = pathArray[i + 1];
        a[c] = Math.abs(Number(nextKey)) >> 0 === +nextKey ? [] : {};
        return a[c] as PlainObject;
    }, obj);

    // Set the final value only if the key is safe
    if (isSafeProperty(lastKey)) {
        target[lastKey] = value;
    }

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
export const setViewModelValue = (obj: PlainObject, prop: string, value: unknown): PlainObject => {
    return _set(obj, prop, value);
};

export const getViewModelPropValue = (viewModel: ViewModel, bindingCache: BindingCache): unknown => {
    let dataKey = bindingCache.dataKey;
    let paramList = bindingCache.parameters;
    const isInvertBoolean = dataKey && dataKey.charAt(0) === '!';

    if (isInvertBoolean && dataKey) {
        dataKey = isInvertBoolean ? dataKey.substring(1) : dataKey;
    }

    let ret = dataKey ? getViewModelValue(viewModel, dataKey) : undefined;

    if (typeof ret === 'function') {
        const viewModelContext = resolveViewModelContext(viewModel, dataKey || '');
        const oldViewModelProValue = bindingCache.elementData ? bindingCache.elementData.viewModelPropValue : null;
        paramList = paramList ? resolveParamList(viewModel, paramList) : [];
        // let args = [oldViewModelProValue, bindingCache.el].concat(paramList);
        const args = paramList.concat([oldViewModelProValue, bindingCache.el]);
        ret = (ret as Function).apply(viewModelContext, args);
    }

    ret = isInvertBoolean ? !ret : ret;

    // call through fitlers to get final value
    ret = filtersViewModelPropValue({
        value: ret,
        viewModel,
        bindingCache,
    });

    return ret;
};

const filtersViewModelPropValue = ({value, viewModel, bindingCache}: {value: unknown, viewModel: ViewModel, bindingCache: BindingCache}): unknown => {
    let ret = value;
    if (bindingCache.filters) {
        each(bindingCache.filters, (index: string | number, filter: string) => {
            const viewModelContext = resolveViewModelContext(viewModel, filter);
            const filterFn = getViewModelValue.call(viewModelContext, viewModelContext, filter);
            try {
                ret = (filterFn as Function).call(viewModelContext, ret);
            } catch (err) {
                throwErrorMessage(err, `Invalid filter: ${filter}`);
            }
        });
    }
    return ret;
};

export const parseStringToJson = (str: string): PlainObject => {
    // fix unquote or single quote keys and replace single quote to double quote
    const ret = str.replace(/(\s*?{\s*?|\s*?,\s*?)(['"])?([a-zA-Z0-9]+)(['"])?:/g, '$1"$3":').replace(/'/g, '"');
    return JSON.parse(ret) as PlainObject;
};

/**
 * arrayRemoveMatch
 * @description remove match items in fromArray out of toArray
 * @param {array} toArray
 * @param {array} frommArray
 * @return {boolean}
 */
export const arrayRemoveMatch = (toArray: unknown[], frommArray: unknown[]): unknown[] => {
    return toArray.filter((value, _index) => {
        return frommArray.indexOf(value) < 0;
    });
};

export const getFormData = ($form: HTMLFormElement): PlainObject => {
    const data: PlainObject = {};

    if (!($form instanceof HTMLFormElement)) {
        return data;
    }

    const formData = new FormData($form);

    formData.forEach((value, key) => {
        if (!Object.prototype.hasOwnProperty.call(Object, key)) {
            data[key] = value;
            return;
        }
        if (!Array.isArray(data[key])) {
            data[key] = [data[key]];
        }
        (data[key] as unknown[]).push(value);
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
export const getFunctionParameterList = (str: string): string[] | undefined => {
    if (!str || str.length > config.maxDatakeyLength) {
        return;
    }
    const paramlist = str.match(REGEX.FUNCTION_PARAM);

    if (paramlist && paramlist[1]) {
        const params = paramlist[1].split(',');
        params.forEach((v, i) => {
            params[i] = v.trim();
        });
        return params;
    }
    return undefined;
};

export const extractFilterList = (cacheData: Partial<BindingCache>): Partial<BindingCache> => {
    if (!cacheData || !cacheData.dataKey || cacheData.dataKey.length > config.maxDatakeyLength) {
        return cacheData;
    }
    const filterList = cacheData.dataKey.split(REGEX.PIPE);
    let isOnceIndex: number | undefined;
    cacheData.dataKey = filterList[0].trim();
    if (filterList.length > 1) {
        filterList.shift();
        filterList.forEach((v, i) => {
            filterList[i] = v.trim();
            if (filterList[i] === config.constants.filters.ONCE) {
                cacheData.isOnce = true;
                isOnceIndex = i;
            }
        });
        // don't store filter 'once' - because it is internal logic not a property from viewModel
        if (isOnceIndex !== undefined && isOnceIndex >= 0) {
            filterList.splice(isOnceIndex, 1);
        }
        cacheData.filters = filterList;
    }
    return cacheData;
};

export const invertObj = (sourceObj: PlainObject): PlainObject => {
    return Object.keys(sourceObj).reduce((obj: PlainObject, key: string) => {
        const invertedKey = sourceObj[key];
        // Prevent prototype pollution by checking if the inverted key is safe
        if (typeof invertedKey === 'string' && isSafeProperty(invertedKey)) {
            obj[invertedKey] = key;
        }
        return obj;
    }, {});
};

export const createDeferredObj = (): DeferredObj => {
    const dfObj = {} as DeferredObj;

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
export const debounceRaf = (fn: Function, ctx: unknown = null): Function => {
    return (function (fn: Function, ctx: unknown) {
        let dfObj = createDeferredObj();
        let rafId = 0;

        // return decorated fn
        return function () {

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
export const getNodeAttrObj = (node: HTMLElement, skipList?: string | string[]): Record<string, string> | undefined => {
    let attributesLength = 0;
    let skipArray: string[] | undefined;

    if (!node || node.nodeType !== 1 || !node.hasAttributes()) {
        return;
    }
    if (skipList) {
        skipArray = [];
        skipArray = typeof skipList === 'string' ? [skipList] : skipList;
    }
    const attrObj: Record<string, string> = {};
    attributesLength = node.attributes.length;

    if (attributesLength) {
        for (let i = 0; i < attributesLength; i += 1) {
            const attribute = node.attributes.item(i);
            if (attribute) {
                attrObj[attribute.nodeName] = attribute.nodeValue || '';
            }
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
export const extend = (isDeepMerge: boolean = false, target?: PlainObject, ...sources: PlainObject[]): PlainObject => {
    if (!sources.length) {
        return target || {};
    }
    const source = sources.shift();
    if (source === undefined) {
        return target || {};
    }

    if (!isDeepMerge) {
        return Object.assign(target || {}, source, ...sources);
    }

    if (isMergebleObject(target) && isMergebleObject(source)) {
        Object.keys(source).forEach((key) => {
            if (isMergebleObject(source[key])) {
                if (!target[key]) {
                    target[key] = {};
                }
                extend(true, target[key] as PlainObject, source[key] as PlainObject);
            } else {
                target[key] = source[key];
            }
        });
    }

    return extend(true, target, ...sources);
};

export const each = (obj: unknown[] | PlainObject, fn: Function): void => {
    if (typeof obj !== 'object' || typeof fn !== 'function') {
        return;
    }
    let keys: string[] = [];
    let keysLength = 0;
    const isArrayObj = isArray(obj);
    let key: string | number;
    let value: unknown;
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
            value = (obj as unknown[])[i];
        } else {
            key = keys[i];
            value = (obj as PlainObject)[key];
        }
        fn(key, value);
    }
};

const isMergebleObject = (item: unknown): item is PlainObject => {
    return isJsObject(item) && !isArray(item);
};

/**
 * cloneDomNode
 * @param {object} element
 * @return {object} cloned element
 * @description helper function to clone node
 */
export const cloneDomNode = (element: HTMLElement): HTMLElement => {
    return element.cloneNode(true) as HTMLElement;
};

/**
 * insertAfter
 * @param {object} parentNode
 * @param {object} newNode
 * @param {object} referenceNode
 * @return {object} node
 * @description helper function to insert new node before the reference node
 */
export const insertAfter = (parentNode: Node, newNode: Node, referenceNode: Node | null): Node => {
    const refNextElement = referenceNode && referenceNode.nextSibling ? referenceNode.nextSibling : null;
    return parentNode.insertBefore(newNode, refNextElement);
};

export const resolveViewModelContext = (viewModel: ViewModel, datakey: string): ViewModel => {
    let ret = viewModel;
    if (typeof datakey !== 'string') {
        return ret;
    }
    const bindingDataContext = datakey.split('.');
    if (bindingDataContext.length > 1) {
        if (bindingDataContext[0] === config.bindingDataReference.rootDataKey) {
            ret = (viewModel[config.bindingDataReference.rootDataKey] as ViewModel) || viewModel;
        } else if (bindingDataContext[0] === config.bindingDataReference.currentData) {
            ret = (viewModel[config.bindingDataReference.currentData] as ViewModel) || viewModel;
        }
    }
    return ret;
};

export const resolveParamList = (viewModel: ViewModel, paramList: unknown[]): unknown[] | undefined => {
    if (!viewModel || !isArray(paramList)) {
        return;
    }
    return paramList.map((param) => {
        let resolvedParam: unknown = param;
        if (typeof param === 'string') {
            resolvedParam = param.trim();

            if (resolvedParam === config.bindingDataReference.currentIndex) {
                // convert '$index' to value
                resolvedParam = viewModel[config.bindingDataReference.currentIndex];
            } else if (resolvedParam === config.bindingDataReference.currentData) {
                // convert '$data' to value or current viewModel
                resolvedParam = viewModel[config.bindingDataReference.currentData] || viewModel;
            } else if (resolvedParam === config.bindingDataReference.rootDataKey) {
                // convert '$root' to root viewModel
                resolvedParam = viewModel[config.bindingDataReference.rootDataKey] || viewModel;
            }
        }
        return resolvedParam;
    });
};

export const removeElement = (el: HTMLElement): void => {
    if (el && el.parentNode) {
        el.parentNode.removeChild(el);
    }
};

export const emptyElement = (node: HTMLElement): HTMLElement => {
    if (node && node.firstChild) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }
    return node;
};

export const throwErrorMessage = (err: unknown = null, errorMessage: string = ''): void => {
    const message = err && typeof err === 'object' && 'message' in err ? (err as Error).message : errorMessage;
    if (typeof console.error === 'function') {
        console.error(message);
        return;
    }
    console.log(message);
};

/**
 * parseBindingObjectString
 * @description parse bining object string to object with value always stringify
 * @param {string} str - eg '{ id: $data.id, name: $data.name }'
 * @return {object} - eg { id: '$data.id', name: '$data.name'}
 */
export const parseBindingObjectString = (str: string = ''): Record<string, string> | null => {
    let objectLiteralString = str.trim();
    const ret: Record<string, string> = {};

    if (!REGEX.OBJECT_LITERAL.test(str)) {
        return null;
    }

    // clearn up line breaks and remove first { character
    objectLiteralString = objectLiteralString
        .replace(REGEX.LINE_BREAKS_TABS, '')
        .substring(1);

    // remove last } character
    objectLiteralString = objectLiteralString.substring(0, objectLiteralString.length - 1);

    objectLiteralString.split(',').forEach((item) => {
        const keyVal = item.trim();
        // ignore if last empty item - eg split last comma in object literal
        if (keyVal) {
            const prop = keyVal.split(':');
            const key = prop[0].trim();
            ret[key] = `${prop[1]}`.trim();
        }
    });

    return ret;
};
