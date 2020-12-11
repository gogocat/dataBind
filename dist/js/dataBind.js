/**
 * dataBind
 * version 1.9.0
 * By Adam Chow
 * link https://gogocat.github.io/dataBind/
 * license MIT
 * 
 */

(function () {
    'use strict';

    const bindingAttrs = {
      comp: 'data-jq-comp',
      tmp: 'data-jq-tmp',
      text: 'data-jq-text',
      click: 'data-jq-click',
      dblclick: 'data-jq-dblclick',
      blur: 'data-jq-blur',
      focus: 'data-jq-focus',
      hover: 'data-jq-hover',
      change: 'data-jq-change',
      submit: 'data-jq-submit',
      model: 'data-jq-model',
      show: 'data-jq-show',
      css: 'data-jq-css',
      attr: 'data-jq-attr',
      forOf: 'data-jq-for',
      if: 'data-jq-if',
      switch: 'data-jq-switch',
      case: 'data-jq-case',
      default: 'data-jq-default'
    };
    const serverRenderedAttr = 'data-server-rendered';
    const dataIndexAttr = 'data-index';
    const commentPrefix = {
      forOf: 'data-forOf_',
      if: 'data-if_',
      case: 'data-case_',
      default: 'data-default_'
    };
    const commentSuffix = '_end'; // global setting of underscore template inteprolate default token

    const templateSettings = {
      evaluate: /<%([\s\S]+?)%>/g,
      interpolate: /\{\{=(.+?)\}\}/g,
      escape: /\{\{(.+?)\}\}/g
    };
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
    }; // maximum string length before running regex

    const maxDatakeyLength = 50;
    const constants = {
      filters: {
        ONCE: 'once'
      },
      PARENT_REF: '_parent'
    };

    _ = window._ || {};
    const hasIsArray = Array.isArray;
    const supportPromise = typeof window['Promise'] === 'function';
    const REGEX = {
      FUNCTIONPARAM: /\((.*?)\)/,
      WHITESPACES: /\s+/g,
      FOROF: /(.*?)\s+(?:in|of)\s+(.*)/,
      PIPE: /\|/,
      HTML_TAG: /^[\s]*<([a-z][^\/\s>]+)/i,
      BAG_TAGS: /<(script|del)(?=[\s>])[\w\W]*?<\/\1\s*>/ig
    };
    const IS_SUPPORT_TEMPLATE = ('content' in document.createElement('template'));
    const WRAP_MAP = {
      div: ['div', '<div>', '</div>'],
      thead: ['table', '<table>', '</table>'],
      col: ['colgroup', '<table><colgroup>', '</colgroup></table>'],
      tr: ['tbody', '<table><tbody>', '</tbody></table>'],
      td: ['tr', '<table><tr>', '</tr></table>']
    };
    WRAP_MAP.caption = WRAP_MAP.colgroup = WRAP_MAP.tbody = WRAP_MAP.tfoot = WRAP_MAP.thead;
    WRAP_MAP.th = WRAP_MAP.td;

    function getFirstHtmlStringTag(htmlString) {
      const match = htmlString.match(REGEX.HTML_TAG);

      if (match) {
        return match[1];
      }

      return null;
    }

    function removeBadTags(htmlString = '') {
      return htmlString.replace(REGEX.BAG_TAGS, '');
    }

    function createHtmlFragment(htmlString) {
      if (typeof htmlString !== 'string') {
        return null;
      } // use template element


      if (IS_SUPPORT_TEMPLATE) {
        const template = document.createElement('template');
        template.innerHTML = removeBadTags(htmlString);
        return template.content;
      } // use document fragment with wrap html tag for tr, td etc.


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

    const isArray = obj => {
      return hasIsArray ? Array.isArray(obj) : Object.prototype.toString.call(obj) === '[object Array]';
    };

    const isJsObject = obj => {
      return obj !== null && typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Object]';
    };

    const isPlainObject = obj => {
      if (!isJsObject(obj)) {
        return false;
      } // If has modified constructor


      const ctor = obj.constructor;
      if (typeof ctor !== 'function') return false; // If has modified prototype

      const prot = ctor.prototype;
      if (isJsObject(prot) === false) return false; // If constructor does not have an Object-specific method

      if (prot.hasOwnProperty('isPrototypeOf') === false) {
        return false;
      } // Most likely a plain Object


      return true;
    };

    const isEmptyObject = obj => {
      if (isJsObject(obj)) {
        return Object.getOwnPropertyNames(obj).length === 0;
      }

      return false;
    };
    /**
     * getViewModelValue
     * @description walk a object by provided string path. eg 'a.b.c'
     * @param {object} viewModel
     * @param {string} prop
     * @return {object}
     */


    const getViewModelValue = (viewModel, prop) => {
      return _.get(viewModel, prop);
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
        const oldViewModelProValue = bindingCache.elementData ? bindingCache.elementData.viewModelProValue : null;
        paramList = paramList ? resolveParamList(viewModel, paramList) : []; // let args = [oldViewModelProValue, bindingCache.el].concat(paramList);

        const args = paramList.concat([oldViewModelProValue, bindingCache.el]);
        ret = ret.apply(viewModelContext, args);
      }

      ret = isInvertBoolean ? !Boolean(ret) : ret; // call through fitlers to get final value

      ret = filtersViewModelPropValue({
        value: ret,
        viewModel: viewModel,
        bindingCache: bindingCache
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
      return toArray.filter((value, index) => {
        return frommArray.indexOf(value) < 0;
      });
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

      let paramlist = str.match(REGEX.FUNCTIONPARAM);

      if (paramlist && paramlist[1]) {
        paramlist = paramlist[1].split(',');
        paramlist.forEach(function (v, i) {
          paramlist[i] = v.trim();
        });
      }

      return paramlist;
    };

    const extractFilterList = cacheData => {
      if (!cacheData || !cacheData.dataKey || cacheData.dataKey.length > maxDatakeyLength) {
        return cacheData;
      }

      const filterList = cacheData.dataKey.split(REGEX.PIPE);
      let isOnceIndex;
      cacheData.dataKey = filterList[0].trim();

      if (filterList.length > 1) {
        filterList.shift(0);
        filterList.forEach(function (v, i) {
          filterList[i] = v.trim();

          if (filterList[i] === constants.filters.ONCE) {
            cacheData.isOnce = true;
            isOnceIndex = i;
          }
        }); // don't store filter 'once' - because it is internal logic not a property from viewModel

        if (isOnceIndex >= 0) {
          filterList.splice(isOnceIndex, 1);
        }

        cacheData.filters = filterList;
      }

      return cacheData;
    };

    const invertObj = sourceObj => {
      return Object.keys(sourceObj).reduce(function (obj, key) {
        obj[sourceObj[key]] = key;
        return obj;
      }, {});
    };

    const createDeferredObj = () => {
      let dfObj = {};

      if (supportPromise) {
        dfObj.promise = new Promise((resolve, reject) => {
          dfObj.resolve = resolve;
          dfObj.reject = reject;
        });
      } else {
        dfObj = $.Deferred(); // eslint-disable-line new-cap
      }

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
        let rafId = 0; // return decorated fn

        return function () {
          /* eslint-disable prefer-rest-params */
          const args = Array.from ? Array.from(arguments) : Array.prototype.slice.call(arguments);
          window.cancelAnimationFrame(rafId);
          rafId = window.requestAnimationFrame(() => {
            try {
              // fn is Binder.render function
              fn.apply(ctx, args); // dfObj.resolve is function provided in .then promise chain
              // ctx is the current component

              dfObj.resolve(ctx);
            } catch (err) {
              console.error('error in rendering: ', err);
              dfObj.reject(err);
            } // reset dfObj - otherwise then callbacks will not be in execution order
            // example:
            // myApp.render().then(function(){console.log('ok1')});
            // myApp.render().then(function(){console.log('ok2')});
            // myApp.render().then(function(){console.log('ok3')});
            // >> ok1, ok2, ok3


            dfObj = createDeferredObj();
            window.cancelAnimationFrame(rafId);
          });
          /* eslint-enable prefer-rest-params */

          return supportPromise ? dfObj.promise : dfObj.promise();
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
        Object.keys(source).forEach(key => {
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
        param = param.trim();

        if (param === bindingDataReference.currentIndex) {
          // convert '$index' to value
          param = viewModel[bindingDataReference.currentIndex];
        } else if (param === bindingDataReference.currentData) {
          // convert '$data' to value or current viewModel
          param = viewModel[bindingDataReference.currentData] || viewModel;
        } else if (param === bindingDataReference.rootDataKey) {
          // convert '$root' to root viewModel
          param = viewModel[bindingDataReference.rootDataKey] || viewModel;
        }

        return param;
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

    const throwErrorMessage = (err = null, errorMessage = '') => {
      const message = err && err.message ? err.message : errorMessage;

      if (typeof console.error === 'function') {
        return console.error(message);
      }

      return console.log(message);
    };

    let $domFragment = null;
    let $templateRoot = null;
    let nestTemplatesCount = 0;
    const templateCache = {};
    /**
     * compileTemplate
     * @description compile underscore template and store in templateCache
     * @param {string} id
     * @param {object} templateData
     * @return {string} rendered html string
     */

    const compileTemplate = (id, templateData = null) => {
      let templateString;
      let templateElement;

      if (!templateCache[id]) {
        templateElement = document.getElementById(id);
        templateString = templateElement ? templateElement.innerHTML : '';
        templateCache[id] = _.template(templateString, {
          variable: 'data'
        });
      }

      return templateCache[id](templateData);
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
      const $index = typeof viewModel.$index !== 'undefined' ? viewModel.$index : $element.getAttribute(dataIndexAttr);

      if (typeof $index !== 'undefined') {
        viewData.$index = $index;
      }

      $domFragment = $domFragment || document.createDocumentFragment();
      $templateRoot = $templateRoot || $element;
      const htmlString = compileTemplate(settings.id, viewData);
      const htmlFragment = createHtmlFragment(htmlString); // append rendered html

      if (!$domFragment.childNodes.length) {
        // domFragment should be empty in first run
        $currentElement = $domFragment; // copy of $domFragment for later find nested template check

        $domFragment.appendChild(htmlFragment);
      } else {
        // during recursive run keep append to current fragment
        $currentElement = $element; // reset to current nested template element

        if (!isAppend && !isPrepend) {
          $currentElement = emptyElement($currentElement);
        }

        if (isPrepend) {
          $currentElement.insertBefore(htmlFragment, $currentElement.firstChild);
        } else {
          $currentElement.appendChild(htmlFragment);
        }
      } // check if there are nested template then recurisive render them


      const $nestedTemplates = $currentElement.querySelectorAll('[' + bindingAttrs.tmp + ']');
      const nestedTemplatesLength = $nestedTemplates.length;

      if (nestedTemplatesLength) {
        nestTemplatesCount += nestedTemplatesLength;

        for (let i = 0; i < nestedTemplatesLength; i += 1) {
          const thisTemplateCache = {
            el: $nestedTemplates[i],
            dataKey: $nestedTemplates[i].getAttribute(bindingAttrs.tmp)
          };
          elementCache[bindingAttrs.tmp].push(thisTemplateCache); // recursive template render

          renderTemplate(thisTemplateCache, viewModel, bindingAttrs, elementCache);
          nestTemplatesCount -= 1;
        }
      } // no more nested tempalted to render, start to append $domFragment into $templateRoot


      if (nestTemplatesCount === 0) {
        // append to DOM once
        if (!isAppend && !isPrepend) {
          $templateRoot = emptyElement($templateRoot);
        }

        if (isPrepend) {
          $templateRoot.insertBefore($domFragment, $templateRoot.firstChild);
        } else {
          $templateRoot.appendChild($domFragment);
        } // clear cached fragment


        $domFragment = $templateRoot = null; // trigger callback if provided

        if (typeof viewModel.afterTemplateRender === 'function') {
          viewModel.afterTemplateRender(viewData);
        }
      }
    };

    /* eslint-disable no-invalid-this */
    /**
     * blurBinding
     * DOM decleartive on blur event binding
     * event handler bind to viewModel method according to the DOM attribute
     * @param {object} cache
     * @param {object} viewModel
     * @param {object} bindingAttrs
     * @param {boolean} forceRender
     */

    const hoverBinding = (cache, viewModel, bindingAttrs, forceRender) => {
      const handlerName = cache.dataKey;
      let paramList = cache.parameters;
      const inHandlerName = bindingDataReference.mouseEnterHandlerName;
      const outHandlerName = bindingDataReference.mouseLeaveHandlerName;
      let viewModelContext;
      const APP = viewModel.APP || viewModel.$root.APP;
      cache.elementData = cache.elementData || {}; // TODO: check what is APP.$rootElement.contains(cache.el)

      if (!handlerName || !forceRender && !APP.$rootElement.contains(cache.el)) {
        return;
      }

      const handlers = getViewModelValue(viewModel, handlerName);

      if (handlers && typeof handlers[inHandlerName] === 'function' && typeof handlers[outHandlerName] === 'function') {
        viewModelContext = resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? resolveParamList(viewModel, paramList) : [];

        function onMouseEnterHandler(e) {
          const args = [e, cache.el].concat(paramList);
          handlers[inHandlerName].apply(viewModelContext, args);
        }

        function onMouseLeaveHandler(e) {
          const args = [e, cache.el].concat(paramList);
          handlers[outHandlerName].apply(viewModelContext, args);
        }

        cache.el.removeEventListener('mouseenter', onMouseEnterHandler, false);
        cache.el.removeEventListener('mouseleave', onMouseLeaveHandler, false);
        cache.el.addEventListener('mouseenter', onMouseEnterHandler, false);
        cache.el.addEventListener('mouseleave', onMouseLeaveHandler, false);
      }
    };

    /* eslint-disable no-invalid-this */
    /**
     * changeBinding
     * @description input element on change event binding. DOM -> viewModel update
     * @param {object} cache
     * @param {object} viewModel
     * @param {object} bindingAttrs
     * @param {boolean} forceRender
     */

    const changeBinding = (cache, viewModel, bindingAttrs, forceRender) => {
      const handlerName = cache.dataKey;
      let paramList = cache.parameters;
      const modelDataKey = cache.el.getAttribute(bindingAttrs.model);
      let newValue = '';
      let oldValue = '';
      let viewModelContext;
      const APP = viewModel.APP || viewModel.$root.APP;

      if (!handlerName || !forceRender && !APP.$rootElement.contains(cache.el)) {
        return;
      }

      const handlerFn = getViewModelValue(viewModel, handlerName);

      if (typeof handlerFn === 'function') {
        viewModelContext = resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? resolveParamList(viewModel, paramList) : [];

        function changeHandler(e) {
          const $this = this;
          const isCheckbox = $this.type === 'checkbox';
          newValue = isCheckbox ? $this.checked : _.escape($this.value); // set data to viewModel

          if (modelDataKey) {
            oldValue = getViewModelValue(viewModel, modelDataKey);
            setViewModelValue(viewModel, modelDataKey, newValue);
          }

          const args = [e, e.currentTarget, newValue, oldValue].concat(paramList);
          handlerFn.apply(viewModelContext, args);
          oldValue = newValue;
        } // assing on change event


        cache.el.removeEventListener('change', changeHandler, false);
        cache.el.addEventListener('change', changeHandler, false);
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
      const dataKey = cache.dataKey;
      let newValue = '';
      const APP = viewModel.APP || viewModel.$root.APP;

      if (!dataKey || !forceRender && !APP.$rootElement.contains(cache.el)) {
        return;
      }

      newValue = getViewModelValue(viewModel, dataKey);

      if (typeof newValue !== 'undefined' && newValue !== null) {
        const $element = cache.el;
        const isCheckbox = $element.type === 'checkbox';
        const isRadio = $element.type === 'radio';
        const inputName = $element.name;
        const $radioGroup = isRadio ? APP.$rootElement.querySelectorAll(`input[name="${inputName}"]`) : [];
        const oldValue = isCheckbox ? $element.checked : $element.value; // update element value

        if (newValue !== oldValue) {
          if (isCheckbox) {
            $element.checked = Boolean(newValue);
          } else if (isRadio) {
            let i = 0;
            const radioGroupLength = $radioGroup.length;

            for (i = 0; i < radioGroupLength; i += 1) {
              if ($radioGroup[i].value === newValue) {
                $radioGroup[i].checked = true;
                break;
              }
            }
          } else {
            $element.value = newValue;
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
      const dataKey = cache.dataKey;
      const APP = viewModel.APP || viewModel.$root.APP; // NOTE: this doesn't work for for-of, if and switch bindings because element was not in DOM

      if (!dataKey || !forceRender && !APP.$rootElement.contains(cache.el)) {
        return;
      }

      const newValue = getViewModelPropValue(viewModel, cache);
      const oldValue = cache.el.textContent;

      if (typeof newValue !== 'undefined' && typeof newValue !== 'object' && newValue !== null) {
        if (newValue !== oldValue) {
          cache.el.textContent = newValue;
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

    const showBinding = (cache, viewModel, bindingAttrs) => {
      const dataKey = cache.dataKey;
      let currentInlineSytle = {};
      let currentInlineDisplaySytle = '';
      let shouldShow = true;

      if (!dataKey) {
        return;
      }

      cache.elementData = cache.elementData || {};
      const oldShowStatus = cache.elementData.viewModelPropValue; // store current element display default style once only

      if (typeof cache.elementData.displayStyle === 'undefined' || typeof cache.elementData.computedStyle === 'undefined') {
        currentInlineSytle = cache.el.style;
        currentInlineDisplaySytle = currentInlineSytle.display; // use current inline style if defined

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

      shouldShow = getViewModelPropValue(viewModel, cache); // treat undefined || null as false.
      // eg if property doesn't exsits in viewModel, it will treat as false to hide element

      shouldShow = Boolean(shouldShow); // reject if nothing changed

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
      } // store new show status


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
      const dataKey = cache.dataKey;
      const APP = viewModel.APP || viewModel.$root.APP;

      if (!dataKey || !forceRender && !APP.$rootElement.contains(cache.el)) {
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
      } // reject if nothing changed


      if (oldCssList === newCssList) {
        return;
      } // get current css classes from element


      const domCssList = cache.el.classList; // clone domCssList as new array

      const domCssListLength = domCssList.length;

      for (let i = 0; i < domCssListLength; i += 1) {
        cssList.push(domCssList[i]);
      }

      if (isViewDataObject) {
        each(vmCssListObj, function (k, v) {
          const i = cssList.indexOf(k);

          if (v === true) {
            cssList.push(k);
          } else if (i !== -1) {
            cssList.splice(i, 1);
          }
        });
      } else if (isViewDataString) {
        // remove oldCssList items from cssList
        cssList = arrayRemoveMatch(cssList, oldCssList);
        cssList = cssList.concat(vmCssListArray);
      } // unique cssList array


      cssList = cssList.filter((v, i, a) => {
        return a.indexOf(v) === i;
      });
      cssList = cssList.join(' '); // update element data

      cache.elementData.viewModelPropValue = newCssList; // replace all css classes

      cache.el.setAttribute('class', cssList);
    };

    /**
     * attrBinding
     * @description
     * DOM decleartive attr binding. update elenment attributes
     * @param {object} cache
     * @param {object} viewModel
     * @param {object} bindingAttrs
     */

    const attrBinding = (cache, viewModel, bindingAttrs) => {
      const dataKey = cache.dataKey;

      if (!dataKey) {
        return;
      }

      cache.elementData = cache.elementData || {};
      cache.elementData.viewModelProValue = cache.elementData.viewModelProValue || {};
      const oldAttrObj = cache.elementData.viewModelProValue;
      const vmAttrObj = getViewModelPropValue(viewModel, cache);

      if (!isPlainObject(vmAttrObj)) {
        return;
      } // reject if nothing changed


      if (JSON.stringify(oldAttrObj) === JSON.stringify(vmAttrObj)) {
        return;
      } // reset old data and update it


      cache.elementData.viewModelProValue = {};

      if (isEmptyObject(oldAttrObj)) {
        each(vmAttrObj, (key, value) => {
          cache.el.setAttribute(key, value); // populate with vmAttrObj data

          cache.elementData.viewModelProValue[key] = value;
        });
      } else {
        each(oldAttrObj, (key, value) => {
          if (typeof vmAttrObj[key] === 'undefined') {
            // remove attribute if not present in current vm
            cache.el.removeAttribute(key);
          }
        });
        each(vmAttrObj, (key, value) => {
          if (oldAttrObj[key] !== vmAttrObj[key]) {
            // update attribute if value changed
            cache.el.setAttribute(key, vmAttrObj[key]);
          } // populate with vmAttrObj data


          cache.elementData.viewModelProValue[key] = value;
        });
      }
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
      node = node.firstElementChild;

      while (node) {
        parseChildNode = func(node);

        if (parseChildNode) {
          walkDOM(node, func);
        }

        node = node.nextElementSibling;
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
        attrValue = attrObj[type].trim();
        cacheData = {
          el: node,
          dataKey: attrValue
        }; // populate cacheData.filters. update filterList first item as dataKey

        cacheData = extractFilterList(cacheData); // populate cacheData.parameters
        // for store function call parameters eg. '$index', '$root'
        // useful with DOM for-loop template as reference to binding data

        const paramList = getFunctionParameterList(cacheData.dataKey);

        if (paramList) {
          cacheData.parameters = paramList;
          cacheData.dataKey = cacheData.dataKey.replace(REGEX.FUNCTIONPARAM, '').trim();
        } // store parent array reference to cacheData


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

      if (!rootNode instanceof window.Node) {
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
        } // when creating sub bindingCache if is for tmp binding
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
              node: node,
              attrObj: attrObj,
              bindingCache: bindingCache,
              type: key
            });
          }
        }); // after cache forOf skip parse child nodes

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

    /* eslint-disable no-invalid-this */

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
      const dataKeyMarker = bindingData.dataKey ? bindingData.dataKey.replace(REGEX.WHITESPACES, '_') : '';

      switch (bindingData.type) {
        case bindingAttrs.forOf:
          commentPrefix$1 = commentPrefix.forOf;
          break;

        case bindingAttrs.if:
          commentPrefix$1 = commentPrefix.if;
          break;

        case bindingAttrs.case:
          commentPrefix$1 = commentPrefix.case;
          break;

        case bindingAttrs.default:
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
      node = node.nextSibling; // check last wrap comment node

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
      const commentEnd = document.createComment(prefix + commentSuffix); // document fragment - logic for ForOf binding
      // check node.parentNode because node could be from cache and no longer in DOM

      if (node.nodeType === 11) {
        node.insertBefore(commentBegin, node.firstChild);
        node.appendChild(commentEnd);
      } else if (node.parentNode) {
        node.parentNode.insertBefore(commentBegin, node);
        insertAfter(node.parentNode, commentEnd, node); // update bindingData details

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

      try {
        if (bindingData.previousNonTemplateElement) {
          // update docRange start and end match the wrapped comment node
          bindingData.docRange.setStartBefore(bindingData.previousNonTemplateElement.nextSibling);
          setDocRangeEndAfter(bindingData.previousNonTemplateElement.nextSibling, bindingData);
        } else {
          // insert before next non template element
          bindingData.docRange.setStartBefore(bindingData.parentElement.firstChild);
          setDocRangeEndAfter(bindingData.parentElement.firstChild, bindingData);
        }
      } catch (err) {
        console.log('error removeElemnetsByCommentWrap: ', err.message);
      }

      return bindingData.docRange.deleteContents();
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

    /* eslint-disable no-invalid-this */

    const renderForOfBinding = ({
      bindingData,
      viewModel,
      bindingAttrs: bindingAttrs$1
    }) => {
      if (!bindingData || !viewModel || !bindingAttrs$1) {
        return;
      }

      let keys;
      let iterationDataLength;
      const iterationData = getViewModelPropValue(viewModel, bindingData.iterator);
      let isRegenerate = false; // check iterationData and set iterationDataLength

      if (isArray(iterationData)) {
        iterationDataLength = iterationData.length;
      } else if (isPlainObject(iterationData)) {
        keys = Object.keys(iterationData);
        iterationDataLength = keys.length;
      } else {
        // throw error but let script contince to run
        return throwErrorMessage(null, 'iterationData is not an plain object or array');
      } // flag as pared for-of logic with bindingData.type


      if (!bindingData.type) {
        bindingData.type = bindingAttrs.forOf;
        wrapCommentAround(bindingData, bindingData.el);
      } // assign forOf internal id to bindingData once


      if (typeof bindingData.iterationSize === 'undefined') {
        // store iterationDataLength
        bindingData.iterationSize = iterationDataLength; // remove orignal node for-of attributes

        bindingData.el.removeAttribute(bindingAttrs$1.forOf);
        isRegenerate = true;
      } else {
        // only regenerate cache if iterationDataLength changed
        isRegenerate = bindingData.iterationSize !== iterationDataLength; // update iterationSize

        bindingData.iterationSize = iterationDataLength;
      }

      if (!isRegenerate) {
        bindingData.iterationBindingCache.forEach(function (elementCache, i) {
          if (!isEmptyObject(elementCache)) {
            const iterationVm = createIterationViewModel({
              bindingData: bindingData,
              viewModel: viewModel,
              iterationData: iterationData,
              keys: keys,
              index: i
            });
            renderIteration({
              elementCache: elementCache,
              iterationVm: iterationVm,
              bindingAttrs: bindingAttrs$1,
              isRegenerate: false
            });
          }
        });
        return;
      } // generate forOfBinding elements into fragment


      const fragment = generateForOfElements(bindingData, viewModel, bindingAttrs$1, iterationData, keys);
      removeElemnetsByCommentWrap(bindingData); // insert fragment content into DOM

      return insertRenderedElements(bindingData, fragment);
    };

    const createIterationViewModel = ({
      bindingData,
      viewModel,
      iterationData,
      keys,
      index
    }) => {
      const iterationVm = {};
      iterationVm[bindingData.iterator.alias] = keys ? iterationData[keys[index]] : iterationData[index]; // populate common binding data reference

      iterationVm[bindingDataReference.rootDataKey] = viewModel.$root || viewModel;
      iterationVm[bindingDataReference.currentData] = iterationVm[bindingData.iterator.alias];
      iterationVm[bindingDataReference.currentIndex] = index;
      return iterationVm;
    };

    const generateForOfElements = (bindingData, viewModel, bindingAttrs, iterationData, keys) => {
      const fragment = document.createDocumentFragment();
      const iterationDataLength = bindingData.iterationSize;
      let clonedItem;
      let iterationVm;
      let iterationBindingCache;
      let i = 0; // create or clear exisitng iterationBindingCache

      if (isArray(bindingData.iterationBindingCache)) {
        bindingData.iterationBindingCache.length = 0;
      } else {
        bindingData.iterationBindingCache = [];
      } // generate forOf and append to DOM


      for (i = 0; i < iterationDataLength; i += 1) {
        clonedItem = cloneDomNode(bindingData.el); // create bindingCache per iteration

        iterationBindingCache = createBindingCache({
          rootNode: clonedItem,
          bindingAttrs: bindingAttrs
        });
        bindingData.iterationBindingCache.push(iterationBindingCache);

        if (!isEmptyObject(iterationBindingCache)) {
          // create an iterationVm match iterator alias
          iterationVm = createIterationViewModel({
            bindingData: bindingData,
            viewModel: viewModel,
            iterationData: iterationData,
            keys: keys,
            index: i
          });
          renderIteration({
            elementCache: bindingData.iterationBindingCache[i],
            iterationVm: iterationVm,
            bindingAttrs: bindingAttrs,
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

    const forOfBinding = (cache, viewModel, bindingAttrs) => {
      const dataKey = cache.dataKey;

      if (!dataKey || dataKey.length > maxDatakeyLength) {
        return;
      }

      if (!cache.iterator) {
        if (dataKey.length > maxDatakeyLength) {
          return;
        } // replace mess spaces with single space


        cache.dataKey = cache.dataKey.replace(REGEX.WHITESPACES, ' ');
        const forExpMatch = dataKey.match(REGEX.FOROF);

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
        viewModel: viewModel,
        bindingAttrs: bindingAttrs
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

        if (endCommentTag.nodeType === 8) {
          if (endCommentTag.textContent === commentStartTextContent + commentSuffix) {
            ret = true;
          }
        }
      }

      return ret;
    };

    const renderIfBinding = ({
      bindingData,
      viewModel,
      bindingAttrs
    }) => {
      if (!bindingData.fragment) {
        return;
      }

      const isDomRemoved = isTargetDomRemoved(bindingData);
      let rootElement = bindingData.el; // remove current old DOM.
      // TODO: try preserve DOM

      if (!isDomRemoved && !bindingData.isOnce) {
        removeIfBinding(bindingData); // use fragment for create iterationBindingCache

        rootElement = bindingData.fragment.firstChild.cloneNode(true);
      } // walk clonedElement to create iterationBindingCache once


      if (!bindingData.iterationBindingCache || !bindingData.hasIterationBindingCache) {
        bindingData.iterationBindingCache = createBindingCache({
          rootNode: rootElement,
          bindingAttrs: bindingAttrs
        });
      } // only render if has iterationBindingCache
      // means has other dataBindings to be render


      if (!isEmptyObject(bindingData.iterationBindingCache)) {
        bindingData.hasIterationBindingCache = true;
        renderIteration({
          elementCache: bindingData.iterationBindingCache,
          iterationVm: viewModel,
          bindingAttrs: bindingAttrs,
          isRegenerate: true
        });
      } // insert to new rendered DOM
      // TODO: check unnecessary insertion when DOM is preserved


      insertRenderedElements(bindingData, rootElement);
    };

    const removeIfBinding = bindingData => {
      removeElemnetsByCommentWrap(bindingData); // remove cache.IterationBindingCache to prevent memory leak

      if (bindingData.hasIterationBindingCache) {
        delete bindingData.iterationBindingCache;
        delete bindingData.hasIterationBindingCache;
      }
    };

    /**
     * if-Binding
     * @description
     * DOM decleartive for binding.
     * @param {object} cache
     * @param {object} viewModel
     * @param {object} bindingAttrs
     */

    const ifBinding = (cache, viewModel, bindingAttrs$1) => {
      const dataKey = cache.dataKey; // isOnce only return if there is no child bindings

      if (!dataKey || cache.isOnce && cache.hasIterationBindingCache === false) {
        return;
      }

      cache.elementData = cache.elementData || {};
      cache.type = cache.type || bindingAttrs.if;
      const oldViewModelProValue = cache.elementData.viewModelPropValue; // getViewModelPropValue could be return undefined or null

      const viewModelPropValue = getViewModelPropValue(viewModel, cache) || false; // do nothing if viewModel value not changed and no child bindings

      if (oldViewModelProValue === viewModelPropValue && !cache.hasIterationBindingCache) {
        return;
      }

      const shouldRender = Boolean(viewModelPropValue); // remove this cache from parent array

      if (!shouldRender && cache.isOnce && cache.el.parentNode) {
        removeElement(cache.el); // delete cache.fragment;

        removeBindingInQueue({
          viewModel: viewModel,
          cache: cache
        });
        return;
      } // store new show status


      cache.elementData.viewModelPropValue = viewModelPropValue; // only create fragment once
      // wrap comment tag around
      // remove if attribute from original element to allow later dataBind parsing

      if (!cache.fragment) {
        wrapCommentAround(cache, cache.el);
        cache.el.removeAttribute(bindingAttrs$1.if);
        createClonedElementCache(cache);
      }

      if (!shouldRender) {
        // remove element
        removeIfBinding(cache);
      } else {
        // render element
        renderIfBinding({
          bindingData: cache,
          viewModel: viewModel,
          bindingAttrs: bindingAttrs$1
        }); // if render once
        // remove this cache from parent array if no child caches

        if (cache.isOnce && !cache.hasIterationBindingCache) {
          // delete cache.fragment;
          removeBindingInQueue({
            viewModel: viewModel,
            cache: cache
          });
        }
      }
    };

    const removeBindingInQueue = ({
      viewModel,
      cache
    }) => {
      let ret = false;

      if (viewModel.APP.postProcessQueue) {
        viewModel.APP.postProcessQueue.push(((cache, index) => () => {
          cache[constants.PARENT_REF].splice(index, 1);
        })(cache, cache[constants.PARENT_REF].indexOf(cache)));
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

    const switchBinding = (cache, viewModel, bindingAttrs) => {
      const dataKey = cache.dataKey;

      if (!dataKey) {
        return;
      }

      cache.elementData = cache.elementData || {};
      const newExpression = getViewModelPropValue(viewModel, cache);

      if (newExpression === cache.elementData.viewModelPropValue) {
        return;
      }

      cache.elementData.viewModelPropValue = newExpression; // build switch cases if not yet defined

      if (!cache.cases) {
        const childrenElements = cache.el.children;

        if (!childrenElements.length) {
          return;
        }

        cache.cases = [];

        for (let i = 0, elementLength = childrenElements.length; i < elementLength; i += 1) {
          let caseData = null;

          if (childrenElements[i].hasAttribute(bindingAttrs.case)) {
            caseData = createCaseData(childrenElements[i], bindingAttrs.case);
          } else if (childrenElements[i].hasAttribute(bindingAttrs.default)) {
            caseData = createCaseData(childrenElements[i], bindingAttrs.default);
            caseData.isDefault = true;
          } // create fragment by clone node
          // wrap with comment tag


          if (caseData) {
            wrapCommentAround(caseData, caseData.el); // remove binding attribute for later dataBind parse

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
        let hasMatch = false; // do switch operation - reuse if binding logic

        for (let j = 0, casesLength = cache.cases.length; j < casesLength; j += 1) {
          let newCaseValue;

          if (cache.cases[j].dataKey) {
            // set back to dataKey if nothing found in viewModel
            newCaseValue = getViewModelPropValue(viewModel, cache.cases[j]) || cache.cases[j].dataKey;
          }

          if (newCaseValue === cache.elementData.viewModelPropValue || cache.cases[j].isDefault) {
            hasMatch = true; // render element

            renderIfBinding({
              bindingData: cache.cases[j],
              viewModel: viewModel,
              bindingAttrs: bindingAttrs
            }); // remove other elements

            removeUnmatchCases(cache.cases, j);
            break;
          }
        } // no match remove all cases


        if (!hasMatch) {
          removeUnmatchCases(cache.cases);
        }
      }
    };

    function removeUnmatchCases(cases, matchedIndex) {
      cases.forEach((caseData, index) => {
        if (index !== matchedIndex || typeof matchedIndex === 'undefined') {
          removeIfBinding(caseData); // remove cache.IterationBindingCache to prevent memory leak

          if (caseData.hasIterationBindingCache) {
            caseData.iterationBindingCache = null;
            caseData.hasIterationBindingCache = false;
          }
        }
      });
    }

    function createCaseData(node, attrName) {
      const caseData = {
        el: node,
        dataKey: node.getAttribute(attrName),
        type: attrName
      };
      return caseData;
    }

    /**
     *  pubSub
     * @description use jQuery object as pubSub
     * @example EVENTS object strucure:
     *  EVENTS = {
            'EVENT-NAME': [{ 'comp-id': fn }],
            'EVENT-NAME2': [{ 'comp-id': fn }]
        };
     */

    const EVENTS = {};

    const subscribeEvent = (instance = null, eventName = '', fn, isOnce = false) => {
      if (!instance || !instance.compId || !eventName || typeof fn !== 'function') {
        return;
      }

      let subscriber;
      let isSubscribed = false;
      eventName = eventName.replace(REGEX.WHITESPACES, '');
      EVENTS[eventName] = EVENTS[eventName] || []; // check if already subscribed and update callback fn

      isSubscribed = EVENTS[eventName].some(subscriber => {
        if (subscriber[instance.compId]) {
          subscriber[instance.compId] = fn.bind(instance.viewModel);
          subscriber.isOnce = isOnce;
          return true;
        }
      }); // push if not yet subscribe

      if (!isSubscribed) {
        subscriber = {};
        subscriber[instance.compId] = fn.bind(instance.viewModel);
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
      eventName = eventName.replace(REGEX.WHITESPACES, '');

      if (EVENTS[eventName]) {
        subscribersLength = EVENTS[eventName].length;

        for (i = 0; i < subscribersLength; i += 1) {
          subscriber = EVENTS[eventName][i];

          if (subscriber[compId]) {
            EVENTS[eventName].splice(i, 1);
            break;
          }
        }
      } // delete the event if no more subscriber


      if (!EVENTS[eventName].length) {
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

      eventName = eventName.replace(REGEX.WHITESPACES, '');
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

    let compIdIndex = 0;

    class Binder {
      constructor($rootElement, viewModel, bindingAttrs) {
        if (!$rootElement || $rootElement.nodeType !== 1 || viewModel === null || typeof viewModel !== 'object') {
          throw new TypeError('$rootElement or viewModel is invalid');
        }

        this.initRendered = false;
        this.compId = compIdIndex += 1;
        this.$rootElement = $rootElement;
        this.viewModel = viewModel;
        this.bindingAttrs = bindingAttrs;
        this.render = debounceRaf(this.render, this);
        this.isServerRendered = this.$rootElement.getAttribute(serverRenderedAttr) !== null; // inject instance into viewModel

        this.viewModel.APP = this;
        this.viewModel.$root = this.viewModel;
        this.parseView(); // for jquery user set viewModel referece to $rootElement for easy debug
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
        }); // updateElementCache if server rendered on init

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
        } // walk from first rendered template node to create/update child bindingCache


        if (opt.allCache || opt.templateCache) {
          if (elementCache[this.bindingAttrs.tmp] && elementCache[this.bindingAttrs.tmp].length) {
            elementCache[this.bindingAttrs.tmp].forEach(cache => {
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
            });
          }
        }
      }

      render(opt = {}) {
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
        } // create postProcessQueue before start rendering


        this.postProcessQueue = []; // render and apply binding to template(s)
        // this is an share function therefore passing 'this' context

        renderTemplatesBinding({
          ctx: this,
          elementCache: this.elementCache,
          updateOption: updateOption,
          bindingAttrs: this.bindingAttrs,
          viewModel: this.viewModel
        }); // apply bindings to rest of the DOM

        Binder.applyBinding({
          ctx: this,
          elementCache: this.elementCache,
          updateOption: updateOption,
          bindingAttrs: this.bindingAttrs,
          viewModel: this.viewModel
        }); // trigger postProcess

        Binder.postProcess(this.postProcessQueue); // clear postProcessQueue

        this.postProcessQueue.length = 0;
        delete this.postProcessQueue;
        this.initRendered = true;
      }

      static applyBinding({
        ctx,
        elementCache,
        updateOption,
        bindingAttrs,
        viewModel
      }) {
        if (!elementCache || !updateOption) {
          return;
        } // the follow binding should be in order for better efficiency
        // apply forOf Binding


        if (updateOption.forOfBinding && elementCache[bindingAttrs.forOf] && elementCache[bindingAttrs.forOf].length) {
          elementCache[bindingAttrs.forOf].forEach(cache => {
            forOfBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
          });
        } // apply attr Binding


        if (updateOption.attrBinding && elementCache[bindingAttrs.attr] && elementCache[bindingAttrs.attr].length) {
          elementCache[bindingAttrs.attr].forEach(cache => {
            attrBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
          });
        } // apply if Binding


        if (updateOption.ifBinding && elementCache[bindingAttrs.if] && elementCache[bindingAttrs.if].length) {
          elementCache[bindingAttrs.if].forEach(cache => {
            ifBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
          });
        } // apply show Binding


        if (updateOption.showBinding && elementCache[bindingAttrs.show] && elementCache[bindingAttrs.show].length) {
          elementCache[bindingAttrs.show].forEach(cache => {
            showBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
          });
        } // apply switch Binding


        if (updateOption.switchBinding && elementCache[bindingAttrs.switch] && elementCache[bindingAttrs.switch].length) {
          elementCache[bindingAttrs.switch].forEach(cache => {
            switchBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
          });
        } // apply text binding


        if (updateOption.textBinding && elementCache[bindingAttrs.text] && elementCache[bindingAttrs.text].length) {
          elementCache[bindingAttrs.text].forEach(cache => {
            textBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
          });
        } // apply cssBinding


        if (updateOption.cssBinding && elementCache[bindingAttrs.css] && elementCache[bindingAttrs.css].length) {
          elementCache[bindingAttrs.css].forEach(cache => {
            cssBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
          });
        } // apply model binding


        if (updateOption.modelBinding && elementCache[bindingAttrs.model] && elementCache[bindingAttrs.model].length) {
          elementCache[bindingAttrs.model].forEach(cache => {
            modelBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
          });
        } // apply change binding


        if (updateOption.changeBinding && elementCache[bindingAttrs.change] && elementCache[bindingAttrs.change].length) {
          elementCache[bindingAttrs.change].forEach(cache => {
            changeBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
          });
        } // apply submit binding


        if (updateOption.submitBinding && elementCache[bindingAttrs.submit] && elementCache[bindingAttrs.submit].length) {
          elementCache[bindingAttrs.submit].forEach(cache => {
            createEventBinding({
              cache,
              forceRender: updateOption.forceRender,
              type: 'submit',
              viewModel
            });
          });
        } // apply click binding


        if (updateOption.clickBinding && elementCache[bindingAttrs.click] && elementCache[bindingAttrs.click].length) {
          elementCache[bindingAttrs.click].forEach(cache => {
            createEventBinding({
              cache,
              forceRender: updateOption.forceRender,
              type: 'click',
              viewModel
            });
          });
        } // apply double click binding


        if (updateOption.dblclickBinding && elementCache[bindingAttrs.dblclick] && elementCache[bindingAttrs.dblclick].length) {
          elementCache[bindingAttrs.dblclick].forEach(cache => {
            createEventBinding({
              cache,
              forceRender: updateOption.forceRender,
              type: 'dblclick',
              viewModel
            });
          });
        } // apply blur binding


        if (updateOption.blurBinding && elementCache[bindingAttrs.blur] && elementCache[bindingAttrs.blur].length) {
          elementCache[bindingAttrs.blur].forEach(cache => {
            createEventBinding({
              cache,
              forceRender: updateOption.forceRender,
              type: 'blur',
              viewModel
            });
          });
        } // apply focus binding


        if (updateOption.focusBinding && elementCache[bindingAttrs.focus] && elementCache[bindingAttrs.focus].length) {
          elementCache[bindingAttrs.focus].forEach(cache => {
            createEventBinding({
              cache,
              forceRender: updateOption.forceRender,
              type: 'focus',
              viewModel
            });
          });
        } // apply hover binding


        if (updateOption.hoverBinding && elementCache[bindingAttrs.hover] && elementCache[bindingAttrs.hover].length) {
          elementCache[bindingAttrs.hover].forEach(cache => {
            hoverBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
          });
        }
      }

      static postProcess(tasks) {
        if (!tasks || !tasks.length) {
          return;
        }

        each(tasks, (index, task) => {
          if (typeof task === 'function') {
            try {
              task();
            } catch (err) {
              throwErrorMessage(err, 'Error postProcess: ' + String(task));
            }
          }
        });
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

    const renderTemplatesBinding = ({
      ctx,
      elementCache,
      updateOption,
      bindingAttrs,
      viewModel
    }) => {
      if (!elementCache || !bindingAttrs) {
        return false;
      } // render and apply binding to template(s) and forOf DOM


      if (elementCache[bindingAttrs.tmp] && elementCache[bindingAttrs.tmp].length) {
        // when re-render call with {templateBinding: true}
        // template and nested templates
        if (updateOption.templateBinding) {
          // overwrite updateOption with 'init' bindingUpdateConditions
          updateOption = createBindingOption(bindingUpdateConditions.init);
          elementCache[bindingAttrs.tmp].forEach($element => {
            renderTemplate($element, viewModel, bindingAttrs, elementCache);
          }); // update cache after all template(s) rendered

          ctx.updateElementCache({
            templateCache: true,
            elementCache: elementCache,
            isRenderedTemplates: true
          });
        } // enforce render even element is not in DOM tree


        updateOption.forceRender = true; // apply bindings to rendered templates element

        elementCache[bindingAttrs.tmp].forEach(cache => {
          Binder.applyBinding({
            elementCache: cache.bindingCache,
            updateOption: updateOption,
            bindingAttrs: bindingAttrs,
            viewModel: viewModel
          });
        });
      }

      return true;
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
        submitBinding: true
      }; // this is visualBindingOptions but everything false
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
          updateOption = extend({}, eventsBindingOptions, serverRenderedOptions, opt);
          break;

        case bindingUpdateConditions.init:
          // flag templateBinding to true to render tempalte(s)
          opt.templateBinding = true;
          updateOption = extend({}, visualBindingOptions, eventsBindingOptions, opt);
          break;

        default:
          // when called again only update visualBinding options
          updateOption = extend({}, visualBindingOptions, opt);
      }

      return updateOption;
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
      const bindingUpdateOption = isRegenerate ? createBindingOption(bindingUpdateConditions.init) : createBindingOption(); // enforce render even element is not in DOM tree

      bindingUpdateOption.forceRender = true; // render and apply binding to template(s)
      // this is an share function therefore passing current APP 'this' context
      // viewModel is a dynamic generated iterationVm

      renderTemplatesBinding({
        ctx: iterationVm.$root ? iterationVm.$root.APP : iterationVm.APP,
        elementCache: elementCache,
        updateOption: bindingUpdateOption,
        bindingAttrs: bindingAttrs,
        viewModel: iterationVm
      });
      Binder.applyBinding({
        elementCache: elementCache,
        updateOption: bindingUpdateOption,
        bindingAttrs: bindingAttrs,
        viewModel: iterationVm
      });
    };

    const createEventBinding = ({
      cache = {},
      forceRender = false,
      type = '',
      viewModel = {}
    }) => {
      const handlerName = cache.dataKey;
      let paramList = cache.parameters;
      let viewModelContext;
      const APP = viewModel.APP || viewModel.$root.APP;

      if (!type || !handlerName || !forceRender && !APP.$rootElement.contains(cache.el)) {
        return;
      }

      const handlerFn = getViewModelValue(viewModel, handlerName);

      if (typeof handlerFn === 'function') {
        viewModelContext = resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? resolveParamList(viewModel, paramList) : [];

        const handlerWrap = e => {
          const args = [e, e.currentTarget].concat(paramList);
          handlerFn.apply(viewModelContext, args);
        };

        cache.el.removeEventListener(type, handlerWrap, false);
        cache.el.addEventListener(type, handlerWrap, false);
      }
    };

    let bindingAttrs$1 = bindingAttrs;
    let templateSettings$1 = templateSettings;

    const use = (settings = {}) => {
      if (settings.bindingAttrs) {
        bindingAttrs$1 = $.extend({}, settings.bindingAttrs);
      }

      if (settings.templateSettings) {
        templateSettings$1 = $.extend({}, settings.templateSettings);
      }
    };

    const init = ($rootElement, viewModel = null) => {
      _.templateSettings = templateSettings$1;
      return new Binder($rootElement, viewModel, bindingAttrs$1);
    }; // expose to global


    window.dataBind = {
      use: use,
      init: init,
      version: '@version@'
    };

}());
