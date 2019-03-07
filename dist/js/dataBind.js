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

    var bindingAttrs = {
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
      "if": 'data-jq-if',
      "switch": 'data-jq-switch',
      "case": 'data-jq-case',
      "default": 'data-jq-default'
    };
    var serverRenderedAttr = 'data-server-rendered';
    var dataIndexAttr = 'data-index';
    var commentPrefix = {
      forOf: 'data-forOf_',
      "if": 'data-if_',
      "case": 'data-case_',
      "default": 'data-default_'
    };
    var commentSuffix = '_end'; // global setting of underscore template inteprolate default token

    var templateSettings = {
      evaluate: /<%([\s\S]+?)%>/g,
      interpolate: /\{\{=(.+?)\}\}/g,
      escape: /\{\{(.+?)\}\}/g
    };
    var bindingDataReference = {
      rootDataKey: '$root',
      currentData: '$data',
      currentIndex: '$index',
      mouseEnterHandlerName: 'in',
      mouseLeaveHandlerName: 'out'
    };
    var bindingUpdateConditions = {
      serverRendered: 'SERVER-RENDERED',
      init: 'INIT'
    }; // maximum string length before running regex

    var maxDatakeyLength = 50;
    var constants = {
      filters: {
        ONCE: 'once'
      },
      PARENT_REF: '_parent'
    };

    function _typeof(obj) {
      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function (obj) {
          return typeof obj;
        };
      } else {
        _typeof = function (obj) {
          return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
      }

      return _typeof(obj);
    }

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      return Constructor;
    }

    _ = window._ || {};
    var hasIsArray = Array.isArray;
    var supportPromise = typeof window['Promise'] === 'function';
    var REGEX = {
      FUNCTIONPARAM: /\((.*?)\)/,
      WHITESPACES: /\s+/g,
      FOROF: /(.*?)\s+(?:in|of)\s+(.*)/,
      PIPE: /\|/
    };

    var isArray = function isArray(obj) {
      return hasIsArray ? Array.isArray(obj) : Object.prototype.toString.call(obj) === '[object Array]';
    };

    var isJsObject = function isJsObject(obj) {
      return obj !== null && _typeof(obj) === 'object' && Object.prototype.toString.call(obj) === '[object Object]';
    };

    var isPlainObject = function isPlainObject(obj) {
      if (!isJsObject(obj)) {
        return false;
      } // If has modified constructor


      var ctor = obj.constructor;
      if (typeof ctor !== 'function') return false; // If has modified prototype

      var prot = ctor.prototype;
      if (isJsObject(prot) === false) return false; // If constructor does not have an Object-specific method

      if (prot.hasOwnProperty('isPrototypeOf') === false) {
        return false;
      } // Most likely a plain Object


      return true;
    };

    var isEmptyObject = function isEmptyObject(obj) {
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


    var getViewModelValue = function getViewModelValue(viewModel, prop) {
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


    var setViewModelValue = function setViewModelValue(obj, prop, value) {
      return _.set(obj, prop, value);
    };

    var getViewModelPropValue = function getViewModelPropValue(viewModel, bindingCache) {
      var dataKey = bindingCache.dataKey;
      var paramList = bindingCache.parameters;
      var isInvertBoolean = dataKey.charAt(0) === '!';

      if (isInvertBoolean) {
        dataKey = isInvertBoolean ? dataKey.substring(1) : dataKey;
      }

      var ret = getViewModelValue(viewModel, dataKey);

      if (typeof ret === 'function') {
        var viewModelContext = resolveViewModelContext(viewModel, dataKey);
        var oldViewModelProValue = bindingCache.elementData ? bindingCache.elementData.viewModelProValue : null;
        paramList = paramList ? resolveParamList(viewModel, paramList) : []; // let args = [oldViewModelProValue, bindingCache.el].concat(paramList);

        var args = paramList.concat([oldViewModelProValue, bindingCache.el]);
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

    var filtersViewModelPropValue = function filtersViewModelPropValue(_ref) {
      var value = _ref.value,
          viewModel = _ref.viewModel,
          bindingCache = _ref.bindingCache;
      var ret = value;

      if (bindingCache.filters) {
        each(bindingCache.filters, function (index, filter) {
          var viewModelContext = resolveViewModelContext(viewModel, filter);
          var filterFn = getViewModelValue.call(viewModelContext, viewModelContext, filter);

          try {
            ret = filterFn.call(viewModelContext, ret);
          } catch (err) {
            throwErrorMessage(err, "Invalid filter: ".concat(filter));
          }
        });
      }

      return ret;
    };

    var parseStringToJson = function parseStringToJson(str) {
      // fix unquote or single quote keys and replace single quote to double quote
      var ret = str.replace(/(\s*?{\s*?|\s*?,\s*?)(['"])?([a-zA-Z0-9]+)(['"])?:/g, '$1"$3":').replace(/'/g, '"');
      return JSON.parse(ret);
    };
    /**
     * arrayRemoveMatch
     * @description remove match items in fromArray out of toArray
     * @param {array} toArray
     * @param {array} frommArray
     * @return {boolean}
     */


    var arrayRemoveMatch = function arrayRemoveMatch(toArray, frommArray) {
      return toArray.filter(function (value, index) {
        return frommArray.indexOf(value) < 0;
      });
    };

    var getFormData = function getFormData($form) {
      var sArray = $form.serializeArray();
      var data = {};
      sArray.map(function (n) {
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


    var getFunctionParameterList = function getFunctionParameterList(str) {
      if (!str || str.length > maxDatakeyLength) {
        return;
      }

      var paramlist = str.match(REGEX.FUNCTIONPARAM);

      if (paramlist && paramlist[1]) {
        paramlist = paramlist[1].split(',');
        paramlist.forEach(function (v, i) {
          paramlist[i] = v.trim();
        });
      }

      return paramlist;
    };

    var extractFilterList = function extractFilterList(cacheData) {
      if (!cacheData || !cacheData.dataKey || cacheData.dataKey.length > maxDatakeyLength) {
        return cacheData;
      }

      var filterList = cacheData.dataKey.split(REGEX.PIPE);
      var isOnceIndex;
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

    var invertObj = function invertObj(sourceObj) {
      return Object.keys(sourceObj).reduce(function (obj, key) {
        obj[sourceObj[key]] = key;
        return obj;
      }, {});
    };

    var createDeferredObj = function createDeferredObj() {
      var dfObj = {};

      if (supportPromise) {
        dfObj.promise = new Promise(function (resolve, reject) {
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


    var debounceRaf = function debounceRaf(fn) {
      var ctx = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      return function (fn, ctx) {
        var dfObj = createDeferredObj();
        var rafId = 0; // return decorated fn

        return function () {
          /* eslint-disable prefer-rest-params */
          var args = Array.from ? Array.from(arguments) : Array.prototype.slice.call(arguments);
          window.cancelAnimationFrame(rafId);
          rafId = window.requestAnimationFrame(function () {
            try {
              // fn is Binder.render function
              fn.apply(ctx, args); // dfObj.resolve is function provided in .then promise chain
              // ctx is the current component

              dfObj.resolve(ctx);
            } catch (err) {
              dfObj.reject(ctx, err);
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


    var extend = function extend() {
      var isDeepMerge = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var target = arguments.length > 1 ? arguments[1] : undefined;

      for (var _len = arguments.length, sources = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        sources[_key - 2] = arguments[_key];
      }

      if (!sources.length) {
        return target;
      }

      var source = sources.shift();

      if (source === undefined) {
        return target;
      }

      if (!isDeepMerge) {
        return Object.assign.apply(Object, [target].concat(sources));
      }

      if (isMergebleObject(target) && isMergebleObject(source)) {
        Object.keys(source).forEach(function (key) {
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

      return extend.apply(void 0, [true, target].concat(sources));
    };

    var each = function each(obj, fn) {
      if (_typeof(obj) !== 'object' || typeof fn !== 'function') {
        return;
      }

      var keys = [];
      var keysLength = 0;
      var isArrayObj = isArray(obj);
      var key;
      var value;
      var i = 0;

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

    var isMergebleObject = function isMergebleObject(item) {
      return isJsObject(item) && !isArray(item);
    };
    /**
     * cloneDomNode
     * @param {object} element
     * @return {object} cloned element
     * @description helper function to clone node
     */


    var cloneDomNode = function cloneDomNode(element) {
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


    var insertAfter = function insertAfter(parentNode, newNode, referenceNode) {
      var refNextElement = referenceNode && referenceNode.nextSibling ? referenceNode.nextSibling : null;
      return parentNode.insertBefore(newNode, refNextElement);
    };

    var resolveViewModelContext = function resolveViewModelContext(viewModel, datakey) {
      var ret = viewModel;

      if (typeof datakey !== 'string') {
        return ret;
      }

      var bindingDataContext = datakey.split('.');

      if (bindingDataContext.length > 1) {
        if (bindingDataContext[0] === bindingDataReference.rootDataKey) {
          ret = viewModel[bindingDataReference.rootDataKey] || viewModel;
        } else if (bindingDataContext[0] === bindingDataReference.currentData) {
          ret = viewModel[bindingDataReference.currentData] || viewModel;
        }
      }

      return ret;
    };

    var resolveParamList = function resolveParamList(viewModel, paramList) {
      if (!viewModel || !isArray(paramList)) {
        return;
      }

      return paramList.map(function (param) {
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

    var removeElement = function removeElement(el) {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    };

    var throwErrorMessage = function throwErrorMessage() {
      var err = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var errorMessage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var message = err && err.message ? err.message : errorMessage;

      if (typeof console.error === 'function') {
        return console.error(message);
      }

      return console.log(message);
    };

    var $domFragment = null;
    var $templateRoot = null;
    var nestTemplatesCount = 0;
    var templateCache = {};
    /**
     * compileTemplate
     * @description compile underscore template and store in templateCache
     * @param {string} id
     * @param {object} templateData
     * @return {string} rendered html string
     */

    var compileTemplate = function compileTemplate(id) {
      var templateData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var templateString;
      var templateElement;

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


    var renderTemplate = function renderTemplate(cache, viewModel, bindingAttrs$$1, elementCache) {
      var settings = typeof cache.dataKey === 'string' ? parseStringToJson(cache.dataKey) : cache.dataKey;
      var viewData = settings.data;
      var isAppend = settings.append;
      var isPrepend = settings.prepend;
      var $currentElement;
      cache.dataKey = settings;
      viewData = typeof viewData === 'undefined' || viewData === '$root' ? viewModel : getViewModelPropValue(viewModel, {
        dataKey: settings.data,
        parameters: cache.parameters
      });

      if (!viewData) {
        return;
      }

      var $element = $(cache.el);
      var $index = typeof viewModel.$index !== 'undefined' ? viewModel.$index : $element.attr(dataIndexAttr);

      if (typeof $index !== 'undefined') {
        viewData.$index = $index;
      }

      $domFragment = $domFragment ? $domFragment : $('<div/>');
      $templateRoot = $templateRoot ? $templateRoot : $element;
      var html = compileTemplate(settings.id, viewData); // domFragment should be empty in first run
      // append rendered html

      if (!$domFragment.children().length) {
        $currentElement = $domFragment;
        $domFragment.append(html);
      } else {
        $currentElement = $element;

        if (!isAppend && !isPrepend) {
          $currentElement.empty();
        }

        if (isPrepend) {
          $currentElement.prepend(html);
        } else {
          $currentElement.append(html);
        }
      } // check if there are nested template then recurisive render them


      var $nestedTemplates = $currentElement.find('[' + bindingAttrs$$1.tmp + ']');

      if ($nestedTemplates.length) {
        nestTemplatesCount += $nestedTemplates.length;
        $nestedTemplates.each(function (index, element) {
          var thisTemplateCache = {
            el: element,
            dataKey: element.getAttribute(bindingAttrs$$1.tmp)
          };
          elementCache[bindingAttrs$$1.tmp].push(thisTemplateCache); // recursive template render

          renderTemplate(thisTemplateCache, viewModel, bindingAttrs$$1, elementCache);
          nestTemplatesCount -= 1;
        });
      } // no more nested tempalted to render, start to append $domFragment into $templateRoot


      if (nestTemplatesCount === 0) {
        // append to DOM once
        if (!isAppend && !isPrepend) {
          $templateRoot.empty();
        }

        if (isPrepend) {
          $templateRoot.prepend($domFragment.html());
        } else {
          $templateRoot.append($domFragment.html());
        } // clear cached fragment


        $domFragment = $templateRoot = null; // trigger callback if provided

        if (typeof viewModel.afterTemplateRender === 'function') {
          viewModel.afterTemplateRender(viewData);
        }
      }
    };

    /* eslint-disable no-invalid-this */
    /**
     * clickBinding
     * @description
     * DOM decleartive click event binding
     * event handler bind to viewModel method according to the DOM attribute
     * @param {object} cache
     * @param {object} viewModel
     * @param {object} bindingAttrs
     * @param {boolean} forceRender
     */

    var clickBinding = function clickBinding(cache, viewModel, bindingAttrs, forceRender) {
      var handlerName = cache.dataKey;
      var paramList = cache.parameters;
      var viewModelContext;
      var APP = viewModel.APP || viewModel.$root.APP;

      if (!handlerName || !forceRender && !APP.$rootElement.contains(cache.el)) {
        return;
      }

      var handlerFn = getViewModelValue(viewModel, handlerName);

      if (typeof handlerFn === 'function') {
        viewModelContext = resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? resolveParamList(viewModel, paramList) : [];
        $(cache.el).off('click.databind').on('click.databind', function (e) {
          var args = [e, $(this)].concat(paramList);
          handlerFn.apply(viewModelContext, args);
        });
      }
    };

    /* eslint-disable no-invalid-this */
    /**
     * dblclickBinding
     * DOM decleartive double click event binding
     * event handler bind to viewModel method according to the DOM attribute
     * @param {object} cache
     * @param {object} viewModel
     * @param {object} bindingAttrs
     * @param {boolean} forceRender
     */

    var dblclickBinding = function dblclickBinding(cache, viewModel, bindingAttrs, forceRender) {
      var handlerName = cache.dataKey;
      var paramList = cache.parameters;
      var viewModelContext;
      var APP = viewModel.APP || viewModel.$root.APP;

      if (!handlerName || !forceRender && !APP.$rootElement.contains(cache.el)) {
        return;
      }

      var handlerFn = getViewModelValue(viewModel, handlerName);

      if (typeof handlerFn === 'function') {
        viewModelContext = resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? resolveParamList(viewModel, paramList) : [];
        $(cache.el).off('dblclick.databind').on('dblclick.databind', function (e) {
          var args = [e, $(this)].concat(paramList);
          handlerFn.apply(viewModelContext, args);
        });
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

    var blurBinding = function blurBinding(cache, viewModel, bindingAttrs, forceRender) {
      var handlerName = cache.dataKey;
      var paramList = cache.parameters;
      var viewModelContext;
      var APP = viewModel.APP || viewModel.$root.APP;

      if (!handlerName || !forceRender && !APP.$rootElement.contains(cache.el)) {
        return;
      }

      var handlerFn = getViewModelValue(viewModel, handlerName);

      if (typeof handlerFn === 'function') {
        viewModelContext = resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? resolveParamList(viewModel, paramList) : [];
        $(cache.el).off('blur.databind').on('blur.databind', function (e) {
          var args = [e, $(this)].concat(paramList);
          handlerFn.apply(viewModelContext, args);
        });
      }
    };

    /* eslint-disable no-invalid-this */
    /**
     * focusBinding
     * DOM decleartive on focus event binding
     * event handler bind to viewModel method according to the DOM attribute
     * @param {object} cache
     * @param {object} viewModel
     * @param {object} bindingAttrs
     * @param {boolean} forceRender
     */

    var focusBinding = function focusBinding(cache, viewModel, bindingAttrs, forceRender) {
      var handlerName = cache.dataKey;
      var paramList = cache.parameters;
      var viewModelContext;
      var APP = viewModel.APP || viewModel.$root.APP;

      if (!handlerName || !forceRender && !APP.$rootElement.contains(cache.el)) {
        return;
      }

      var handlerFn = getViewModelValue(viewModel, handlerName);

      if (typeof handlerFn === 'function') {
        viewModelContext = resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? resolveParamList(viewModel, paramList) : [];
        $(cache.el).off('focus.databind').on('focus.databind', function (e) {
          var args = [e, $(this)].concat(paramList);
          handlerFn.apply(viewModelContext, args);
        });
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

    var hoverBinding = function hoverBinding(cache, viewModel, bindingAttrs$$1, forceRender) {
      var handlerName = cache.dataKey;
      var paramList = cache.parameters;
      var inHandlerName = bindingDataReference.mouseEnterHandlerName;
      var outHandlerName = bindingDataReference.mouseLeaveHandlerName;
      var viewModelContext;
      var APP = viewModel.APP || viewModel.$root.APP;
      cache.elementData = cache.elementData || {};

      if (!handlerName || !forceRender && !APP.$rootElement.contains(cache.el)) {
        return;
      }

      var handlers = getViewModelValue(viewModel, handlerName);

      if (handlers && typeof handlers[inHandlerName] === 'function' && typeof handlers[outHandlerName] === 'function') {
        viewModelContext = resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? resolveParamList(viewModel, paramList) : [];
        $(cache.el).off('mouseenter.databind mouseleave.databind').hover(function enter(e) {
          var args = [e, cache.el].concat(paramList);
          handlers[inHandlerName].apply(viewModelContext, args);
        }, function leave(e) {
          var args = [e, cache.el].concat(paramList);
          handlers[outHandlerName].apply(viewModelContext, args);
        });
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

    var changeBinding = function changeBinding(cache, viewModel, bindingAttrs, forceRender) {
      var handlerName = cache.dataKey;
      var paramList = cache.parameters;
      var modelDataKey = cache.el.getAttribute(bindingAttrs.model);
      var newValue = '';
      var oldValue = '';
      var viewModelContext;
      var APP = viewModel.APP || viewModel.$root.APP;

      if (!handlerName || !forceRender && !APP.$rootElement.contains(cache.el)) {
        return;
      }

      var handlerFn = getViewModelValue(viewModel, handlerName);

      if (typeof handlerFn === 'function') {
        viewModelContext = resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? resolveParamList(viewModel, paramList) : []; // assing on change event

        $(cache.el).off('change.databind').on('change.databind', function (e) {
          var $this = $(this);
          var isCheckbox = $this.is(':checkbox');
          newValue = isCheckbox ? $this.prop('checked') : _.escape($this.val()); // set data to viewModel

          if (modelDataKey) {
            oldValue = getViewModelValue(viewModel, modelDataKey);
            setViewModelValue(viewModel, modelDataKey, newValue);
          }

          var args = [e, $this, newValue, oldValue].concat(paramList);
          handlerFn.apply(viewModelContext, args);
          oldValue = newValue;
        });
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

    var modelBinding = function modelBinding(cache, viewModel, bindingAttrs, forceRender) {
      var dataKey = cache.dataKey;
      var newValue = '';
      var APP = viewModel.APP || viewModel.$root.APP;

      if (!dataKey || !forceRender && !APP.$rootElement.contains(cache.el)) {
        return;
      }

      newValue = getViewModelValue(viewModel, dataKey);

      if (typeof newValue !== 'undefined' && newValue !== null) {
        var $element = $(cache.el);
        var isCheckbox = $element.is(':checkbox');
        var isRadio = $element.is(':radio');
        var inputName = $element[0].name;
        var $radioGroup = isRadio ? $('input[name="' + inputName + '"]') : null;
        var oldValue = isCheckbox ? $element.prop('checked') : $element.val(); // update element value

        if (newValue !== oldValue) {
          if (isCheckbox) {
            $element.prop('checked', Boolean(newValue));
          } else if (isRadio) {
            $radioGroup.val([newValue]);
          } else {
            $element.val(newValue);
          }
        }
      }
    };

    /**
     * submitBinding
     * @description on form submit binding. pass current form data as json object to handler
     * @param {object} cache
     * @param {object} viewModel
     * @param {object} bindingAttrs
     * @param {boolean} forceRender
     */

    var submitBinding = function submitBinding(cache, viewModel, bindingAttrs, forceRender) {
      var handlerName = cache.dataKey;
      var paramList = cache.parameters;
      var viewModelContext;
      var APP = viewModel.APP || viewModel.$root.APP;

      if (!handlerName || !forceRender && !APP.$rootElement.contains(cache.el)) {
        return;
      }

      var handlerFn = getViewModelValue(viewModel, handlerName);
      var $element = $(cache.el);

      if (typeof handlerFn === 'function') {
        viewModelContext = resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? resolveParamList(viewModel, paramList) : []; // assing on change event

        $element.off('submit.databind').on('submit.databind', function (e) {
          var args = [e, $element, getFormData($element)].concat(paramList);
          handlerFn.apply(viewModelContext, args);
        });
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

    var textBinding = function textBinding(cache, viewModel, bindingAttrs, forceRender) {
      var dataKey = cache.dataKey;
      var APP = viewModel.APP || viewModel.$root.APP; // NOTE: this doesn't work for for-of, if and switch bindings because element was not in DOM

      if (!dataKey || !forceRender && !APP.$rootElement.contains(cache.el)) {
        return;
      }

      var newValue = getViewModelPropValue(viewModel, cache);
      var oldValue = cache.el.textContent;

      if (typeof newValue !== 'undefined' && _typeof(newValue) !== 'object' && newValue !== null) {
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

    var showBinding = function showBinding(cache, viewModel, bindingAttrs) {
      var dataKey = cache.dataKey;
      var currentInlineSytle = {};
      var currentInlineDisplaySytle = '';
      var shouldShow = true;

      if (!dataKey) {
        return;
      }

      cache.elementData = cache.elementData || {};
      var oldShowStatus = cache.elementData.viewModelPropValue; // store current element display default style once only

      if (typeof cache.elementData.displayStyle === 'undefined' || typeof cache.elementData.computedStyle === 'undefined') {
        currentInlineSytle = cache.el.style;
        currentInlineDisplaySytle = currentInlineSytle.display; // use current inline style if defined

        if (currentInlineDisplaySytle) {
          // set to 'block' if is 'none'
          cache.elementData.displayStyle = currentInlineDisplaySytle === 'none' ? 'block' : currentInlineDisplaySytle;
          cache.elementData.computedStyle = null;
        } else {
          var computeStyle = window.getComputedStyle(cache.el, null).getPropertyValue('display');
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

    var cssBinding = function cssBinding(cache, viewModel, bindingAttrs, forceRender) {
      var dataKey = cache.dataKey;
      var APP = viewModel.APP || viewModel.$root.APP;

      if (!dataKey || !forceRender && !APP.$rootElement.contains(cache.el)) {
        return;
      }

      cache.elementData = cache.elementData || {};
      cache.elementData.viewModelPropValue = cache.elementData.viewModelPropValue || ''; // let $element = $(cache.el);

      var oldCssList = cache.elementData.viewModelPropValue;
      var newCssList = '';
      var vmCssListObj = getViewModelPropValue(viewModel, cache);
      var vmCssListArray = [];
      var isViewDataObject = false;
      var isViewDataString = false;
      var cssList = [];

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


      var domCssList = cache.el.classList; // clone domCssList as new array

      var domCssListLength = domCssList.length;

      for (var i = 0; i < domCssListLength; i += 1) {
        cssList.push(domCssList[i]);
      }

      if (isViewDataObject) {
        each(vmCssListObj, function (k, v) {
          var i = cssList.indexOf(k);

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


      cssList = cssList.filter(function (v, i, a) {
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

    var attrBinding = function attrBinding(cache, viewModel, bindingAttrs) {
      var dataKey = cache.dataKey;

      if (!dataKey) {
        return;
      }

      cache.elementData = cache.elementData || {};
      cache.elementData.viewModelProValue = cache.elementData.viewModelProValue || {};
      var oldAttrObj = cache.elementData.viewModelProValue;
      var vmAttrObj = getViewModelPropValue(viewModel, cache);

      if (!isPlainObject(vmAttrObj)) {
        return;
      } // reject if nothing changed


      if (JSON.stringify(oldAttrObj) === JSON.stringify(vmAttrObj)) {
        return;
      } // reset old data and update it


      cache.elementData.viewModelProValue = {};

      if (isEmptyObject(oldAttrObj)) {
        each(vmAttrObj, function (key, value) {
          cache.el.setAttribute(key, value); // populate with vmAttrObj data

          cache.elementData.viewModelProValue[key] = value;
        });
      } else {
        each(oldAttrObj, function (key, value) {
          if (typeof vmAttrObj[key] === 'undefined') {
            // remove attribute if not present in current vm
            cache.el.removeAttribute(key);
          }
        });
        each(vmAttrObj, function (key, value) {
          if (oldAttrObj[key] !== vmAttrObj[key]) {
            // update attribute if value changed
            cache.el.setAttribute(key, vmAttrObj[key]);
          } // populate with vmAttrObj data


          cache.elementData.viewModelProValue[key] = value;
        });
      }
    };

    var bindingAttrsMap;
    /**
     * walkDOM
     * @description by Douglas Crockford - walk each DOM node and calls provided callback function
     * start walk from firstChild
     * @param {object} node
     * @param {function} func
     */

    var walkDOM = function walkDOM(node, func) {
      var parseChildNode = true;
      node = node.firstElementChild;

      while (node) {
        parseChildNode = func(node);

        if (parseChildNode) {
          walkDOM(node, func);
        }

        node = node.nextElementSibling;
      }
    };

    var getAttributesObject = function getAttributesObject(node) {
      var ret = {};
      Array.prototype.slice.call(node.attributes).forEach(function (item) {
        ret[item.name] = item.value;
      });
      return ret;
    };

    var checkSkipChildParseBindings = function checkSkipChildParseBindings() {
      var attrObj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var bindingAttrs$$1 = arguments.length > 1 ? arguments[1] : undefined;
      return [bindingAttrs$$1.forOf, bindingAttrs$$1["if"], bindingAttrs$$1["case"], bindingAttrs$$1["default"]].filter(function (type) {
        return typeof attrObj[type] !== 'undefined';
      });
    };

    var rootSkipCheck = function rootSkipCheck(node) {
      return node.tagName === 'SVG';
    };

    var defaultSkipCheck = function defaultSkipCheck(node, bindingAttrs$$1) {
      return node.tagName === 'SVG' || node.hasAttribute(bindingAttrs$$1.comp);
    };

    var populateBindingCache = function populateBindingCache(_ref) {
      var node = _ref.node,
          attrObj = _ref.attrObj,
          bindingCache = _ref.bindingCache,
          type = _ref.type;
      var attrValue;
      var cacheData;

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

        var paramList = getFunctionParameterList(cacheData.dataKey);

        if (paramList) {
          cacheData.parameters = paramList;
          cacheData.dataKey = cacheData.dataKey.replace(REGEX.FUNCTIONPARAM, '').trim();
        } // store parent array reference to cacheData


        cacheData[constants.PARENT_REF] = bindingCache[type];
        bindingCache[type].push(cacheData);
      }

      return bindingCache;
    };

    var createBindingCache = function createBindingCache(_ref2) {
      var _ref2$rootNode = _ref2.rootNode,
          rootNode = _ref2$rootNode === void 0 ? null : _ref2$rootNode,
          _ref2$bindingAttrs = _ref2.bindingAttrs,
          bindingAttrs$$1 = _ref2$bindingAttrs === void 0 ? {} : _ref2$bindingAttrs,
          skipCheck = _ref2.skipCheck,
          _ref2$isRenderedTempl = _ref2.isRenderedTemplate,
          isRenderedTemplate = _ref2$isRenderedTempl === void 0 ? false : _ref2$isRenderedTempl;
      var bindingCache = {};

      if (!rootNode instanceof window.Node) {
        throw new TypeError('walkDOM: Expected a DOM node');
      }

      bindingAttrsMap = bindingAttrsMap || invertObj(bindingAttrs$$1);

      var parseNode = function parseNode(node) {
        var skipNodeCheckFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultSkipCheck;
        var isSkipForOfChild = false;

        if (node.nodeType !== 1 || !node.hasAttributes()) {
          return true;
        }

        if (skipNodeCheckFn(node, bindingAttrs$$1) || typeof skipCheck === 'function' && skipCheck(node)) {
          return false;
        } // when creating sub bindingCache if is for tmp binding
        // skip same element that has forOf binding the  forOf is alredy parsed


        var attrObj = getAttributesObject(node);
        var hasSkipChildParseBindings = checkSkipChildParseBindings(attrObj, bindingAttrs$$1);
        var iterateList = [];

        if (hasSkipChildParseBindings.length) {
          isSkipForOfChild = true;
          iterateList = hasSkipChildParseBindings;
        } else if (isRenderedTemplate && attrObj[bindingAttrs$$1.tmp]) {
          // skip current node parse if was called by node has template binding and already rendered
          return true;
        } else {
          iterateList = Object.keys(attrObj);
        }

        iterateList.forEach(function (key) {
          // skip for switch case and default bining
          if (key !== bindingAttrs$$1["case"] && key !== bindingAttrs$$1["default"]) {
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

    var createClonedElementCache = function createClonedElementCache(bindingData) {
      var clonedElement = bindingData.el.cloneNode(true);
      bindingData.fragment = document.createDocumentFragment();
      bindingData.fragment.appendChild(clonedElement);
      return bindingData;
    };

    var setCommentPrefix = function setCommentPrefix(bindingData) {
      if (!bindingData || !bindingData.type) {
        return;
      }

      var commentPrefix$$1 = '';
      var dataKeyMarker = bindingData.dataKey ? bindingData.dataKey.replace(REGEX.WHITESPACES, '_') : '';

      switch (bindingData.type) {
        case bindingAttrs.forOf:
          commentPrefix$$1 = commentPrefix.forOf;
          break;

        case bindingAttrs["if"]:
          commentPrefix$$1 = commentPrefix["if"];
          break;

        case bindingAttrs["case"]:
          commentPrefix$$1 = commentPrefix["case"];
          break;

        case bindingAttrs["default"]:
          commentPrefix$$1 = commentPrefix["default"];
          break;
      }

      bindingData.commentPrefix = commentPrefix$$1 + dataKeyMarker;
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


    var setDocRangeEndAfter = function setDocRangeEndAfter(node, bindingData) {
      if (!bindingData.commentPrefix) {
        setCommentPrefix(bindingData);
      }

      var startTextContent = bindingData.commentPrefix;
      var endTextContent = startTextContent + commentSuffix;
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


    var wrapCommentAround = function wrapCommentAround(bindingData, node) {
      var prefix = '';

      if (!bindingData.commentPrefix) {
        setCommentPrefix(bindingData);
      }

      prefix = bindingData.commentPrefix;
      var commentBegin = document.createComment(prefix);
      var commentEnd = document.createComment(prefix + commentSuffix); // document fragment - logic for ForOf binding
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


    var removeElemnetsByCommentWrap = function removeElemnetsByCommentWrap(bindingData) {
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

    var insertRenderedElements = function insertRenderedElements(bindingData, fragment) {
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

    var renderForOfBinding = function renderForOfBinding(_ref) {
      var bindingData = _ref.bindingData,
          viewModel = _ref.viewModel,
          bindingAttrs$$1 = _ref.bindingAttrs;

      if (!bindingData || !viewModel || !bindingAttrs$$1) {
        return;
      }

      var keys;
      var iterationDataLength;
      var iterationData = getViewModelPropValue(viewModel, bindingData.iterator);
      var isRegenerate = false; // check iterationData and set iterationDataLength

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

        bindingData.el.removeAttribute(bindingAttrs$$1.forOf);
        isRegenerate = true;
      } else {
        // only regenerate cache if iterationDataLength changed
        isRegenerate = bindingData.iterationSize !== iterationDataLength; // update iterationSize

        bindingData.iterationSize = iterationDataLength;
      }

      if (!isRegenerate) {
        bindingData.iterationBindingCache.forEach(function (elementCache, i) {
          if (!isEmptyObject(elementCache)) {
            var iterationVm = createIterationViewModel({
              bindingData: bindingData,
              viewModel: viewModel,
              iterationData: iterationData,
              keys: keys,
              index: i
            });
            renderIteration({
              elementCache: elementCache,
              iterationVm: iterationVm,
              bindingAttrs: bindingAttrs$$1,
              isRegenerate: false
            });
          }
        });
        return;
      } // generate forOfBinding elements into fragment


      var fragment = generateForOfElements(bindingData, viewModel, bindingAttrs$$1, iterationData, keys);
      removeElemnetsByCommentWrap(bindingData); // insert fragment content into DOM

      return insertRenderedElements(bindingData, fragment);
    };

    var createIterationViewModel = function createIterationViewModel(_ref2) {
      var bindingData = _ref2.bindingData,
          viewModel = _ref2.viewModel,
          iterationData = _ref2.iterationData,
          keys = _ref2.keys,
          index = _ref2.index;
      var iterationVm = {};
      iterationVm[bindingData.iterator.alias] = keys ? iterationData[keys[index]] : iterationData[index]; // populate common binding data reference

      iterationVm[bindingDataReference.rootDataKey] = viewModel.$root || viewModel;
      iterationVm[bindingDataReference.currentData] = iterationVm[bindingData.iterator.alias];
      iterationVm[bindingDataReference.currentIndex] = index;
      return iterationVm;
    };

    var generateForOfElements = function generateForOfElements(bindingData, viewModel, bindingAttrs$$1, iterationData, keys) {
      var fragment = document.createDocumentFragment();
      var iterationDataLength = bindingData.iterationSize;
      var clonedItem;
      var iterationVm;
      var iterationBindingCache;
      var i = 0; // create or clear exisitng iterationBindingCache

      if (isArray(bindingData.iterationBindingCache)) {
        bindingData.iterationBindingCache.length = 0;
      } else {
        bindingData.iterationBindingCache = [];
      } // generate forOf and append to DOM


      for (i = 0; i < iterationDataLength; i += 1) {
        clonedItem = cloneDomNode(bindingData.el); // create bindingCache per iteration

        iterationBindingCache = createBindingCache({
          rootNode: clonedItem,
          bindingAttrs: bindingAttrs$$1
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
            bindingAttrs: bindingAttrs$$1,
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

    var forOfBinding = function forOfBinding(cache, viewModel, bindingAttrs$$1) {
      var dataKey = cache.dataKey;

      if (!dataKey || dataKey.length > maxDatakeyLength) {
        return;
      }

      if (!cache.iterator) {
        if (dataKey.length > maxDatakeyLength) {
          return;
        } // replace mess spaces with single space


        cache.dataKey = cache.dataKey.replace(REGEX.WHITESPACES, ' ');
        var forExpMatch = dataKey.match(REGEX.FOROF);

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
        bindingAttrs: bindingAttrs$$1
      });
    };

    /**
     * isTargetDomRemoved
     * @description check if DOM between 'start' and 'end' comment tag has been removed
     * @param {object} bindingData
     * @return {boolean}
     */

    var isTargetDomRemoved = function isTargetDomRemoved(bindingData) {
      var ret = false;

      if (bindingData && bindingData.previousNonTemplateElement) {
        var commentStartTextContent = bindingData.previousNonTemplateElement.textContent;
        var endCommentTag = bindingData.previousNonTemplateElement.nextSibling;

        if (endCommentTag.nodeType === 8) {
          if (endCommentTag.textContent === commentStartTextContent + commentSuffix) {
            ret = true;
          }
        }
      }

      return ret;
    };

    var renderIfBinding = function renderIfBinding(_ref) {
      var bindingData = _ref.bindingData,
          viewModel = _ref.viewModel,
          bindingAttrs$$1 = _ref.bindingAttrs;

      if (!bindingData.fragment) {
        return;
      }

      var isDomRemoved = isTargetDomRemoved(bindingData);
      var rootElement = bindingData.el; // remove current old DOM.
      // TODO: try preserve DOM

      if (!isDomRemoved && !bindingData.isOnce) {
        removeIfBinding(bindingData); // use fragment for create iterationBindingCache

        rootElement = bindingData.fragment.firstChild.cloneNode(true);
      } // walk clonedElement to create iterationBindingCache once


      if (!bindingData.iterationBindingCache || !bindingData.hasIterationBindingCache) {
        bindingData.iterationBindingCache = createBindingCache({
          rootNode: rootElement,
          bindingAttrs: bindingAttrs$$1
        });
      } // only render if has iterationBindingCache
      // means has other dataBindings to be render


      if (!isEmptyObject(bindingData.iterationBindingCache)) {
        bindingData.hasIterationBindingCache = true;
        renderIteration({
          elementCache: bindingData.iterationBindingCache,
          iterationVm: viewModel,
          bindingAttrs: bindingAttrs$$1,
          isRegenerate: true
        });
      } // insert to new rendered DOM
      // TODO: check unnecessary insertion when DOM is preserved


      insertRenderedElements(bindingData, rootElement);
    };

    var removeIfBinding = function removeIfBinding(bindingData) {
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

    var ifBinding = function ifBinding(cache, viewModel, bindingAttrs$$1) {
      var dataKey = cache.dataKey; // isOnce only return if there is no child bindings

      if (!dataKey || cache.isOnce && cache.hasIterationBindingCache === false) {
        return;
      }

      cache.elementData = cache.elementData || {};
      cache.type = cache.type || bindingAttrs["if"];
      var oldViewModelProValue = cache.elementData.viewModelPropValue; // getViewModelPropValue could be return undefined or null

      var viewModelPropValue = getViewModelPropValue(viewModel, cache) || false; // do nothing if viewModel value not changed and no child bindings

      if (oldViewModelProValue === viewModelPropValue && !cache.hasIterationBindingCache) {
        return;
      }

      var shouldRender = Boolean(viewModelPropValue); // remove this cache from parent array

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
        cache.el.removeAttribute(bindingAttrs$$1["if"]);
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
          bindingAttrs: bindingAttrs$$1
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

    var removeBindingInQueue = function removeBindingInQueue(_ref) {
      var viewModel = _ref.viewModel,
          cache = _ref.cache;
      var ret = false;

      if (viewModel.APP.postProcessQueue) {
        viewModel.APP.postProcessQueue.push(function (cache, index) {
          return function () {
            cache[constants.PARENT_REF].splice(index, 1);
          };
        }(cache, cache[constants.PARENT_REF].indexOf(cache)));
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

    var switchBinding = function switchBinding(cache, viewModel, bindingAttrs) {
      var dataKey = cache.dataKey;

      if (!dataKey) {
        return;
      }

      cache.elementData = cache.elementData || {};
      var newExpression = getViewModelPropValue(viewModel, cache);

      if (newExpression === cache.elementData.viewModelPropValue) {
        return;
      }

      cache.elementData.viewModelPropValue = newExpression; // build switch cases if not yet defined

      if (!cache.cases) {
        var childrenElements = cache.el.children;

        if (!childrenElements.length) {
          return;
        }

        cache.cases = [];

        for (var i = 0, elementLength = childrenElements.length; i < elementLength; i += 1) {
          var caseData = null;

          if (childrenElements[i].hasAttribute(bindingAttrs["case"])) {
            caseData = createCaseData(childrenElements[i], bindingAttrs["case"]);
          } else if (childrenElements[i].hasAttribute(bindingAttrs["default"])) {
            caseData = createCaseData(childrenElements[i], bindingAttrs["default"]);
            caseData.isDefault = true;
          } // create fragment by clone node
          // wrap with comment tag


          if (caseData) {
            wrapCommentAround(caseData, caseData.el); // remove binding attribute for later dataBind parse

            if (caseData.isDefault) {
              caseData.el.removeAttribute(bindingAttrs["default"]);
            } else {
              caseData.el.removeAttribute(bindingAttrs["case"]);
            }

            createClonedElementCache(caseData);
            cache.cases.push(caseData);
          }
        }
      }

      if (cache.cases.length) {
        var hasMatch = false; // do switch operation - reuse if binding logic

        for (var j = 0, casesLength = cache.cases.length; j < casesLength; j += 1) {
          var newCaseValue = void 0;

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
      cases.forEach(function (caseData, index) {
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
      var caseData = {
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

    var EVENTS = {};

    var subscribeEvent = function subscribeEvent() {
      var instance = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var eventName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var fn = arguments.length > 2 ? arguments[2] : undefined;
      var isOnce = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      if (!instance || !instance.compId || !eventName || typeof fn !== 'function') {
        return;
      }

      var subscriber;
      var isSubscribed = false;
      eventName = eventName.replace(REGEX.WHITESPACES, '');
      EVENTS[eventName] = EVENTS[eventName] || []; // check if already subscribed and update callback fn

      isSubscribed = EVENTS[eventName].some(function (subscriber) {
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

    var subscribeEventOnce = function subscribeEventOnce() {
      var instance = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var eventName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var fn = arguments.length > 2 ? arguments[2] : undefined;
      subscribeEvent(instance, eventName, fn, true);
    };

    var unsubscribeEvent = function unsubscribeEvent() {
      var compId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var eventName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      if (!compId || !eventName) {
        return;
      }

      var i = 0;
      var subscribersLength = 0;
      var subscriber;
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


    var unsubscribeAllEvent = function unsubscribeAllEvent() {
      var compId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      if (!compId) {
        return;
      }

      Object.keys(EVENTS).forEach(function (eventName) {
        unsubscribeEvent(compId, eventName);
      });
    };

    var publishEvent = function publishEvent() {
      var eventName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      if (!eventName || !EVENTS[eventName]) {
        return;
      }

      eventName = eventName.replace(REGEX.WHITESPACES, '');
      EVENTS[eventName].forEach(function (subscriber) {
        Object.keys(subscriber).forEach(function (compId) {
          if (typeof subscriber[compId] === 'function') {
            var ret = subscriber[compId].apply(subscriber, args);

            if (subscriber.isOnce) {
              unsubscribeEvent(compId, eventName);
            }

            return ret;
          }
        });
      });
    };

    var pubSub = /*#__PURE__*/Object.freeze({
        subscribeEvent: subscribeEvent,
        subscribeEventOnce: subscribeEventOnce,
        unsubscribeEvent: unsubscribeEvent,
        unsubscribeAllEvent: unsubscribeAllEvent,
        publishEvent: publishEvent
    });

    var compIdIndex = 0;

    var Binder =
    /*#__PURE__*/
    function () {
      function Binder($rootElement, viewModel, bindingAttrs$$1) {
        _classCallCheck(this, Binder);

        if ($rootElement instanceof window.jQuery && $rootElement.length) {
          $rootElement = $rootElement.eq(0)[0];
        }

        if (!$rootElement || $rootElement.nodeType !== 1 || viewModel === null || _typeof(viewModel) !== 'object') {
          throw new TypeError('$rootElement or viewModel is invalid');
        }

        this.initRendered = false;
        this.compId = compIdIndex += 1;
        this.$rootElement = $rootElement;
        this.viewModel = viewModel;
        this.bindingAttrs = bindingAttrs$$1;
        this.render = debounceRaf(this.render, this);
        this.isServerRendered = this.$rootElement.getAttribute(serverRenderedAttr) !== null; // inject instance into viewModel

        this.viewModel.APP = this;
        this.viewModel.$root = this.viewModel;
        this.parseView(); // for jquery user set viewModel referece to $rootElement for easy debug
        // otherwise use Expando to attach viewModel to $rootElement

        if (window.jQuery) {
          window.jQuery(this.$rootElement).data(bindingDataReference.rootDataKey, this.viewModel);
        } else {
          this.$rootElement[bindingDataReference.rootDataKey] = this.viewModel;
        }

        return this;
      }
      /**
       * parseView
       * @description
       * @return {this}
       * traver from $rootElement to find each data-bind-* element
       * then apply data binding
       */


      _createClass(Binder, [{
        key: "parseView",
        value: function parseView() {
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

      }, {
        key: "updateElementCache",
        value: function updateElementCache() {
          var _this = this;

          var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          var elementCache = opt.elementCache || this.elementCache;

          if (opt.allCache) {
            // walk dom from root element to regenerate elementCache
            this.elementCache = createBindingCache({
              rootNode: this.$rootElement,
              bindingAttrs: this.bindingAttrs
            });
          } // walk from first rendered template node to create/update child bindingCache


          if (opt.allCache || opt.templateCache) {
            if (elementCache[this.bindingAttrs.tmp] && elementCache[this.bindingAttrs.tmp].length) {
              elementCache[this.bindingAttrs.tmp].forEach(function (cache) {
                // set skipCheck as skipForOfParseFn whenever an node has
                // both template and forOf bindings
                // then the template bindingCache should be an empty object
                var skipForOfParseFn = null;

                if (cache.el.hasAttribute(_this.bindingAttrs.forOf)) {
                  skipForOfParseFn = function skipForOfParseFn() {
                    return true;
                  };
                }

                cache.bindingCache = createBindingCache({
                  rootNode: cache.el,
                  bindingAttrs: _this.bindingAttrs,
                  skipCheck: skipForOfParseFn,
                  isRenderedTemplate: opt.isRenderedTemplates
                });
              });
            }
          }
        }
      }, {
        key: "render",
        value: function render() {
          var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          var updateOption = {};

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
      }, {
        key: "subscribe",
        value: function subscribe() {
          var eventName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
          var fn = arguments.length > 1 ? arguments[1] : undefined;
          subscribeEvent(this, eventName, fn);
          return this;
        }
      }, {
        key: "subscribeOnce",
        value: function subscribeOnce() {
          var eventName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
          var fn = arguments.length > 1 ? arguments[1] : undefined;
          subscribeEventOnce(this, eventName, fn);
          return this;
        }
      }, {
        key: "unsubscribe",
        value: function unsubscribe() {
          var eventName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
          unsubscribeEvent(this.compId, eventName);
          return this;
        }
      }, {
        key: "unsubscribeAll",
        value: function unsubscribeAll() {
          unsubscribeAllEvent(this.compId);
          return this;
        }
      }, {
        key: "publish",
        value: function publish() {
          var eventName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

          for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          publishEvent.apply(pubSub, [eventName].concat(args));
          return this;
        }
      }], [{
        key: "applyBinding",
        value: function applyBinding(_ref) {
          var ctx = _ref.ctx,
              elementCache = _ref.elementCache,
              updateOption = _ref.updateOption,
              bindingAttrs$$1 = _ref.bindingAttrs,
              viewModel = _ref.viewModel;

          if (!elementCache || !updateOption) {
            return;
          } // the follow binding should be in order for better efficiency
          // apply forOf Binding


          if (updateOption.forOfBinding && elementCache[bindingAttrs$$1.forOf] && elementCache[bindingAttrs$$1.forOf].length) {
            elementCache[bindingAttrs$$1.forOf].forEach(function (cache) {
              forOfBinding(cache, viewModel, bindingAttrs$$1, updateOption.forceRender);
            });
          } // apply attr Binding


          if (updateOption.attrBinding && elementCache[bindingAttrs$$1.attr] && elementCache[bindingAttrs$$1.attr].length) {
            elementCache[bindingAttrs$$1.attr].forEach(function (cache) {
              attrBinding(cache, viewModel, bindingAttrs$$1, updateOption.forceRender);
            });
          } // apply if Binding


          if (updateOption.ifBinding && elementCache[bindingAttrs$$1["if"]] && elementCache[bindingAttrs$$1["if"]].length) {
            elementCache[bindingAttrs$$1["if"]].forEach(function (cache) {
              ifBinding(cache, viewModel, bindingAttrs$$1, updateOption.forceRender);
            });
          } // apply show Binding


          if (updateOption.showBinding && elementCache[bindingAttrs$$1.show] && elementCache[bindingAttrs$$1.show].length) {
            elementCache[bindingAttrs$$1.show].forEach(function (cache) {
              showBinding(cache, viewModel, bindingAttrs$$1, updateOption.forceRender);
            });
          } // apply switch Binding


          if (updateOption.switchBinding && elementCache[bindingAttrs$$1["switch"]] && elementCache[bindingAttrs$$1["switch"]].length) {
            elementCache[bindingAttrs$$1["switch"]].forEach(function (cache) {
              switchBinding(cache, viewModel, bindingAttrs$$1, updateOption.forceRender);
            });
          } // apply text binding


          if (updateOption.textBinding && elementCache[bindingAttrs$$1.text] && elementCache[bindingAttrs$$1.text].length) {
            elementCache[bindingAttrs$$1.text].forEach(function (cache) {
              textBinding(cache, viewModel, bindingAttrs$$1, updateOption.forceRender);
            });
          } // apply cssBinding


          if (updateOption.cssBinding && elementCache[bindingAttrs$$1.css] && elementCache[bindingAttrs$$1.css].length) {
            elementCache[bindingAttrs$$1.css].forEach(function (cache) {
              cssBinding(cache, viewModel, bindingAttrs$$1, updateOption.forceRender);
            });
          } // apply model binding


          if (updateOption.modelBinding && elementCache[bindingAttrs$$1.model] && elementCache[bindingAttrs$$1.model].length) {
            elementCache[bindingAttrs$$1.model].forEach(function (cache) {
              modelBinding(cache, viewModel, bindingAttrs$$1, updateOption.forceRender);
            });
          } // apply change binding


          if (updateOption.changeBinding && elementCache[bindingAttrs$$1.change] && elementCache[bindingAttrs$$1.change].length) {
            elementCache[bindingAttrs$$1.change].forEach(function (cache) {
              changeBinding(cache, viewModel, bindingAttrs$$1, updateOption.forceRender);
            });
          } // apply submit binding


          if (updateOption.submitBinding && elementCache[bindingAttrs$$1.submit] && elementCache[bindingAttrs$$1.submit].length) {
            elementCache[bindingAttrs$$1.submit].forEach(function (cache) {
              submitBinding(cache, viewModel, bindingAttrs$$1, updateOption.forceRender);
            });
          } // apply click binding


          if (updateOption.clickBinding && elementCache[bindingAttrs$$1.click] && elementCache[bindingAttrs$$1.click].length) {
            elementCache[bindingAttrs$$1.click].forEach(function (cache) {
              clickBinding(cache, viewModel, bindingAttrs$$1, updateOption.forceRender);
            });
          } // apply double click binding


          if (updateOption.dblclickBinding && elementCache[bindingAttrs$$1.dblclick] && elementCache[bindingAttrs$$1.dblclick].length) {
            elementCache[bindingAttrs$$1.dblclick].forEach(function (cache) {
              dblclickBinding(cache, viewModel, bindingAttrs$$1, updateOption.forceRender);
            });
          } // apply blur binding


          if (updateOption.blurBinding && elementCache[bindingAttrs$$1.blur] && elementCache[bindingAttrs$$1.blur].length) {
            elementCache[bindingAttrs$$1.blur].forEach(function (cache) {
              blurBinding(cache, viewModel, bindingAttrs$$1, updateOption.forceRender);
            });
          } // apply focus binding


          if (updateOption.focusBinding && elementCache[bindingAttrs$$1.focus] && elementCache[bindingAttrs$$1.focus].length) {
            elementCache[bindingAttrs$$1.focus].forEach(function (cache) {
              focusBinding(cache, viewModel, bindingAttrs$$1, updateOption.forceRender);
            });
          } // apply hover binding


          if (updateOption.hoverBinding && elementCache[bindingAttrs$$1.hover] && elementCache[bindingAttrs$$1.hover].length) {
            elementCache[bindingAttrs$$1.hover].forEach(function (cache) {
              hoverBinding(cache, viewModel, bindingAttrs$$1, updateOption.forceRender);
            });
          }
        }
      }, {
        key: "postProcess",
        value: function postProcess(tasks) {
          if (!tasks || !tasks.length) {
            return;
          }

          each(tasks, function (index, task) {
            if (typeof task === 'function') {
              try {
                task();
              } catch (err) {
                throwErrorMessage(err, 'Error postProcess: ' + String(task));
              }
            }
          });
        }
      }]);

      return Binder;
    }();

    var renderTemplatesBinding = function renderTemplatesBinding(_ref2) {
      var ctx = _ref2.ctx,
          elementCache = _ref2.elementCache,
          updateOption = _ref2.updateOption,
          bindingAttrs$$1 = _ref2.bindingAttrs,
          viewModel = _ref2.viewModel;

      if (!elementCache || !bindingAttrs$$1) {
        return false;
      } // render and apply binding to template(s) and forOf DOM


      if (elementCache[bindingAttrs$$1.tmp] && elementCache[bindingAttrs$$1.tmp].length) {
        // when re-render call with {templateBinding: true}
        // template and nested templates
        if (updateOption.templateBinding) {
          // overwrite updateOption with 'init' bindingUpdateConditions
          updateOption = createBindingOption(bindingUpdateConditions.init);
          elementCache[bindingAttrs$$1.tmp].forEach(function ($element) {
            renderTemplate($element, viewModel, bindingAttrs$$1, elementCache);
          }); // update cache after all template(s) rendered

          ctx.updateElementCache({
            templateCache: true,
            elementCache: elementCache,
            isRenderedTemplates: true
          });
        } // enforce render even element is not in DOM tree


        updateOption.forceRender = true; // apply bindings to rendered templates element

        elementCache[bindingAttrs$$1.tmp].forEach(function (cache) {
          Binder.applyBinding({
            elementCache: cache.bindingCache,
            updateOption: updateOption,
            bindingAttrs: bindingAttrs$$1,
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


    var createBindingOption = function createBindingOption() {
      var condition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var visualBindingOptions = {
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
      var eventsBindingOptions = {
        changeBinding: true,
        clickBinding: true,
        dblclickBinding: true,
        blurBinding: true,
        focusBinding: true,
        hoverBinding: true,
        submitBinding: true
      }; // this is visualBindingOptions but everything false
      // concrete declear for performance purpose

      var serverRenderedOptions = {
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
      var updateOption = {};

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


    var renderIteration = function renderIteration(_ref3) {
      var elementCache = _ref3.elementCache,
          iterationVm = _ref3.iterationVm,
          bindingAttrs$$1 = _ref3.bindingAttrs,
          isRegenerate = _ref3.isRegenerate;
      var bindingUpdateOption = isRegenerate ? createBindingOption(bindingUpdateConditions.init) : createBindingOption(); // enforce render even element is not in DOM tree

      bindingUpdateOption.forceRender = true; // render and apply binding to template(s)
      // this is an share function therefore passing current APP 'this' context
      // viewModel is a dynamic generated iterationVm

      renderTemplatesBinding({
        ctx: iterationVm.$root ? iterationVm.$root.APP : iterationVm.APP,
        elementCache: elementCache,
        updateOption: bindingUpdateOption,
        bindingAttrs: bindingAttrs$$1,
        viewModel: iterationVm
      });
      Binder.applyBinding({
        elementCache: elementCache,
        updateOption: bindingUpdateOption,
        bindingAttrs: bindingAttrs$$1,
        viewModel: iterationVm
      });
    };

    var bindingAttrs$1 = bindingAttrs;
    var templateSettings$1 = templateSettings;

    var use = function use() {
      var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (settings.bindingAttrs) {
        bindingAttrs$1 = $.extend({}, settings.bindingAttrs);
      }

      if (settings.templateSettings) {
        templateSettings$1 = $.extend({}, settings.templateSettings);
      }
    };

    var init = function init($rootElement) {
      var viewModel = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      _.templateSettings = templateSettings$1;
      return new Binder($rootElement, viewModel, bindingAttrs$1);
    }; // expose to global


    window.dataBind = {
      use: use,
      init: init,
      version: '@version@'
    };

}());
