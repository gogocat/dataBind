/*
@gogocat/data-bind
version 1.12.0
By Adam Chow
link https://gogocat.github.io/dataBind/
license MIT
*/(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.dataBind = factory());
})(this, (function () { 'use strict';

  function _extends() {
    return _extends = Object.assign ? Object.assign.bind() : function (n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
      }
      return n;
    }, _extends.apply(null, arguments);
  }

  const bindingAttrs$1 = {
    comp: 'data-bind-comp',
    tmp: 'data-bind-tmp',
    text: 'data-bind-text',
    click: 'data-bind-click',
    dblclick: 'data-bind-dblclick',
    blur: 'data-bind-blur',
    focus: 'data-bind-focus',
    hover: 'data-bind-hover',
    input: 'data-bind-input',
    change: 'data-bind-change',
    submit: 'data-bind-submit',
    model: 'data-bind-model',
    show: 'data-bind-show',
    css: 'data-bind-css',
    attr: 'data-bind-attr',
    forOf: 'data-bind-for',
    if: 'data-bind-if',
    switch: 'data-bind-switch',
    case: 'data-bind-case',
    default: 'data-bind-default'
  };
  const serverRenderedAttr = 'data-server-rendered';
  const dataIndexAttr = 'data-index';
  const commentPrefix = {
    forOf: 'data-forOf_',
    if: 'data-if_',
    case: 'data-case_',
    default: 'data-default_'
  };
  const commentSuffix = '_end';
  const bindingDataReference = {
    rootDataKey: '$root',
    currentData: '$data',
    currentIndex: '$index',
    mouseEnterHandlerName: 'in',
    mouseLeaveHandlerName: 'out'
  };
  const bindingUpdateConditions = {
    serverRendered: 'SERVER-RENDERED',
    init: 'INIT'
  };
  // maximum string length before running regex
  const maxDatakeyLength = 250;
  const constants = {
    filters: {
      ONCE: 'once'
    },
    PARENT_REF: '_parent'
  };

  const hasIsArray = Array.isArray;
  const REGEX = {
    BAD_TAGS: /<(script|del)(?=[\s>])[\w\W]*?<\/\1\s*>/ig,
    FOR_OF: /(.*?)\s+(?:in|of)\s+(.*)/,
    FUNCTION_PARAM: /\((.*?)\)/,
    HTML_TAG: /^[\s]*<([a-z][^\/\s>]+)/i,
    OBJECT_LITERAL: /^\{.+\}$/,
    PIPE: /\|/,
    WHITE_SPACES: /\s+/g,
    LINE_BREAKS_TABS: /(\r\n|\n|\r|\t)/gm
  };
  const IS_SUPPORT_TEMPLATE = 'content' in document.createElement('template');
  const WRAP_MAP = {
    div: ['div', '<div>', '</div>'],
    thead: ['table', '<table>', '</table>'],
    col: ['colgroup', '<table><colgroup>', '</colgroup></table>'],
    tr: ['tbody', '<table><tbody>', '</tbody></table>'],
    td: ['tr', '<table><tr>', '</tr></table>']
  };
  WRAP_MAP.caption = WRAP_MAP.colgroup = WRAP_MAP.tbody = WRAP_MAP.tfoot = WRAP_MAP.thead;
  WRAP_MAP.th = WRAP_MAP.td;
  const isArray = obj => {
    return hasIsArray ? Array.isArray(obj) : Object.prototype.toString.call(obj) === '[object Array]';
  };
  const isJsObject = obj => {
    return obj !== null && typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Object]';
  };
  const isPlainObject = obj => {
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
  // test if string contains '{...}'. string must not contains tab, line breaks
  const isObjectLiteralString = (str = '') => {
    return REGEX.OBJECT_LITERAL.test(str);
  };
  const isEmptyObject = obj => {
    if (isJsObject(obj)) {
      return Object.getOwnPropertyNames(obj).length === 0;
    }
    return false;
  };
  const getFirstHtmlStringTag = htmlString => {
    const match = htmlString.match(REGEX.HTML_TAG);
    if (match) {
      return match[1];
    }
    return null;
  };
  const removeBadTags = (htmlString = '') => {
    return htmlString.replace(REGEX.BAD_TAGS, '');
  };
  const createHtmlFragment = htmlString => {
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
  /**
   * List of dangerous property names that should not be accessed
   * to prevent prototype pollution attacks
   */
  const DANGEROUS_PROPS = ['__proto__', 'constructor', 'prototype'];
  /**
   * Check if a property name is safe to access
   */
  const isSafeProperty = prop => {
    return !DANGEROUS_PROPS.includes(prop);
  };
  // simplified version of Lodash _.get with prototype pollution protection
  const _get = (obj, path, def) => {
    const fullPath = path.replace(/\[/g, '.').replace(/]/g, '').split('.').filter(Boolean);
    let current = obj;
    for (const step of fullPath) {
      // Prevent access to dangerous properties
      if (!step || !isSafeProperty(step)) {
        return def;
      }
      if (current == null) {
        return def;
      }
      current = current[step];
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
  const getViewModelValue = (viewModel, prop) => {
    return _get(viewModel, prop);
  };
  // simplified version of Lodash _.set with prototype pollution protection
  // https://stackoverflow.com/questions/54733539/javascript-implementation-of-lodash-set-method
  const _set = (obj, path, value) => {
    if (Object(obj) !== obj) return obj; // When obj is not an object
    // If not yet an array, get the keys from the string-path
    let pathArray;
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
    const target = pathArray.slice(0, -1).reduce((a, c, i) => {
      // Prevent setting dangerous properties
      if (!isSafeProperty(c)) {
        return a;
      }
      if (Object(a[c]) === a[c]) {
        // Key exists and is an object, follow that path
        return a[c];
      }
      // Create the key. Is the next key a potential array-index?
      const nextKey = pathArray[i + 1];
      a[c] = Math.abs(Number(nextKey)) >> 0 === +nextKey ? [] : {};
      return a[c];
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
  const setViewModelValue = (obj, prop, value) => {
    return _set(obj, prop, value);
  };
  const getViewModelPropValue = (viewModel, bindingCache) => {
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
      ret = ret.apply(viewModelContext, args);
    }
    ret = isInvertBoolean ? !ret : ret;
    // call through fitlers to get final value
    ret = filtersViewModelPropValue({
      value: ret,
      viewModel,
      bindingCache
    });
    return ret;
  };
  const filtersViewModelPropValue = ({
    value,
    viewModel,
    bindingCache
  }) => {
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
  const parseStringToJson = str => {
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
    return toArray.filter((value, _index) => {
      return frommArray.indexOf(value) < 0;
    });
  };
  const getFormData = $form => {
    const data = {};
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
  const getFunctionParameterList = str => {
    if (!str || str.length > maxDatakeyLength) {
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
  const extractFilterList = cacheData => {
    if (!cacheData || !cacheData.dataKey || cacheData.dataKey.length > maxDatakeyLength) {
      return cacheData;
    }
    const filterList = cacheData.dataKey.split(REGEX.PIPE);
    let isOnceIndex;
    cacheData.dataKey = filterList[0].trim();
    if (filterList.length > 1) {
      filterList.shift();
      filterList.forEach((v, i) => {
        filterList[i] = v.trim();
        if (filterList[i] === constants.filters.ONCE) {
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
  const invertObj = sourceObj => {
    return Object.keys(sourceObj).reduce((obj, key) => {
      const invertedKey = sourceObj[key];
      // Prevent prototype pollution by checking if the inverted key is safe
      if (typeof invertedKey === 'string' && isSafeProperty(invertedKey)) {
        obj[invertedKey] = key;
      }
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
    return function (fn, ctx) {
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
    }(fn, ctx);
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
      return target || {};
    }
    const source = sources.shift();
    if (source === undefined) {
      return target || {};
    }
    if (!isDeepMerge) {
      return _extends(target || {}, source, ...sources);
    }
    if (isMergebleObject(target) && isMergebleObject(source)) {
      Object.keys(source).forEach(key => {
        if (isMergebleObject(source[key])) {
          if (!target[key]) {
            target[key] = {};
          }
          extend(true, target[key], source[key]);
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
  const isMergebleObject = item => {
    return isJsObject(item) && !isArray(item);
  };
  /**
   * cloneDomNode
   * @param {object} element
   * @return {object} cloned element
   * @description helper function to clone node
   */
  const cloneDomNode = element => {
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
      if (bindingDataContext[0] === bindingDataReference.rootDataKey) {
        ret = viewModel[bindingDataReference.rootDataKey] || viewModel;
      } else if (bindingDataContext[0] === bindingDataReference.currentData) {
        ret = viewModel[bindingDataReference.currentData] || viewModel;
      }
    }
    return ret;
  };
  const resolveParamList = (viewModel, paramList) => {
    if (!viewModel || !isArray(paramList)) {
      return;
    }
    return paramList.map(param => {
      let resolvedParam = param;
      if (typeof param === 'string') {
        resolvedParam = param.trim();
        if (resolvedParam === bindingDataReference.currentIndex) {
          // convert '$index' to value
          resolvedParam = viewModel[bindingDataReference.currentIndex];
        } else if (resolvedParam === bindingDataReference.currentData) {
          // convert '$data' to value or current viewModel
          resolvedParam = viewModel[bindingDataReference.currentData] || viewModel;
        } else if (resolvedParam === bindingDataReference.rootDataKey) {
          // convert '$root' to root viewModel
          resolvedParam = viewModel[bindingDataReference.rootDataKey] || viewModel;
        }
      }
      return resolvedParam;
    });
  };
  const removeElement = el => {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  };
  const emptyElement = node => {
    if (node && node.firstChild) {
      while (node.firstChild) {
        node.removeChild(node.firstChild);
      }
    }
    return node;
  };
  /**
   * areNodesEqual
   * @description Compare two nodes to determine if they are structurally equal
   * @param {Node} node1
   * @param {Node} node2
   * @return {boolean}
   */
  const areNodesEqual = (node1, node2) => {
    // Different node types
    if (node1.nodeType !== node2.nodeType) {
      return false;
    }
    // Text nodes - compare content
    if (node1.nodeType === 3) {
      return node1.nodeValue === node2.nodeValue;
    }
    // Element nodes - compare tag names
    if (node1.nodeType === 1) {
      const el1 = node1;
      const el2 = node2;
      return el1.tagName === el2.tagName;
    }
    // Other node types (comments, etc.)
    return node1.nodeValue === node2.nodeValue;
  };
  /**
   * updateElementAttributes
   * @description Update element attributes to match new element
   * Only updates attributes that are in the new element.
   * Does NOT remove attributes that exist only in the existing element,
   * as these might be runtime-added by the binding system.
   * @param {HTMLElement} existingElement
   * @param {HTMLElement} newElement
   */
  const updateElementAttributes = (existingElement, newElement) => {
    // Get all attributes from new element
    const newAttrs = newElement.attributes;
    const attrsLength = newAttrs.length;
    // Update or add attributes from new element
    for (let i = 0; i < attrsLength; i += 1) {
      const attr = newAttrs[i];
      if (attr && attr.name) {
        const existingValue = existingElement.getAttribute(attr.name);
        if (existingValue !== attr.value) {
          existingElement.setAttribute(attr.name, attr.value || '');
        }
      }
    }
    // NOTE: We deliberately do NOT remove attributes that exist in the existing element
    // but not in the new element. This preserves runtime-added attributes from the binding
    // system (like data-bind-*, data-index, event handlers, etc.)
  };
  /**
   * createFragmentFromChildren
   * @description Create a DocumentFragment from a node's children
   * @param {Node} node
   * @return {DocumentFragment}
   */
  const createFragmentFromChildren = node => {
    const fragment = document.createDocumentFragment();
    const children = Array.from(node.childNodes);
    children.forEach(child => {
      fragment.appendChild(child.cloneNode(true));
    });
    return fragment;
  };
  /**
   * updateDomWithMinimalChanges
   * @description Updates DOM by comparing existing nodes with new fragment
   * Only modifies what changed - performs minimal DOM manipulation
   * @param {HTMLElement} targetElement - The existing DOM element to update
   * @param {DocumentFragment} newFragment - The new content to apply
   */
  const updateDomWithMinimalChanges = (targetElement, newFragment) => {
    const newNodes = Array.from(newFragment.childNodes);
    const existingNodes = Array.from(targetElement.childNodes);
    const newNodesLength = newNodes.length;
    const existingNodesLength = existingNodes.length;
    // Loop through new nodes and compare with existing
    for (let i = 0; i < newNodesLength; i += 1) {
      const newNode = newNodes[i];
      const existingNode = existingNodes[i];
      if (!existingNode) {
        // New node doesn't have a corresponding existing node - append it
        targetElement.appendChild(newNode);
      } else if (!areNodesEqual(existingNode, newNode)) {
        // Nodes are different types or tags - replace entire node
        targetElement.replaceChild(newNode, existingNode);
      } else {
        // Nodes are structurally equal - update content/attributes
        if (newNode.nodeType === 1 && existingNode.nodeType === 1) {
          // Element nodes - update attributes and recurse into children
          updateElementAttributes(existingNode, newNode);
          updateDomWithMinimalChanges(existingNode, createFragmentFromChildren(newNode));
        } else if (newNode.nodeType === 3) {
          // Text nodes - update text content if different
          if (existingNode.nodeValue !== newNode.nodeValue) {
            existingNode.nodeValue = newNode.nodeValue;
          }
        }
      }
    }
    // Remove extra existing nodes that don't have corresponding new nodes
    for (let i = existingNodesLength - 1; i >= newNodesLength; i -= 1) {
      if (existingNodes[i] && existingNodes[i].parentNode) {
        targetElement.removeChild(existingNodes[i]);
      }
    }
  };
  const throwErrorMessage = (err = null, errorMessage = '') => {
    const message = err && typeof err === 'object' && 'message' in err ? err.message : errorMessage;
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
  const parseBindingObjectString = (str = '') => {
    let objectLiteralString = str.trim();
    const ret = {};
    if (!REGEX.OBJECT_LITERAL.test(str)) {
      return null;
    }
    // clearn up line breaks and remove first { character
    objectLiteralString = objectLiteralString.replace(REGEX.LINE_BREAKS_TABS, '').substring(1);
    // remove last } character
    objectLiteralString = objectLiteralString.substring(0, objectLiteralString.length - 1);
    objectLiteralString.split(',').forEach(item => {
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
    let currentNode = node.firstElementChild;
    while (currentNode) {
      parseChildNode = func(currentNode);
      if (parseChildNode) {
        walkDOM(currentNode, func);
      }
      currentNode = currentNode.nextElementSibling;
    }
  };
  const getAttributesObject = node => {
    const ret = {};
    Array.prototype.slice.call(node.attributes).forEach(item => {
      ret[item.name] = item.value;
    });
    return ret;
  };
  const checkSkipChildParseBindings = (attrObj = {}, bindingAttrs) => {
    return [bindingAttrs.forOf, bindingAttrs.if, bindingAttrs.case, bindingAttrs.default].filter(type => {
      return typeof attrObj[type] !== 'undefined';
    });
  };
  const rootSkipCheck = node => {
    return node.tagName === 'SVG';
  };
  const defaultSkipCheck = (node, bindingAttrs) => {
    return node.tagName === 'SVG' || node.hasAttribute(bindingAttrs.comp);
  };
  const populateBindingCache = ({
    node,
    attrObj,
    bindingCache,
    type
  }) => {
    let attrValue;
    let cacheData;
    if (bindingAttrsMap && bindingAttrsMap[type] && typeof attrObj[type] !== 'undefined') {
      bindingCache[type] = bindingCache[type] || [];
      attrValue = attrObj[type] || '';
      if (attrValue) {
        attrValue = attrValue.replace(REGEX.LINE_BREAKS_TABS, '').replace(REGEX.WHITE_SPACES, ' ').trim();
      }
      cacheData = {
        el: node,
        dataKey: attrValue
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
      bindingCache[type].push(cacheData);
    }
    return bindingCache;
  };
  const createBindingCache = ({
    rootNode = null,
    bindingAttrs = {},
    skipCheck,
    isRenderedTemplate = false
  }) => {
    let bindingCache = {};
    if (!(rootNode instanceof window.Node)) {
      throw new TypeError('walkDOM: Expected a DOM node');
    }
    bindingAttrsMap = bindingAttrsMap || invertObj(bindingAttrs);
    const parseNode = (node, skipNodeCheckFn = defaultSkipCheck) => {
      let isSkipForOfChild = false;
      if (node.nodeType !== 1 || !node.hasAttributes()) {
        return true;
      }
      if (skipNodeCheckFn(node, bindingAttrs) || typeof skipCheck === 'function' && skipCheck(node)) {
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
      iterateList.forEach(key => {
        // skip for switch case and default bining
        if (key !== bindingAttrs.case && key !== bindingAttrs.default) {
          bindingCache = populateBindingCache({
            node,
            attrObj,
            bindingCache,
            type: key
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

  /**
   * createBindingOption
   * @param {string} condition
   * @param {object} opt
   * @description
   * generate binding update option object by condition
   * @return {object} updateOption
   */
  const createBindingOption = (condition = '', opt = {}) => {
    const visualBindingOptions = {
      templateBinding: false,
      textBinding: true,
      cssBinding: true,
      ifBinding: true,
      showBinding: true,
      modelBinding: true,
      attrBinding: true,
      forOfBinding: true,
      switchBinding: true
    };
    const eventsBindingOptions = {
      changeBinding: true,
      clickBinding: true,
      dblclickBinding: true,
      blurBinding: true,
      focusBinding: true,
      hoverBinding: true,
      inputBinding: true,
      submitBinding: true
    };
    // this is visualBindingOptions but everything false
    // concrete declear for performance purpose
    const serverRenderedOptions = {
      templateBinding: false,
      textBinding: false,
      cssBinding: false,
      ifBinding: false,
      showBinding: false,
      modelBinding: false,
      attrBinding: false,
      forOfBinding: false,
      switchBinding: false
    };
    let updateOption = {};
    switch (condition) {
      case bindingUpdateConditions.serverRendered:
        updateOption = extend(false, {}, eventsBindingOptions, serverRenderedOptions, opt);
        break;
      case bindingUpdateConditions.init:
        // flag templateBinding to true to render tempalte(s)
        opt.templateBinding = true;
        opt.forceRender = true;
        updateOption = extend(false, {}, visualBindingOptions, eventsBindingOptions, opt);
        break;
      default:
        // when called again only update visualBinding options
        updateOption = extend(false, {}, visualBindingOptions, opt);
    }
    return updateOption;
  };

  /**
   * Create mouse enter handler
   */
  const createMouseEnterHandler = (cache, handlers, inHandlerName, viewModelContext, paramList) => {
    return function onMouseEnterHandler(e) {
      const args = [e, cache.el, ...paramList];
      handlers[inHandlerName].apply(viewModelContext, args);
    };
  };
  /**
   * Create mouse leave handler
   */
  const createMouseLeaveHandler = (cache, handlers, outHandlerName, viewModelContext, paramList) => {
    return function onMouseLeaveHandler(e) {
      const args = [e, cache.el, ...paramList];
      handlers[outHandlerName].apply(viewModelContext, args);
    };
  };
  /**
   * hoverBinding
   * DOM decleartive on hover event binding
   * event handler bind to viewModel method according to the DOM attribute
   * @param {object} cache
   * @param {object} viewModel
   * @param {object} bindingAttrs
   * @param {boolean} forceRender
   */
  const hoverBinding = (cache, viewModel, bindingAttrs, forceRender) => {
    var _a;
    const handlerName = cache.dataKey;
    let paramList = cache.parameters;
    const inHandlerName = bindingDataReference.mouseEnterHandlerName;
    const outHandlerName = bindingDataReference.mouseLeaveHandlerName;
    let viewModelContext;
    const APP = viewModel.APP || ((_a = viewModel.$root) === null || _a === void 0 ? void 0 : _a.APP);
    cache.elementData = cache.elementData || {};
    // TODO: check what is APP.$rootElement.contains(cache.el)
    const rootElement = APP === null || APP === void 0 ? void 0 : APP.$rootElement;
    if (!handlerName || !forceRender && rootElement && !rootElement.contains(cache.el)) {
      return;
    }
    const handlers = getViewModelValue(viewModel, handlerName);
    if (handlers && typeof handlers[inHandlerName] === 'function' && typeof handlers[outHandlerName] === 'function') {
      viewModelContext = resolveViewModelContext(viewModel, handlerName);
      paramList = paramList ? resolveParamList(viewModel, paramList) : [];
      const onMouseEnterHandler = createMouseEnterHandler(cache, handlers, inHandlerName, viewModelContext, paramList);
      const onMouseLeaveHandler = createMouseLeaveHandler(cache, handlers, outHandlerName, viewModelContext, paramList);
      cache.el.removeEventListener('mouseenter', onMouseEnterHandler, false);
      cache.el.removeEventListener('mouseleave', onMouseLeaveHandler, false);
      cache.el.addEventListener('mouseenter', onMouseEnterHandler, false);
      cache.el.addEventListener('mouseleave', onMouseLeaveHandler, false);
    }
  };

  /**
   * _escape
   * @description
   * https://github.com/lodash/lodash/blob/master/escape.js
   */
  const baseToString = value => {
    if (typeof value == 'string') {
      return value;
    }
    return value == null ? '' : `${value}`;
  };
  /** Used to match HTML entities and HTML characters. */
  const reUnescapedHtml = /[&<>"'`]/g;
  const reHasUnescapedHtml = RegExp(reUnescapedHtml.source);
  /** Used to map characters to HTML entities. */
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;',
    '`': '&#96;'
  };
  /**
    * escapeHtmlChar
    * @description convert characters to HTML entities.
    * @private
    * @param {string} chr The matched character to escape.
    * @return {string} Returns the escaped character.
    */
  const escapeHtmlChar = chr => {
    return htmlEscapes[chr];
  };
  /**
   * Converts the characters "&", "<", ">", '"', "'", and "\`", in `string` to
   * their corresponding HTML entities.
   * @param {string} string
   * @return {string} string
   */
  const escape = string => {
    // Reset `lastIndex` because in IE < 9 `String#replace` does not.
    const strValue = baseToString(string);
    return strValue && reHasUnescapedHtml.test(strValue) ? strValue.replace(reUnescapedHtml, escapeHtmlChar) : strValue;
  };

  /**
   * Create change handler
   */
  const createChangeHandler = (viewModel, modelDataKey, paramList, handlerFn, viewModelContext) => {
    let oldValue = '';
    let newValue = '';
    return function changeHandler(e) {
      const $this = this;
      const isCheckbox = $this.type === 'checkbox';
      newValue = isCheckbox ? $this.checked : escape($this.value);
      // set data to viewModel
      if (modelDataKey) {
        oldValue = getViewModelValue(viewModel, modelDataKey);
        setViewModelValue(viewModel, modelDataKey, newValue);
      }
      const args = [e, e.currentTarget, newValue, oldValue, ...paramList];
      handlerFn.apply(viewModelContext, args);
      oldValue = newValue;
    };
  };
  /**
   * changeBinding
   * @description input element on change event binding. DOM -> viewModel update
   * @param {object} cache
   * @param {object} viewModel
   * @param {object} bindingAttrs
   * @param {boolean} forceRender
   */
  const changeBinding = ({
    cache,
    viewModel,
    bindingAttrs,
    forceRender,
    type = 'change'
  }) => {
    var _a;
    const handlerName = cache.dataKey;
    let paramList = cache.parameters;
    const modelDataKey = cache.el.getAttribute(bindingAttrs.model);
    let viewModelContext;
    const APP = viewModel.APP || ((_a = viewModel.$root) === null || _a === void 0 ? void 0 : _a.APP);
    const rootElement = APP === null || APP === void 0 ? void 0 : APP.$rootElement;
    if (!handlerName || !forceRender && rootElement && !rootElement.contains(cache.el)) {
      return;
    }
    const handlerFn = getViewModelValue(viewModel, handlerName);
    if (typeof handlerFn === 'function') {
      viewModelContext = resolveViewModelContext(viewModel, handlerName);
      paramList = paramList ? resolveParamList(viewModel, paramList) : [];
      const changeHandler = createChangeHandler(viewModel, modelDataKey, paramList, handlerFn, viewModelContext);
      // assign on change event
      cache.el.removeEventListener(type, changeHandler, false);
      cache.el.addEventListener(type, changeHandler, false);
    }
  };

  /**
   * modelBinding
   * @description input element data binding. viewModel -> DOM update
   * @param {object} cache
   * @param {object} viewModel
   * @param {object} bindingAttrs
   * @param {boolean} forceRender
   */
  const modelBinding = (cache, viewModel, bindingAttrs, forceRender) => {
    var _a, _b;
    const dataKey = cache.dataKey;
    let newValue = '';
    const APP = viewModel.APP || ((_a = viewModel.$root) === null || _a === void 0 ? void 0 : _a.APP);
    if (!dataKey || !forceRender && !((_b = APP === null || APP === void 0 ? void 0 : APP.$rootElement) === null || _b === void 0 ? void 0 : _b.contains(cache.el))) {
      return;
    }
    newValue = getViewModelValue(viewModel, dataKey);
    if (typeof newValue !== 'undefined' && newValue !== null) {
      const $element = cache.el;
      const isCheckbox = $element.type === 'checkbox';
      const isRadio = $element.type === 'radio';
      const inputName = $element.name;
      const $radioGroup = isRadio ? (APP === null || APP === void 0 ? void 0 : APP.$rootElement).querySelectorAll(`input[name="${inputName}"]`) : [];
      const oldValue = isCheckbox ? $element.checked : $element.value;
      // update element value
      if (newValue !== oldValue) {
        if (isCheckbox) {
          $element.checked = Boolean(newValue);
        } else if (isRadio) {
          let i = 0;
          const radioGroupLength = $radioGroup.length;
          for (i = 0; i < radioGroupLength; i += 1) {
            const radioInput = $radioGroup[i];
            if (radioInput.value === newValue) {
              radioInput.checked = true;
              break;
            }
          }
        } else {
          $element.value = String(newValue);
        }
      }
    }
  };

  /**
   * textBinding
   * * @description
   * DOM decleartive text binding update dom textnode with viewModel data
   * @param {object} cache
   * @param {object} viewModel
   * @param {object} bindingAttrs
   * @param {boolean} forceRender
   */
  const textBinding = (cache, viewModel, bindingAttrs, forceRender) => {
    var _a, _b;
    const dataKey = cache.dataKey;
    const APP = viewModel.APP || ((_a = viewModel.$root) === null || _a === void 0 ? void 0 : _a.APP);
    // NOTE: this doesn't work for for-of, if and switch bindings because element was not in DOM
    if (!dataKey || !forceRender && !((_b = APP === null || APP === void 0 ? void 0 : APP.$rootElement) === null || _b === void 0 ? void 0 : _b.contains(cache.el))) {
      return;
    }
    const newValue = getViewModelPropValue(viewModel, cache);
    const oldValue = cache.el.textContent;
    if (typeof newValue !== 'undefined' && typeof newValue !== 'object' && newValue !== null) {
      if (newValue !== oldValue) {
        cache.el.textContent = String(newValue);
      }
    }
  };

  /**
   * showBinding
   * @description
   * DOM decleartive show binding. Make binding show/hide according to viewModel data (boolean)
   * viewModel data can function but must return boolean
   * @param {object} cache
   * @param {object} viewModel
   * @param {object} bindingAttrs
   */
  const showBinding = (cache, viewModel, _bindingAttrs, _forceRender) => {
    const dataKey = cache.dataKey;
    let currentInlineSytle = {};
    let currentInlineDisplaySytle = '';
    let shouldShow = true;
    if (!dataKey) {
      return;
    }
    cache.elementData = cache.elementData || {};
    const oldShowStatus = cache.elementData.viewModelPropValue;
    // store current element display default style once only
    if (typeof cache.elementData.displayStyle === 'undefined' || typeof cache.elementData.computedStyle === 'undefined') {
      currentInlineSytle = cache.el.style;
      currentInlineDisplaySytle = currentInlineSytle.display;
      // use current inline style if defined
      if (currentInlineDisplaySytle) {
        // set to 'block' if is 'none'
        cache.elementData.displayStyle = currentInlineDisplaySytle === 'none' ? 'block' : currentInlineDisplaySytle;
        cache.elementData.computedStyle = null;
      } else {
        const computeStyle = window.getComputedStyle(cache.el, null).getPropertyValue('display');
        cache.elementData.displayStyle = null;
        cache.elementData.computedStyle = computeStyle;
      }
    }
    shouldShow = getViewModelPropValue(viewModel, cache);
    // treat undefined || null as false.
    // eg if property doesn't exsits in viewModel, it will treat as false to hide element
    shouldShow = Boolean(shouldShow);
    // reject if nothing changed
    if (oldShowStatus === shouldShow) {
      return;
    }
    if (!shouldShow) {
      if (cache.el.style.display !== 'none') {
        cache.el.style.setProperty('display', 'none');
      }
    } else {
      if (cache.elementData.computedStyle || cache.el.style.display === 'none') {
        if (cache.elementData.computedStyle === 'none') {
          // default display is none in css rule, so use display 'block'
          cache.el.style.setProperty('display', 'block');
        } else {
          // has default displayable type so just remove inline display 'none'
          if (currentInlineSytle.length > 1) {
            cache.el.style.removeProperty('display');
          } else {
            cache.el.removeAttribute('style');
          }
        }
      } else {
        // element default display was inline style, so restore it
        cache.el.style.setProperty('display', cache.elementData.displayStyle);
      }
    }
    // store new show status
    cache.elementData.viewModelPropValue = shouldShow;
  };

  /**
   * cssBinding
   * @description
   * DOM decleartive css binding. update classlist.
   * viewModel data can function but must return JSOL.
   * added css class if value is true
   * @param {object} cache
   * @param {object} viewModel
   * @param {object} bindingAttrs
   * @param {boolean} forceRender
   */
  const cssBinding = (cache, viewModel, bindingAttrs, forceRender) => {
    var _a, _b;
    const dataKey = cache.dataKey;
    const APP = viewModel.APP || ((_a = viewModel.$root) === null || _a === void 0 ? void 0 : _a.APP);
    if (!dataKey || !forceRender && !((_b = APP === null || APP === void 0 ? void 0 : APP.$rootElement) === null || _b === void 0 ? void 0 : _b.contains(cache.el))) {
      return;
    }
    cache.elementData = cache.elementData || {};
    cache.elementData.viewModelPropValue = cache.elementData.viewModelPropValue || '';
    const oldCssList = cache.elementData.viewModelPropValue;
    let newCssList = '';
    const vmCssListObj = getViewModelPropValue(viewModel, cache);
    let vmCssListArray = [];
    let isViewDataObject = false;
    let isViewDataString = false;
    let cssList = [];
    if (typeof vmCssListObj === 'string') {
      isViewDataString = true;
    } else if (isPlainObject(vmCssListObj)) {
      isViewDataObject = true;
    } else {
      // reject if vmCssListObj is not an object or string
      return;
    }
    if (isViewDataObject) {
      newCssList = JSON.stringify(vmCssListObj);
    } else {
      newCssList = vmCssListObj.replace(/\s\s+/g, ' ').trim();
      vmCssListArray = newCssList.split(' ');
    }
    // reject if nothing changed
    if (oldCssList === newCssList) {
      return;
    }
    // get current css classes from element
    const domCssList = cache.el.classList;
    // clone domCssList as new array
    const domCssListLength = domCssList.length;
    for (let i = 0; i < domCssListLength; i += 1) {
      cssList.push(domCssList[i]);
    }
    if (isViewDataObject) {
      each(vmCssListObj, (k, v) => {
        const i = cssList.indexOf(k);
        if (v === true) {
          cssList.push(k);
        } else if (i !== -1) {
          cssList.splice(i, 1);
        }
      });
    } else if (isViewDataString) {
      // remove oldCssList items from cssList
      const oldCssArray = typeof oldCssList === 'string' && oldCssList ? oldCssList.split(' ') : [];
      cssList = arrayRemoveMatch(cssList, oldCssArray);
      cssList = cssList.concat(vmCssListArray);
    }
    // unique cssList array
    cssList = cssList.filter((v, i, a) => {
      return a.indexOf(v) === i;
    });
    const cssListString = cssList.join(' ');
    // update element data
    cache.elementData.viewModelPropValue = newCssList;
    // replace all css classes
    cache.el.setAttribute('class', cssListString);
  };

  /**
   * attrBinding
   * @description
   * DOM decleartive attr binding. update elenment attributes
   * @param {object} cache
   * @param {object} viewModel
   * @param {object} bindingAttrs
   */
  const attrBinding = (cache = {}, viewModel, _bindingAttrs, _forceRender) => {
    if (!cache.dataKey) {
      return;
    }
    // check if Object Literal String style dataKey
    const isObjLiteralStr = isObjectLiteralString(cache.dataKey);
    // resolve vmAttrObj, when Object Literal String style if will be object without resolve each value
    // otherwise, resolve value from viewModel
    const vmAttrObj = isObjLiteralStr ? parseBindingObjectString(cache.dataKey) : getViewModelPropValue(viewModel, cache);
    // vmAttrObj must be a plain object
    if (!isPlainObject(vmAttrObj)) {
      return;
    }
    // populate cache.elementData if not exits
    // check and set default cache.elementData.viewModelPropValue
    cache.elementData = cache.elementData || {};
    cache.elementData.viewModelPropValue = cache.elementData.viewModelPropValue || {};
    // start diff comparison
    // reject if nothing changed by comparing
    // cache.elementData.viewModelPropValue (previous render) vs vmAttrObj(current render)
    if (JSON.stringify(cache.elementData.viewModelPropValue) === JSON.stringify(vmAttrObj)) {
      return;
    }
    if (isObjLiteralStr) {
      // resolve each value in vmAttrObj
      each(vmAttrObj, (key, value) => {
        // resolve value from viewModel including $data and $root
        // from viewModel.$data or viewModel.$root
        vmAttrObj[key] = getViewModelPropValue(viewModel, {
          dataKey: value,
          el: cache.el
        });
      });
    }
    // shortcut for reading cache.elementData.viewModelPropValue
    const oldAttrObj = cache.elementData.viewModelPropValue;
    // start set element attribute - oldAttrObj is empty meaning no previous render
    if (isEmptyObject(oldAttrObj)) {
      each(vmAttrObj, (key, value) => {
        if (typeof value !== 'undefined') {
          cache.el.setAttribute(key, String(value));
          // populate cache.elementData.viewModelPropValue for future comparison
          if (!isObjLiteralStr && cache.elementData) {
            cache.elementData.viewModelPropValue[key] = value;
          }
        }
      });
    } else {
      // loop oldAttrObj, remove attribute not present in current vmAttrObj
      each(oldAttrObj, (key, _value) => {
        if (typeof vmAttrObj[key] === 'undefined') {
          cache.el.removeAttribute(key);
        }
      });
      // loop vmAttrObj, set attribute not present in oldAttrObj
      each(vmAttrObj, (key, value) => {
        if (typeof value !== 'undefined') {
          if (oldAttrObj[key] !== vmAttrObj[key]) {
            cache.el.setAttribute(key, String(vmAttrObj[key]));
            // populate cache.elementData.viewModelPropValue for future comparison
            if (!isObjLiteralStr && cache.elementData) {
              cache.elementData.viewModelPropValue[key] = value;
            }
          }
        }
      });
    }
    // for object literal style binding
    // set viewModelPropValue for future diff comaprison
    // note: vmAttrObj is a not fully resolve object, each value is still string unresloved
    if (isObjLiteralStr) {
      cache.elementData.viewModelPropValue = extend(false, {}, vmAttrObj);
    }
  };

  let $domFragment = null;
  let $templateRoot = null;
  let $templateRootPrepend = false;
  let $templateRootAppend = false;
  let nestTemplatesCount = 0;
  /**
   * getTemplateString
   * @description get Template tag innerHTML string
   * @param {string} id
   * @return {string} rendered html string
   */
  const getTemplateString = id => {
    const templateElement = document.getElementById(id);
    return templateElement ? templateElement.innerHTML : '';
  };
  /**
   * renderTemplate
   * @description
   * get template setting from DOM attribute then call compileTemplate
   * to render and append to target DOM
   * @param {object} cache
   * @param {object} viewModel
   * @param {object} bindingAttrs
   * @param {object} elementCache
   */
  const renderTemplate = (cache, viewModel, bindingAttrs, elementCache) => {
    const settings = typeof cache.dataKey === 'string' ? parseStringToJson(cache.dataKey) : cache.dataKey;
    let viewData = settings.data;
    const isAppend = settings.append;
    const isPrepend = settings.prepend;
    let $currentElement;
    cache.dataKey = settings;
    viewData = typeof viewData === 'undefined' || viewData === '$root' ? viewModel : getViewModelPropValue(viewModel, {
      dataKey: settings.data,
      parameters: cache.parameters
    });
    if (!viewData) {
      return;
    }
    const $element = cache.el;
    const $indexAttr = $element.getAttribute(dataIndexAttr);
    const $index = typeof viewModel.$index !== 'undefined' ? viewModel.$index : $indexAttr ? parseInt($indexAttr, 10) : undefined;
    if (typeof $index !== 'undefined' && viewData && typeof viewData === 'object') {
      viewData.$index = $index;
    }
    $domFragment = $domFragment || document.createDocumentFragment();
    if (!$templateRoot) {
      $templateRoot = $element;
      // Store the prepend/append flags from the root template only
      $templateRootPrepend = Boolean(isPrepend);
      $templateRootAppend = Boolean(isAppend);
    }
    const htmlString = getTemplateString(settings.id);
    const htmlFragment = createHtmlFragment(htmlString);
    // Return early if htmlFragment is null (invalid template)
    if (!htmlFragment) {
      return;
    }
    // append rendered html
    if (!$domFragment.childNodes.length) {
      // domFragment should be empty in first run
      $currentElement = $domFragment; // copy of $domFragment for later find nested template check
      $domFragment.appendChild(htmlFragment);
    } else {
      // during recursive run keep append to current fragment
      // For nested templates, use the original behavior (clear and append)
      // because they may contain forOf bindings or other dynamic content
      // that manages its own DOM structure
      $currentElement = $element; // reset to current nested template element
      if (!isAppend && !isPrepend) {
        $currentElement = emptyElement($currentElement);
      }
      if (isPrepend) {
        $currentElement.insertBefore(htmlFragment, $currentElement.firstChild);
      } else {
        $currentElement.appendChild(htmlFragment);
      }
    }
    // check if there are nested template then recurisive render them
    const $nestedTemplates = $currentElement.querySelectorAll(`[${bindingAttrs.tmp}]`);
    const nestedTemplatesLength = $nestedTemplates.length;
    if (nestedTemplatesLength) {
      nestTemplatesCount += nestedTemplatesLength;
      for (let i = 0; i < nestedTemplatesLength; i += 1) {
        const thisTemplateCache = {
          el: $nestedTemplates[i],
          dataKey: $nestedTemplates[i].getAttribute(bindingAttrs.tmp)
        };
        elementCache[bindingAttrs.tmp].push(thisTemplateCache);
        // recursive template render
        renderTemplate(thisTemplateCache, viewModel, bindingAttrs, elementCache);
        nestTemplatesCount -= 1;
      }
    }
    // no more nested tempalted to render, start to append $domFragment into $templateRoot
    if (nestTemplatesCount === 0) {
      // append to DOM once
      // Use the prepend/append flags from the root template, not the current nested template
      if (!$templateRootAppend && !$templateRootPrepend) {
        // Check if this is a re-render by looking for a marker attribute
        // This is more reliable than checking childNodes.length because templates
        // may have placeholder content
        const isRerender = $templateRoot.hasAttribute('data-template-rendered');
        if (isRerender) {
          // Re-render: Use minimal DOM updates to preserve unchanged elements
          // This is faster and preserves DOM state (focus, scroll, animations)
          updateDomWithMinimalChanges($templateRoot, $domFragment);
        } else {
          // Initial render: Clear any placeholder content and render fresh
          $templateRoot = emptyElement($templateRoot);
          $templateRoot.appendChild($domFragment);
          // Mark this template as rendered for future re-renders
          $templateRoot.setAttribute('data-template-rendered', 'true');
        }
      } else {
        // For prepend/append modes, use the original behavior
        if ($templateRootPrepend) {
          $templateRoot.insertBefore($domFragment, $templateRoot.firstChild);
        } else {
          $templateRoot.appendChild($domFragment);
        }
      }
      // clear cached fragment and flags
      $domFragment = $templateRoot = null;
      $templateRootPrepend = $templateRootAppend = false;
      // trigger callback if provided
      if (viewModel.afterTemplateRender && typeof viewModel.afterTemplateRender === 'function') {
        viewModel.afterTemplateRender(viewData);
      }
    }
  };

  const renderTemplatesBinding = ({
    ctx,
    elementCache,
    updateOption,
    bindingAttrs,
    viewModel
  }) => {
    if (!elementCache || !bindingAttrs) {
      return false;
    }
    // render and apply binding to template(s) and forOf DOM
    if (elementCache[bindingAttrs.tmp] && elementCache[bindingAttrs.tmp].length) {
      // when re-render call with {templateBinding: true}
      // template and nested templates
      if (updateOption.templateBinding) {
        // overwrite updateOption with 'init' bindingUpdateConditions
        updateOption = createBindingOption(bindingUpdateConditions.init);
        // forEach is correct here - nested templates are added to array but rendered recursively
        // We don't want the loop to re-render templates that were already rendered via recursion
        elementCache[bindingAttrs.tmp].forEach($element => {
          renderTemplate($element, viewModel, bindingAttrs, elementCache);
        });
        // update cache after all template(s) rendered
        ctx.updateElementCache({
          templateCache: true,
          elementCache,
          isRenderedTemplates: true
        });
      }
      // enforce render even element is not in DOM tree
      updateOption.forceRender = true;
      // apply bindings to rendered templates element
      // Use namespace import to access the function at runtime,
      // which breaks the circular dependency during module initialization
      // Use for loop to handle templates added during rendering
      for (let i = 0; i < elementCache[bindingAttrs.tmp].length; i++) {
        applyBinding({
          ctx,
          elementCache: elementCache[bindingAttrs.tmp][i].bindingCache,
          updateOption,
          bindingAttrs,
          viewModel
        });
      }
    }
    return true;
  };

  /**
   * renderIteration
   * @param {object} opt
   * @description
   * render element's binding by supplied elementCache
   * This function is desidned for FoOf, If, switch bindings
   */
  const renderIteration = ({
    elementCache,
    iterationVm,
    bindingAttrs,
    isRegenerate
  }) => {
    const bindingUpdateOption = isRegenerate ? createBindingOption(bindingUpdateConditions.init) : createBindingOption();
    // enforce render even element is not in DOM tree
    bindingUpdateOption.forceRender = true;
    // render and apply binding to template(s)
    // this is an share function therefore passing current APP 'this' context
    // viewModel is a dynamic generated iterationVm
    renderTemplatesBinding({
      ctx: iterationVm.$root ? iterationVm.$root.APP : iterationVm.APP,
      elementCache,
      updateOption: bindingUpdateOption,
      bindingAttrs,
      viewModel: iterationVm
    });
    // Use namespace import to access the function at runtime,
    // which breaks the circular dependency during module initialization
    applyBinding({
      ctx: iterationVm.$root ? iterationVm.$root.APP : iterationVm.APP,
      elementCache,
      updateOption: bindingUpdateOption,
      bindingAttrs,
      viewModel: iterationVm
    });
  };

  const createClonedElementCache = bindingData => {
    const clonedElement = bindingData.el.cloneNode(true);
    bindingData.fragment = document.createDocumentFragment();
    bindingData.fragment.appendChild(clonedElement);
    return bindingData;
  };
  const setCommentPrefix = bindingData => {
    if (!bindingData || !bindingData.type) {
      return bindingData;
    }
    let commentPrefix$1 = '';
    const dataKeyMarker = bindingData.dataKey ? bindingData.dataKey.replace(REGEX.WHITE_SPACES, '_') : '';
    switch (bindingData.type) {
      case bindingAttrs$1.forOf:
        commentPrefix$1 = commentPrefix.forOf;
        break;
      case bindingAttrs$1.if:
        commentPrefix$1 = commentPrefix.if;
        break;
      case bindingAttrs$1.case:
        commentPrefix$1 = commentPrefix.case;
        break;
      case bindingAttrs$1.default:
        commentPrefix$1 = commentPrefix.default;
        break;
    }
    bindingData.commentPrefix = commentPrefix$1 + dataKeyMarker;
    return bindingData;
  };
  /**
   * setDocRangeEndAfter
   * @param {object} node
   * @param {object} bindingData
   * @description
   * recursive execution to find last wrapping comment node
   * and set as bindingData.docRange.setEndAfter
   * if not found deleteContents will has no operation
   * @return {undefined}
   */
  const setDocRangeEndAfter = (node, bindingData) => {
    if (!bindingData.commentPrefix) {
      setCommentPrefix(bindingData);
    }
    const startTextContent = bindingData.commentPrefix;
    const endTextContent = startTextContent + commentSuffix;
    node = node.nextSibling;
    // check last wrap comment node
    if (node) {
      if (node.nodeType === 8 && node.textContent === endTextContent) {
        return bindingData.docRange.setEndBefore(node);
      }
      setDocRangeEndAfter(node, bindingData);
    }
  };
  /**
   * wrapCommentAround
   * @param {object} bindingData
   * @param {Node} node
   * @return {object} DOM fragment
   * @description
   * wrap frament with comment node
   */
  const wrapCommentAround = (bindingData, node) => {
    let prefix = '';
    if (!bindingData.commentPrefix) {
      setCommentPrefix(bindingData);
    }
    prefix = bindingData.commentPrefix;
    const commentBegin = document.createComment(prefix);
    const commentEnd = document.createComment(prefix + commentSuffix);
    // document fragment - logic for ForOf binding
    // check node.parentNode because node could be from cache and no longer in DOM
    if (node.nodeType === 11) {
      node.insertBefore(commentBegin, node.firstChild);
      node.appendChild(commentEnd);
    } else if (node.parentNode) {
      node.parentNode.insertBefore(commentBegin, node);
      insertAfter(node.parentNode, commentEnd, node);
      // update bindingData details
      bindingData.previousNonTemplateElement = node.previousSibling;
      bindingData.nextNonTemplateElement = node.nextSibling;
      bindingData.parentElement = node.previousSibling.parentElement;
    }
    return node;
  };
  /**
   * removeElemnetsByCommentWrap
   * @param {object} bindingData
   * @return {undefined}
   * @description remove elments by range
   */
  const removeElemnetsByCommentWrap = bindingData => {
    if (!bindingData.docRange) {
      bindingData.docRange = document.createRange();
    }
    const docRange = bindingData.docRange;
    try {
      if (bindingData.previousNonTemplateElement) {
        // update docRange start and end match the wrapped comment node
        docRange.setStartBefore(bindingData.previousNonTemplateElement.nextSibling);
        setDocRangeEndAfter(bindingData.previousNonTemplateElement.nextSibling, bindingData);
      } else {
        // insert before next non template element
        docRange.setStartBefore(bindingData.parentElement.firstChild);
        setDocRangeEndAfter(bindingData.parentElement.firstChild, bindingData);
      }
    } catch (err) {
      console.log('error removeElemnetsByCommentWrap: ', err instanceof Error ? err.message : String(err));
    }
    docRange.deleteContents();
  };
  const insertRenderedElements = (bindingData, fragment) => {
    // insert rendered fragment after the previousNonTemplateElement
    if (bindingData.previousNonTemplateElement) {
      insertAfter(bindingData.parentElement, fragment, bindingData.previousNonTemplateElement);
    } else {
      // insert before next non template element
      if (bindingData.nextNonTemplateElement) {
        bindingData.parentElement.insertBefore(fragment, bindingData.nextNonTemplateElement);
      } else if (bindingData.parentElement) {
        // insert from parent
        bindingData.parentElement.appendChild(fragment);
      }
    }
  };

  const renderForOfBinding = ({
    bindingData,
    viewModel,
    bindingAttrs
  }) => {
    var _a;
    if (!bindingData || !viewModel || !bindingAttrs) {
      return;
    }
    let keys;
    let iterationDataLength;
    // FIX: Use bindingData.iterator instead of bindingData to get the iteration data
    // The iterator object has the dataKey pointing to the array/object to iterate over
    const iterationData = getViewModelPropValue(viewModel, bindingData.iterator);
    let isRegenerate = false;
    // check iterationData and set iterationDataLength
    if (isArray(iterationData)) {
      iterationDataLength = iterationData.length;
    } else if (isPlainObject(iterationData)) {
      keys = Object.keys(iterationData);
      iterationDataLength = keys.length;
    } else {
      // throw error but let script contince to run
      return throwErrorMessage(null, 'iterationData is not an plain object or array');
    }
    // flag as pared for-of logic with bindingData.type
    if (!bindingData.type) {
      bindingData.type = bindingAttrs$1.forOf;
      wrapCommentAround(bindingData, bindingData.el);
    }
    // assign forOf internal id to bindingData once
    if (typeof bindingData.iterationSize === 'undefined') {
      // store iterationDataLength
      bindingData.iterationSize = iterationDataLength;
      // remove orignal node for-of attributes
      bindingData.el.removeAttribute(bindingAttrs.forOf);
      isRegenerate = true;
    } else {
      // only regenerate cache if iterationDataLength changed
      isRegenerate = bindingData.iterationSize !== iterationDataLength;
      // update iterationSize
      bindingData.iterationSize = iterationDataLength;
    }
    if (!isRegenerate) {
      (_a = bindingData.iterationBindingCache) === null || _a === void 0 ? void 0 : _a.forEach((elementCache, i) => {
        if (!isEmptyObject(elementCache)) {
          const iterationVm = createIterationViewModel({
            bindingData,
            viewModel,
            iterationData,
            keys,
            index: i
          });
          renderIteration({
            elementCache,
            iterationVm,
            bindingAttrs,
            isRegenerate: false
          });
        }
      });
      return;
    }
    // generate forOfBinding elements into fragment
    const fragment = generateForOfElements(bindingData, viewModel, bindingAttrs, iterationData, keys);
    removeElemnetsByCommentWrap(bindingData);
    // insert fragment content into DOM
    return insertRenderedElements(bindingData, fragment);
  };
  /**
   * createIterationViewModel
   * @description
   * create an virtual viewModel for render binding while in loop iteration
   * $data is the current data in the loop eg. data in array
   * $root is point to top level viewModel
   * $index is the current loop index
   * @param {*} param0
   * @return {object} virtual viewModel
   */
  const createIterationViewModel = ({
    bindingData,
    viewModel,
    iterationData,
    keys,
    index
  }) => {
    var _a;
    const iterationVm = {};
    const alias = (_a = bindingData.iterator) === null || _a === void 0 ? void 0 : _a.alias;
    if (alias) {
      iterationVm[alias] = keys ? iterationData[keys[index]] : iterationData[index];
    }
    // populate common binding data reference
    iterationVm[bindingDataReference.rootDataKey] = viewModel.$root || viewModel;
    iterationVm[bindingDataReference.currentData] = alias ? iterationVm[alias] : undefined;
    iterationVm[bindingDataReference.currentIndex] = index;
    return iterationVm;
  };
  const generateForOfElements = (bindingData, viewModel, bindingAttrs, iterationData, keys) => {
    const fragment = document.createDocumentFragment();
    const iterationDataLength = bindingData.iterationSize;
    let clonedItem;
    let iterationVm;
    let iterationBindingCache;
    let i = 0;
    // create or clear exisitng iterationBindingCache
    if (isArray(bindingData.iterationBindingCache)) {
      bindingData.iterationBindingCache.length = 0;
    } else {
      bindingData.iterationBindingCache = [];
    }
    // generate forOf and append to DOM
    for (i = 0; i < iterationDataLength; i += 1) {
      clonedItem = cloneDomNode(bindingData.el);
      // create bindingCache per iteration
      iterationBindingCache = createBindingCache({
        rootNode: clonedItem,
        bindingAttrs
      });
      bindingData.iterationBindingCache.push(iterationBindingCache);
      if (!isEmptyObject(iterationBindingCache)) {
        // create an iterationVm match iterator alias
        iterationVm = createIterationViewModel({
          bindingData,
          viewModel,
          iterationData,
          keys,
          index: i
        });
        renderIteration({
          elementCache: bindingData.iterationBindingCache[i],
          iterationVm,
          bindingAttrs,
          isRegenerate: true
        });
      }
      fragment.appendChild(clonedItem);
    }
    return fragment;
  };

  /**
   * forOfBinding
   * @description
   * DOM decleartive for binding.
   * @param {object} cache
   * @param {object} viewModel
   * @param {object} bindingAttrs
   */
  const forOfBinding = (cache, viewModel, bindingAttrs, _forceRender) => {
    const dataKey = cache.dataKey;
    if (!dataKey || dataKey.length > maxDatakeyLength) {
      return;
    }
    if (!cache.iterator) {
      if (dataKey.length > maxDatakeyLength) {
        return;
      }
      // replace mess spaces with single space
      cache.dataKey = cache.dataKey.replace(REGEX.WHITE_SPACES, ' ');
      const forExpMatch = dataKey.match(REGEX.FOR_OF);
      if (!forExpMatch) {
        return;
      }
      cache.iterator = {};
      cache.iterator.alias = forExpMatch[1].trim();
      if (forExpMatch[2]) {
        cache.iterator.dataKey = forExpMatch[2].trim();
        cache.parentElement = cache.el.parentElement;
        cache.previousNonTemplateElement = cache.el.previousSibling;
        cache.nextNonTemplateElement = cache.el.nextSibling;
      }
    }
    renderForOfBinding({
      bindingData: cache,
      viewModel,
      bindingAttrs
    });
  };

  /**
   * isTargetDomRemoved
   * @description check if DOM between 'start' and 'end' comment tag has been removed
   * @param {object} bindingData
   * @return {boolean}
   */
  const isTargetDomRemoved = bindingData => {
    let ret = false;
    if (bindingData && bindingData.previousNonTemplateElement) {
      const commentStartTextContent = bindingData.previousNonTemplateElement.textContent;
      const endCommentTag = bindingData.previousNonTemplateElement.nextSibling;
      if (endCommentTag && endCommentTag.nodeType === 8) {
        if (endCommentTag.textContent === commentStartTextContent + commentSuffix) {
          ret = true;
        }
      }
    }
    return ret;
  };
  /**
   * removeIfBinding
   * @description remove if binding DOM and clean up cache
   * @param {object} bindingData
   */
  const removeIfBinding = bindingData => {
    removeElemnetsByCommentWrap(bindingData);
    // remove cache.IterationBindingCache to prevent memory leak
    if (bindingData.hasIterationBindingCache) {
      delete bindingData.iterationBindingCache;
      delete bindingData.hasIterationBindingCache;
    }
  };
  /**
   * renderIfBinding
   * @description render if binding DOM
   * @param {object} bindingData
   * @param {object} viewModel
   * @param {object} bindingAttrs
   */
  const renderIfBinding = ({
    bindingData,
    viewModel,
    bindingAttrs
  }) => {
    if (!bindingData.fragment) {
      return;
    }
    const isDomRemoved = isTargetDomRemoved(bindingData);
    let rootElement = bindingData.el;
    // remove current old DOM.
    // TODO: try preserve DOM
    if (!isDomRemoved && !bindingData.isOnce) {
      removeIfBinding(bindingData);
      // use fragment for create iterationBindingCache
      const firstChild = bindingData.fragment.firstChild;
      if (firstChild) {
        rootElement = firstChild.cloneNode(true);
      }
    }
    // walk clonedElement to create iterationBindingCache once
    if (!bindingData.iterationBindingCache || !bindingData.hasIterationBindingCache) {
      bindingData.iterationBindingCache = createBindingCache({
        rootNode: rootElement,
        bindingAttrs
      });
    }
    // only render if has iterationBindingCache
    // means has other dataBindings to be render
    if (!isEmptyObject(bindingData.iterationBindingCache)) {
      bindingData.hasIterationBindingCache = true;
      renderIteration({
        elementCache: bindingData.iterationBindingCache,
        iterationVm: viewModel,
        bindingAttrs,
        isRegenerate: true
      });
    }
    // insert to new rendered DOM
    // TODO: check unnecessary insertion when DOM is preserved
    insertRenderedElements(bindingData, rootElement);
  };

  /**
   * if-Binding
   * @description
   * DOM decleartive for binding.
   * @param {object} cache
   * @param {object} viewModel
   * @param {object} bindingAttrs
   */
  const ifBinding = (cache, viewModel, bindingAttrs, _forceRender) => {
    const dataKey = cache.dataKey;
    // isOnce only return if there is no child bindings
    if (!dataKey || cache.isOnce && cache.hasIterationBindingCache === false) {
      return;
    }
    cache.elementData = cache.elementData || {};
    cache.type = cache.type || bindingAttrs$1.if;
    const oldViewModelProValue = cache.elementData.viewModelPropValue;
    // getViewModelPropValue could be return undefined or null
    const viewModelPropValue = getViewModelPropValue(viewModel, cache) || false;
    // do nothing if viewModel value not changed and no child bindings
    if (oldViewModelProValue === viewModelPropValue && !cache.hasIterationBindingCache) {
      return;
    }
    const shouldRender = Boolean(viewModelPropValue);
    // remove this cache from parent array
    if (!shouldRender && cache.isOnce && cache.el.parentNode) {
      removeElement(cache.el);
      // delete cache.fragment;
      removeBindingInQueue({
        viewModel,
        cache
      });
      return;
    }
    // store new show status
    cache.elementData.viewModelPropValue = viewModelPropValue;
    // only create fragment once
    // wrap comment tag around
    // remove if attribute from original element to allow later dataBind parsing
    if (!cache.fragment) {
      wrapCommentAround(cache, cache.el);
      cache.el.removeAttribute(bindingAttrs.if);
      createClonedElementCache(cache);
    }
    if (!shouldRender) {
      // remove element
      removeIfBinding(cache);
    } else {
      // render element
      renderIfBinding({
        bindingData: cache,
        viewModel,
        bindingAttrs
      });
      // if render once
      // remove this cache from parent array if no child caches
      if (cache.isOnce && !cache.hasIterationBindingCache) {
        // delete cache.fragment;
        removeBindingInQueue({
          viewModel,
          cache
        });
      }
    }
  };
  const removeBindingInQueue = ({
    viewModel,
    cache
  }) => {
    var _a;
    let ret = false;
    if ((_a = viewModel.APP) === null || _a === void 0 ? void 0 : _a.postProcessQueue) {
      const parentRef = cache[constants.PARENT_REF];
      viewModel.APP.postProcessQueue.push(((cache, index) => () => {
        parentRef.splice(index, 1);
      })(cache, parentRef.indexOf(cache)));
      ret = true;
    }
    return ret;
  };

  /**
   * switch-Binding
   * @description
   * DOM decleartive switch binding.
   * switch parent element wrap direct child with case bindings
   * @param {object} cache
   * @param {object} viewModel
   * @param {object} bindingAttrs
   */
  const switchBinding = (cache, viewModel, bindingAttrs, _forceRender) => {
    const dataKey = cache.dataKey;
    if (!dataKey) {
      return;
    }
    cache.elementData = cache.elementData || {};
    const newExpression = getViewModelPropValue(viewModel, cache);
    if (newExpression === cache.elementData.viewModelPropValue) {
      return;
    }
    cache.elementData.viewModelPropValue = newExpression;
    // build switch cases if not yet defined
    if (!cache.cases) {
      const childrenElements = cache.el.children;
      if (!childrenElements.length) {
        return;
      }
      cache.cases = [];
      for (let i = 0, elementLength = childrenElements.length; i < elementLength; i += 1) {
        let caseData = null;
        const childElement = childrenElements[i];
        if (childElement.hasAttribute(bindingAttrs.case)) {
          caseData = createCaseData(childElement, bindingAttrs.case);
        } else if (childElement.hasAttribute(bindingAttrs.default)) {
          caseData = createCaseData(childElement, bindingAttrs.default);
          caseData.isDefault = true;
        }
        // create fragment by clone node
        // wrap with comment tag
        if (caseData) {
          wrapCommentAround(caseData, caseData.el);
          // remove binding attribute for later dataBind parse
          if (caseData.isDefault) {
            caseData.el.removeAttribute(bindingAttrs.default);
          } else {
            caseData.el.removeAttribute(bindingAttrs.case);
          }
          createClonedElementCache(caseData);
          cache.cases.push(caseData);
        }
      }
    }
    if (cache.cases.length) {
      let hasMatch = false;
      // do switch operation - reuse if binding logic
      for (let j = 0, casesLength = cache.cases.length; j < casesLength; j += 1) {
        let newCaseValue;
        if (cache.cases[j].dataKey) {
          // set back to dataKey if nothing found in viewModel
          newCaseValue = getViewModelPropValue(viewModel, cache.cases[j]) || cache.cases[j].dataKey;
        }
        if (newCaseValue === cache.elementData.viewModelPropValue || cache.cases[j].isDefault) {
          hasMatch = true;
          // render element
          renderIfBinding({
            bindingData: cache.cases[j],
            viewModel,
            bindingAttrs
          });
          // remove other elements
          removeUnmatchCases(cache.cases, j);
          break;
        }
      }
      // no match remove all cases
      if (!hasMatch) {
        removeUnmatchCases(cache.cases);
      }
    }
  };
  const removeUnmatchCases = (cases, matchedIndex) => {
    cases.forEach((caseData, index) => {
      if (index !== matchedIndex || typeof matchedIndex === 'undefined') {
        removeIfBinding(caseData);
        // remove cache.IterationBindingCache to prevent memory leak
        if (caseData.hasIterationBindingCache) {
          caseData.iterationBindingCache = null;
          caseData.hasIterationBindingCache = false;
        }
      }
    });
  };
  const createCaseData = (node, attrName) => {
    const caseData = {
      el: node,
      dataKey: node.getAttribute(attrName),
      type: attrName
    };
    return caseData;
  };

  /**
   * Create event handler wrapper
   */
  const createEventHandlerWrapper = (type, paramList, handlerFn, viewModelContext) => {
    return function handlerWrap(e) {
      let formData;
      let args = [];
      if (type === 'submit') {
        formData = getFormData(e.currentTarget);
        args = [e, e.currentTarget, formData, ...paramList];
      } else {
        args = [e, e.currentTarget, ...paramList];
      }
      handlerFn.apply(viewModelContext, args);
    };
  };
  const createEventBinding = ({
    cache = {},
    forceRender = false,
    type = '',
    viewModel = {}
  }) => {
    var _a;
    const handlerName = cache.dataKey;
    let paramList = cache.parameters;
    let viewModelContext;
    const APP = viewModel.APP || ((_a = viewModel.$root) === null || _a === void 0 ? void 0 : _a.APP);
    const rootElement = APP === null || APP === void 0 ? void 0 : APP.$rootElement;
    if (!type || !handlerName || !forceRender && rootElement && !rootElement.contains(cache.el)) {
      return;
    }
    const handlerFn = getViewModelValue(viewModel, handlerName);
    if (typeof handlerFn === 'function') {
      viewModelContext = resolveViewModelContext(viewModel, handlerName);
      paramList = paramList ? resolveParamList(viewModel, paramList) : [];
      // Store handler key for this event type on the DOM element itself
      // This prevents duplicate handlers even if multiple cache objects exist for same element
      const handlerKey = `_db_${type}Handler`;
      const el = cache.el;
      // Check if handler already exists and skip if it's the same
      // This prevents adding duplicate handlers when the same element is processed multiple times
      if (el[handlerKey]) {
        // Handler already exists, remove it before adding new one
        el.removeEventListener(type, el[handlerKey], false);
      }
      // Create new handler wrapper
      const handlerWrap = createEventHandlerWrapper(type, paramList, handlerFn, viewModelContext);
      // Store the handler on the DOM element so we can remove it later
      el[handlerKey] = handlerWrap;
      // Add the new event listener
      el.addEventListener(type, handlerWrap, false);
    }
  };

  const applyBinding = ({
    ctx: _ctx,
    elementCache,
    updateOption,
    bindingAttrs,
    viewModel
  }) => {
    if (!elementCache || !updateOption) {
      return;
    }
    // the follow binding should be in order for better efficiency
    // apply forOf Binding
    if (updateOption.forOfBinding && elementCache[bindingAttrs.forOf] && elementCache[bindingAttrs.forOf].length) {
      elementCache[bindingAttrs.forOf].forEach(cache => {
        forOfBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
      });
    }
    // apply attr Binding
    if (updateOption.attrBinding && elementCache[bindingAttrs.attr] && elementCache[bindingAttrs.attr].length) {
      elementCache[bindingAttrs.attr].forEach(cache => {
        attrBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
      });
    }
    // apply if Binding
    if (updateOption.ifBinding && elementCache[bindingAttrs.if] && elementCache[bindingAttrs.if].length) {
      elementCache[bindingAttrs.if].forEach(cache => {
        ifBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
      });
    }
    // apply show Binding
    if (updateOption.showBinding && elementCache[bindingAttrs.show] && elementCache[bindingAttrs.show].length) {
      elementCache[bindingAttrs.show].forEach(cache => {
        showBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
      });
    }
    // apply switch Binding
    if (updateOption.switchBinding && elementCache[bindingAttrs.switch] && elementCache[bindingAttrs.switch].length) {
      elementCache[bindingAttrs.switch].forEach(cache => {
        switchBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
      });
    }
    // apply text binding
    if (updateOption.textBinding && elementCache[bindingAttrs.text] && elementCache[bindingAttrs.text].length) {
      elementCache[bindingAttrs.text].forEach(cache => {
        textBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
      });
    }
    // apply cssBinding
    if (updateOption.cssBinding && elementCache[bindingAttrs.css] && elementCache[bindingAttrs.css].length) {
      elementCache[bindingAttrs.css].forEach(cache => {
        cssBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
      });
    }
    // apply model binding
    if (updateOption.modelBinding && elementCache[bindingAttrs.model] && elementCache[bindingAttrs.model].length) {
      elementCache[bindingAttrs.model].forEach(cache => {
        modelBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
      });
    }
    // apply change binding
    if (updateOption.changeBinding && elementCache[bindingAttrs.change] && elementCache[bindingAttrs.change].length) {
      elementCache[bindingAttrs.change].forEach(cache => {
        changeBinding({
          bindingAttrs,
          cache,
          forceRender: updateOption.forceRender,
          type: 'change',
          viewModel
        });
      });
    }
    // apply submit binding
    if (updateOption.submitBinding && elementCache[bindingAttrs.submit] && elementCache[bindingAttrs.submit].length) {
      elementCache[bindingAttrs.submit].forEach(cache => {
        createEventBinding({
          cache,
          forceRender: updateOption.forceRender,
          type: 'submit',
          viewModel
        });
      });
    }
    // apply click binding
    if (updateOption.clickBinding && elementCache[bindingAttrs.click] && elementCache[bindingAttrs.click].length) {
      elementCache[bindingAttrs.click].forEach(cache => {
        createEventBinding({
          cache,
          forceRender: updateOption.forceRender,
          type: 'click',
          viewModel
        });
      });
    }
    // apply double click binding
    if (updateOption.dblclickBinding && elementCache[bindingAttrs.dblclick] && elementCache[bindingAttrs.dblclick].length) {
      elementCache[bindingAttrs.dblclick].forEach(cache => {
        createEventBinding({
          cache,
          forceRender: updateOption.forceRender,
          type: 'dblclick',
          viewModel
        });
      });
    }
    // apply blur binding
    if (updateOption.blurBinding && elementCache[bindingAttrs.blur] && elementCache[bindingAttrs.blur].length) {
      elementCache[bindingAttrs.blur].forEach(cache => {
        createEventBinding({
          cache,
          forceRender: updateOption.forceRender,
          type: 'blur',
          viewModel
        });
      });
    }
    // apply focus binding
    if (updateOption.focusBinding && elementCache[bindingAttrs.focus] && elementCache[bindingAttrs.focus].length) {
      elementCache[bindingAttrs.focus].forEach(cache => {
        createEventBinding({
          cache,
          forceRender: updateOption.forceRender,
          type: 'focus',
          viewModel
        });
      });
    }
    // apply hover binding
    if (updateOption.hoverBinding && elementCache[bindingAttrs.hover] && elementCache[bindingAttrs.hover].length) {
      elementCache[bindingAttrs.hover].forEach(cache => {
        hoverBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
      });
    }
    // apply input binding - eg html range input
    if (updateOption.inputBinding && elementCache[bindingAttrs.input] && elementCache[bindingAttrs.input].length) {
      elementCache[bindingAttrs.input].forEach(cache => {
        changeBinding({
          bindingAttrs,
          cache,
          forceRender: updateOption.forceRender,
          type: 'input',
          viewModel
        });
      });
    }
  };

  const postProcess = tasks => {
    if (!tasks || !tasks.length) {
      return;
    }
    each(tasks, (index, task) => {
      if (typeof task === 'function') {
        try {
          task();
        } catch (err) {
          throwErrorMessage(err, `Error postProcess: ${String(task)}`);
        }
      }
    });
  };

  const EVENTS = {};
  const subscribeEvent = (instance = null, eventName = '', fn, isOnce = false) => {
    if (!instance || typeof instance !== 'object' || !('compId' in instance) || !instance.compId || !eventName || typeof fn !== 'function') {
      return;
    }
    let subscriber;
    let isSubscribed = false;
    eventName = eventName.replace(REGEX.WHITE_SPACES, '');
    EVENTS[eventName] = EVENTS[eventName] || [];
    // check if already subscribed and update callback fn
    const instanceWithViewModel = instance;
    isSubscribed = EVENTS[eventName].some(subscriber => {
      if (subscriber[instanceWithViewModel.compId]) {
        subscriber[instanceWithViewModel.compId] = fn.bind(instanceWithViewModel.viewModel);
        subscriber.isOnce = isOnce;
        return true;
      }
      return false;
    });
    // push if not yet subscribe
    if (!isSubscribed) {
      subscriber = {};
      subscriber[instanceWithViewModel.compId] = fn.bind(instanceWithViewModel.viewModel);
      subscriber.isOnce = isOnce;
      EVENTS[eventName].push(subscriber);
    }
  };
  const subscribeEventOnce = (instance = null, eventName = '', fn) => {
    subscribeEvent(instance, eventName, fn, true);
  };
  const unsubscribeEvent = (compId = '', eventName = '') => {
    if (!compId || !eventName) {
      return;
    }
    let i = 0;
    let subscribersLength = 0;
    let subscriber;
    eventName = eventName.replace(REGEX.WHITE_SPACES, '');
    if (EVENTS[eventName]) {
      subscribersLength = EVENTS[eventName].length;
      for (i = 0; i < subscribersLength; i += 1) {
        subscriber = EVENTS[eventName][i];
        if (subscriber[compId]) {
          EVENTS[eventName].splice(i, 1);
          break;
        }
      }
    }
    // delete the event if no more subscriber
    if (EVENTS[eventName] && !EVENTS[eventName].length) {
      delete EVENTS[eventName];
    }
  };
  /**
   * unsubscribeAllEvent
   * @description unsubscribe all event by compId. eg when a component removed
   * @param {string} compId
   */
  const unsubscribeAllEvent = (compId = '') => {
    if (!compId) {
      return;
    }
    Object.keys(EVENTS).forEach(eventName => {
      unsubscribeEvent(compId, eventName);
    });
  };
  const publishEvent = (eventName = '', ...args) => {
    if (!eventName || !EVENTS[eventName]) {
      return;
    }
    eventName = eventName.replace(REGEX.WHITE_SPACES, '');
    EVENTS[eventName].forEach(subscriber => {
      Object.keys(subscriber).forEach(compId => {
        if (typeof subscriber[compId] === 'function') {
          const ret = subscriber[compId](...args);
          if (subscriber.isOnce) {
            unsubscribeEvent(compId, eventName);
          }
          return ret;
        }
      });
    });
  };

  // WeakMap to store proxy metadata
  const PROXY_MARKER = Symbol('isReactiveProxy');
  const ORIGINAL_TARGET = Symbol('originalTarget');
  /**
   * Check if an object is already a reactive proxy
   */
  function isReactiveProxy(obj) {
    return obj !== null && typeof obj === 'object' && obj[PROXY_MARKER] === true;
  }
  /**
   * Create a reactive proxy that automatically triggers onChange when properties are modified
   * Supports deep proxying for nested objects and arrays
   */
  function createReactiveProxy(target, options, path = '', tracker) {
    const {
      onChange,
      deep = true,
      trackChanges = false
    } = options;
    // Don't proxy non-objects
    if (target === null || typeof target !== 'object') {
      return target;
    }
    // Don't re-proxy already proxied objects
    if (isReactiveProxy(target)) {
      return target;
    }
    // Skip proxying special properties to avoid circular issues
    const skipProps = ['APP', '$root', '__proto__', 'constructor'];
    if (skipProps.includes(path)) {
      return target;
    }
    // Track changes if enabled
    const changeTracker = tracker || (trackChanges ? {
      changedPaths: new Set()
    } : undefined);
    // Store proxied nested objects to reuse same proxy
    const proxiedChildren = new Map();
    const handler = {
      set(obj, prop, value) {
        // Skip internal properties
        if (typeof prop === 'symbol') {
          obj[prop] = value;
          return true;
        }
        const oldValue = obj[prop];
        // Only trigger if value actually changed
        if (oldValue === value) {
          return true;
        }
        // Set the new value
        obj[prop] = value;
        // Clear cached proxy for this property since value changed
        proxiedChildren.delete(prop);
        // Track the changed path
        if (changeTracker) {
          const fullPath = path ? `${path}.${String(prop)}` : String(prop);
          changeTracker.changedPaths.add(fullPath);
        }
        // Trigger onChange callback (debounced render)
        onChange();
        return true;
      },
      get(obj, prop) {
        // Return proxy markers
        if (prop === PROXY_MARKER) {
          return true;
        }
        if (prop === ORIGINAL_TARGET) {
          return obj;
        }
        const value = obj[prop];
        // Don't proxy functions, symbols, or special properties
        if (typeof value === 'function' || typeof prop === 'symbol' || skipProps.includes(String(prop))) {
          return value;
        }
        // If deep proxying is enabled and value is an object, wrap it in proxy
        if (deep && value !== null && typeof value === 'object') {
          // Return cached proxy if exists
          if (proxiedChildren.has(prop)) {
            return proxiedChildren.get(prop);
          }
          const fullPath = path ? `${path}.${String(prop)}` : String(prop);
          const proxied = Array.isArray(value) ? createReactiveArray(value, onChange, options, fullPath, changeTracker) : createReactiveProxy(value, options, fullPath, changeTracker);
          // Cache the proxy
          proxiedChildren.set(prop, proxied);
          return proxied;
        }
        return value;
      },
      deleteProperty(obj, prop) {
        if (typeof prop === 'symbol') {
          delete obj[prop];
          return true;
        }
        delete obj[prop];
        // Clear cached proxy
        proxiedChildren.delete(prop);
        // Track deletion
        if (changeTracker) {
          const fullPath = path ? `${path}.${String(prop)}` : String(prop);
          changeTracker.changedPaths.add(fullPath);
        }
        onChange();
        return true;
      }
    };
    return new Proxy(target, handler);
  }
  /**
   * Special handling for arrays to intercept mutating methods
   */
  function createReactiveArray(target, onChange, options, path = '', tracker) {
    const {
      deep = true
    } = options;
    // Don't re-proxy already proxied arrays
    if (isReactiveProxy(target)) {
      return target;
    }
    const handler = {
      set(obj, prop, value) {
        // Handle symbol properties
        if (typeof prop === 'symbol') {
          obj[prop] = value;
          return true;
        }
        const oldValue = obj[prop];
        // Only trigger if value actually changed
        if (oldValue === value) {
          return true;
        }
        obj[prop] = value;
        // Track changes
        if (tracker) {
          const fullPath = path ? `${path}[${String(prop)}]` : `[${String(prop)}]`;
          tracker.changedPaths.add(fullPath);
        }
        onChange();
        return true;
      },
      get(obj, prop) {
        // Return proxy markers
        if (prop === PROXY_MARKER) {
          return true;
        }
        if (prop === ORIGINAL_TARGET) {
          return obj;
        }
        const value = obj[prop];
        // Intercept array mutating methods
        if (typeof value === 'function') {
          const mutatingMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill'];
          if (mutatingMethods.includes(String(prop))) {
            return function (...args) {
              const result = value.apply(this, args);
              // Track change
              if (tracker) {
                tracker.changedPaths.add(path || 'array');
              }
              onChange();
              return result;
            };
          }
        }
        // Deep proxy array elements if they are objects
        if (deep && value !== null && typeof value === 'object' && typeof prop !== 'symbol') {
          const fullPath = path ? `${path}[${String(prop)}]` : `[${String(prop)}]`;
          if (Array.isArray(value)) {
            return createReactiveArray(value, onChange, options, fullPath, tracker);
          }
          return createReactiveProxy(value, options, fullPath, tracker);
        }
        return value;
      },
      deleteProperty(obj, prop) {
        if (typeof prop === 'symbol') {
          delete obj[prop];
          return true;
        }
        delete obj[prop];
        if (tracker) {
          const fullPath = path ? `${path}[${String(prop)}]` : `[${String(prop)}]`;
          tracker.changedPaths.add(fullPath);
        }
        onChange();
        return true;
      }
    };
    return new Proxy(target, handler);
  }
  /**
   * Check if Proxy is supported
   */
  function isProxySupported() {
    return typeof Proxy !== 'undefined';
  }

  let compIdIndex = 0;
  class Binder {
    constructor($rootElement, viewModel, bindingAttrs, options = {}) {
      if (!$rootElement || $rootElement.nodeType !== 1 || viewModel === null || typeof viewModel !== 'object') {
        throw new TypeError('$rootElement or viewModel is invalid');
      }
      this.initRendered = false;
      this.compId = compIdIndex += 1;
      this.$rootElement = $rootElement;
      this.bindingAttrs = bindingAttrs;
      this.isServerRendered = this.$rootElement.getAttribute(serverRenderedAttr) !== null;
      // Initialize afterRender callbacks array
      this.afterRenderCallbacks = [];
      // Initialize render method with debounced version
      this.render = debounceRaf(this._render.bind(this), this);
      // Store original viewModel reference
      this.originalViewModel = viewModel;
      // Reactive mode is controlled by options (defaults merged in index.ts)
      // options.reactive is guaranteed to be defined due to merge in index.ts
      this.isReactive = !!options.reactive;
      // If reactive mode is enabled, wrap viewModel in proxy
      if (this.isReactive) {
        if (!isProxySupported()) {
          console.warn('Reactive mode requires Proxy support. Falling back to manual mode.');
          this.isReactive = false;
          this.viewModel = viewModel;
        } else {
          this.viewModel = createReactiveProxy(viewModel, {
            onChange: () => this.render(),
            deep: true,
            trackChanges: options.trackChanges
          });
        }
      } else {
        this.viewModel = viewModel;
      }
      // inject instance into viewModel
      this.viewModel.APP = this;
      // add $root pointer to viewModel so binding can be refer as $root.something
      this.viewModel.$root = this.viewModel;
      // 1st step
      // parsView walk the DOM and create binding cache that holds each element's binding details
      // this binding cache is like AST for render and update
      this.parseView();
      // for jquery user set viewModel referece to $rootElement for easy debug
      // otherwise use Expando to attach viewModel to $rootElement
      this.$rootElement[bindingDataReference.rootDataKey] = this.viewModel;
      return this;
    }
    /**
     * parseView
     * @description
     * @return {this}
     * traver from $rootElement to find each data-bind-* element
     * then apply data binding
     */
    parseView() {
      this.elementCache = createBindingCache({
        rootNode: this.$rootElement,
        bindingAttrs: this.bindingAttrs
      });
      // updateElementCache if server rendered on init
      if (this.isServerRendered && !this.initRendered) {
        this.updateElementCache({
          templateCache: true
        });
      }
      return this;
    }
    /**
     * updateElementCache
     * @param {object} opt
     * @description call createBindingCache to parse view and generate bindingCache
     */
    updateElementCache(opt = {}) {
      const elementCache = opt.elementCache || this.elementCache;
      if (opt.allCache) {
        // walk dom from root element to regenerate elementCache
        this.elementCache = createBindingCache({
          rootNode: this.$rootElement,
          bindingAttrs: this.bindingAttrs
        });
      }
      // walk from first rendered template node to create/update child bindingCache
      if (opt.allCache || opt.templateCache) {
        if (elementCache[this.bindingAttrs.tmp] && elementCache[this.bindingAttrs.tmp].length) {
          // Use for loop to handle templates added during rendering
          for (let i = 0; i < elementCache[this.bindingAttrs.tmp].length; i++) {
            const cache = elementCache[this.bindingAttrs.tmp][i];
            // set skipCheck as skipForOfParseFn whenever an node has
            // both template and forOf bindings
            // then the template bindingCache should be an empty object
            let skipForOfParseFn = null;
            if (cache.el.hasAttribute(this.bindingAttrs.forOf)) {
              skipForOfParseFn = () => {
                return true;
              };
            }
            cache.bindingCache = createBindingCache({
              rootNode: cache.el,
              bindingAttrs: this.bindingAttrs,
              skipCheck: skipForOfParseFn,
              isRenderedTemplate: opt.isRenderedTemplates
            });
          }
        }
      }
    }
    _render(opt = {}) {
      let updateOption = {};
      if (!this.initRendered) {
        // only update eventsBinding if server rendered
        if (this.isServerRendered) {
          this.$rootElement.removeAttribute(serverRenderedAttr);
          updateOption = createBindingOption(bindingUpdateConditions.serverRendered, opt);
        } else {
          updateOption = createBindingOption(bindingUpdateConditions.init, opt);
        }
      } else {
        // when called again only update visualBinding options
        updateOption = createBindingOption('', opt);
      }
      // create postProcessQueue before start rendering
      this.postProcessQueue = [];
      const renderBindingOption = {
        ctx: this,
        elementCache: this.elementCache,
        updateOption,
        bindingAttrs: this.bindingAttrs,
        viewModel: this.viewModel
      };
      // always render template binding first
      // render and apply binding to template(s)
      // this is an share function therefore passing 'this' context
      renderTemplatesBinding(renderBindingOption);
      // apply bindings to rest of the DOM
      applyBinding(renderBindingOption);
      // trigger postProcess
      postProcess(this.postProcessQueue);
      // clear postProcessQueue
      this.postProcessQueue.length = 0;
      delete this.postProcessQueue;
      this.initRendered = true;
      // Call afterRender callbacks after rendering is fully complete
      this._callAfterRenderCallbacks();
    }
    /**
     * Call all registered afterRender callbacks
     * Called automatically after each render completes
     */
    _callAfterRenderCallbacks() {
      if (this.afterRenderCallbacks.length > 0) {
        // Clone array to avoid issues if callbacks modify the array
        const callbacks = this.afterRenderCallbacks.slice();
        for (let i = 0, len = callbacks.length; i < len; i += 1) {
          try {
            callbacks[i]();
          } catch (err) {
            console.error('Error in afterRender callback:', err);
          }
        }
      }
    }
    /**
     * Register a callback to be called after each render completes
     * Useful for reactive mode where renders happen automatically
     * @param callback Function to call after render completes
     * @returns this for chaining
     */
    afterRender(callback) {
      if (typeof callback !== 'function') {
        throw new TypeError('afterRender callback must be a function');
      }
      this.afterRenderCallbacks.push(callback);
      return this;
    }
    /**
     * Remove a specific afterRender callback
     * @param callback The callback function to remove
     * @returns this for chaining
     */
    removeAfterRender(callback) {
      const index = this.afterRenderCallbacks.indexOf(callback);
      if (index !== -1) {
        this.afterRenderCallbacks.splice(index, 1);
      }
      return this;
    }
    /**
     * Clear all afterRender callbacks
     * @returns this for chaining
     */
    clearAfterRender() {
      this.afterRenderCallbacks.length = 0;
      return this;
    }
    subscribe(eventName = '', fn) {
      subscribeEvent(this, eventName, fn);
      return this;
    }
    subscribeOnce(eventName = '', fn) {
      subscribeEventOnce(this, eventName, fn);
      return this;
    }
    unsubscribe(eventName = '') {
      unsubscribeEvent(this.compId, eventName);
      return this;
    }
    unsubscribeAll() {
      unsubscribeAllEvent(this.compId);
      return this;
    }
    publish(eventName = '', ...args) {
      publishEvent(eventName, ...args);
      return this;
    }
  }

  const isSupportPromise = typeof window['Promise'] === 'function';
  let bindingAttrs = bindingAttrs$1;
  // Global default options for all Binder instances
  const defaultOptions = {
    reactive: true // Enable reactive mode by default
  };
  const use = (settings = {}) => {
    if (settings.bindingAttrs) {
      bindingAttrs = extend(false, {}, settings.bindingAttrs);
    }
    // Allow setting global reactive option
    if (typeof settings.reactive === 'boolean') {
      defaultOptions.reactive = settings.reactive;
    }
    // Allow setting global trackChanges option
    if (typeof settings.trackChanges === 'boolean') {
      defaultOptions.trackChanges = settings.trackChanges;
    }
    // Return API for chaining
    return api;
  };
  const init = ($rootElement, viewModel = null, options) => {
    if (!isSupportPromise) {
      return console.warn('Browser not support Promise');
    }
    // Merge global defaults with instance-specific options
    // Instance options take precedence over global defaults
    const mergedOptions = _extends(_extends({}, defaultOptions), options);
    return new Binder($rootElement, viewModel, bindingAttrs, mergedOptions);
  };
  const api = {
    use,
    init,
    version: '@version@'
  };

  return api;

}));
