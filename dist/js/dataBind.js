/**
 * dataBind - Simple MV* framework work with jQuery and underscore template
 * @version v1.8.1
 * @link https://github.com/gogocat/dataBind#readme
 * @license MIT
 */
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _util = require("./util");

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
  var vmAttrObj = (0, _util.getViewModelPropValue)(viewModel, cache);

  if (!(0, _util.isPlainObject)(vmAttrObj)) {
    return;
  } // reject if nothing changed


  if (JSON.stringify(oldAttrObj) === JSON.stringify(vmAttrObj)) {
    return;
  } // reset old data and update it


  cache.elementData.viewModelProValue = {};

  if ((0, _util.isEmptyObject)(oldAttrObj)) {
    (0, _util.each)(vmAttrObj, function (key, value) {
      cache.el.setAttribute(key, value); // populate with vmAttrObj data

      cache.elementData.viewModelProValue[key] = value;
    });
  } else {
    (0, _util.each)(oldAttrObj, function (key, value) {
      if (typeof vmAttrObj[key] === 'undefined') {
        // remove attribute if not present in current vm
        cache.el.removeAttribute(key);
      }
    });
    (0, _util.each)(vmAttrObj, function (key, value) {
      if (oldAttrObj[key] !== vmAttrObj[key]) {
        // update attribute if value changed
        cache.el.setAttribute(key, vmAttrObj[key]);
      } // populate with vmAttrObj data


      cache.elementData.viewModelProValue[key] = value;
    });
  }
};

var _default = attrBinding;
exports["default"] = _default;

},{"./util":25}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderIteration = exports.renderTemplatesBinding = exports.createBindingOption = exports.Binder = void 0;

var config = _interopRequireWildcard(require("./config"));

var _util = require("./util");

var _renderTemplate = _interopRequireDefault(require("./renderTemplate"));

var _clickBinding = _interopRequireDefault(require("./clickBinding"));

var _dbclickBinding = _interopRequireDefault(require("./dbclickBinding"));

var _blurBinding = _interopRequireDefault(require("./blurBinding"));

var _focusBinding = _interopRequireDefault(require("./focusBinding"));

var _hoverBinding = _interopRequireDefault(require("./hoverBinding"));

var _changeBinding = _interopRequireDefault(require("./changeBinding"));

var _modelBinding = _interopRequireDefault(require("./modelBinding"));

var _submitBinding = _interopRequireDefault(require("./submitBinding"));

var _textBinding = _interopRequireDefault(require("./textBinding"));

var _showBinding = _interopRequireDefault(require("./showBinding"));

var _cssBinding = _interopRequireDefault(require("./cssBinding"));

var _attrBinding = _interopRequireDefault(require("./attrBinding"));

var _forOfBinding = _interopRequireDefault(require("./forOfBinding"));

var _ifBinding = _interopRequireDefault(require("./ifBinding"));

var _switchBinding = _interopRequireDefault(require("./switchBinding"));

var _domWalker = _interopRequireDefault(require("./domWalker"));

var pubSub = _interopRequireWildcard(require("./pubSub"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var compIdIndex = 0;

var Binder =
/*#__PURE__*/
function () {
  function Binder($rootElement, viewModel, bindingAttrs) {
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
    this.bindingAttrs = bindingAttrs;
    this.render = (0, _util.debounceRaf)(this.render, this);
    this.isServerRendered = this.$rootElement.getAttribute(config.serverRenderedAttr) !== null; // inject instance into viewModel

    this.viewModel.APP = this;
    this.viewModel.$root = this.viewModel;
    this.parseView(); // for jquery user set viewModel referece to $rootElement for easy debug
    // otherwise use Expando to attach viewModel to $rootElement

    if (window.jQuery) {
      window.jQuery(this.$rootElement).data(config.bindingDataReference.rootDataKey, this.viewModel);
    } else {
      this.$rootElement[config.bindingDataReference.rootDataKey] = this.viewModel;
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
      this.elementCache = (0, _domWalker["default"])({
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
        this.elementCache = (0, _domWalker["default"])({
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

            cache.bindingCache = (0, _domWalker["default"])({
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
          this.$rootElement.removeAttribute(config.serverRenderedAttr);
          updateOption = createBindingOption(config.bindingUpdateConditions.serverRendered, opt);
        } else {
          updateOption = createBindingOption(config.bindingUpdateConditions.init, opt);
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
      pubSub.subscribeEvent(this, eventName, fn);
      return this;
    }
  }, {
    key: "subscribeOnce",
    value: function subscribeOnce() {
      var eventName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var fn = arguments.length > 1 ? arguments[1] : undefined;
      pubSub.subscribeEventOnce(this, eventName, fn);
      return this;
    }
  }, {
    key: "unsubscribe",
    value: function unsubscribe() {
      var eventName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      pubSub.unsubscribeEvent(this.compId, eventName);
      return this;
    }
  }, {
    key: "unsubscribeAll",
    value: function unsubscribeAll() {
      pubSub.unsubscribeAllEvent(this.compId);
      return this;
    }
  }, {
    key: "publish",
    value: function publish() {
      var eventName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      pubSub.publishEvent.apply(pubSub, [eventName].concat(args));
      return this;
    }
  }], [{
    key: "applyBinding",
    value: function applyBinding(_ref) {
      var ctx = _ref.ctx,
          elementCache = _ref.elementCache,
          updateOption = _ref.updateOption,
          bindingAttrs = _ref.bindingAttrs,
          viewModel = _ref.viewModel;

      if (!elementCache || !updateOption) {
        return;
      } // the follow binding should be in order for better efficiency
      // apply forOf Binding


      if (updateOption.forOfBinding && elementCache[bindingAttrs.forOf] && elementCache[bindingAttrs.forOf].length) {
        elementCache[bindingAttrs.forOf].forEach(function (cache) {
          (0, _forOfBinding["default"])(cache, viewModel, bindingAttrs, updateOption.forceRender);
        });
      } // apply attr Binding


      if (updateOption.attrBinding && elementCache[bindingAttrs.attr] && elementCache[bindingAttrs.attr].length) {
        elementCache[bindingAttrs.attr].forEach(function (cache) {
          (0, _attrBinding["default"])(cache, viewModel, bindingAttrs, updateOption.forceRender);
        });
      } // apply if Binding


      if (updateOption.ifBinding && elementCache[bindingAttrs["if"]] && elementCache[bindingAttrs["if"]].length) {
        elementCache[bindingAttrs["if"]].forEach(function (cache) {
          (0, _ifBinding["default"])(cache, viewModel, bindingAttrs, updateOption.forceRender);
        });
      } // apply show Binding


      if (updateOption.showBinding && elementCache[bindingAttrs.show] && elementCache[bindingAttrs.show].length) {
        elementCache[bindingAttrs.show].forEach(function (cache) {
          (0, _showBinding["default"])(cache, viewModel, bindingAttrs, updateOption.forceRender);
        });
      } // apply switch Binding


      if (updateOption.switchBinding && elementCache[bindingAttrs["switch"]] && elementCache[bindingAttrs["switch"]].length) {
        elementCache[bindingAttrs["switch"]].forEach(function (cache) {
          (0, _switchBinding["default"])(cache, viewModel, bindingAttrs, updateOption.forceRender);
        });
      } // apply text binding


      if (updateOption.textBinding && elementCache[bindingAttrs.text] && elementCache[bindingAttrs.text].length) {
        elementCache[bindingAttrs.text].forEach(function (cache) {
          (0, _textBinding["default"])(cache, viewModel, bindingAttrs, updateOption.forceRender);
        });
      } // apply cssBinding


      if (updateOption.cssBinding && elementCache[bindingAttrs.css] && elementCache[bindingAttrs.css].length) {
        elementCache[bindingAttrs.css].forEach(function (cache) {
          (0, _cssBinding["default"])(cache, viewModel, bindingAttrs, updateOption.forceRender);
        });
      } // apply model binding


      if (updateOption.modelBinding && elementCache[bindingAttrs.model] && elementCache[bindingAttrs.model].length) {
        elementCache[bindingAttrs.model].forEach(function (cache) {
          (0, _modelBinding["default"])(cache, viewModel, bindingAttrs, updateOption.forceRender);
        });
      } // apply change binding


      if (updateOption.changeBinding && elementCache[bindingAttrs.change] && elementCache[bindingAttrs.change].length) {
        elementCache[bindingAttrs.change].forEach(function (cache) {
          (0, _changeBinding["default"])(cache, viewModel, bindingAttrs, updateOption.forceRender);
        });
      } // apply submit binding


      if (updateOption.submitBinding && elementCache[bindingAttrs.submit] && elementCache[bindingAttrs.submit].length) {
        elementCache[bindingAttrs.submit].forEach(function (cache) {
          (0, _submitBinding["default"])(cache, viewModel, bindingAttrs, updateOption.forceRender);
        });
      } // apply click binding


      if (updateOption.clickBinding && elementCache[bindingAttrs.click] && elementCache[bindingAttrs.click].length) {
        elementCache[bindingAttrs.click].forEach(function (cache) {
          (0, _clickBinding["default"])(cache, viewModel, bindingAttrs, updateOption.forceRender);
        });
      } // apply double click binding


      if (updateOption.dblclickBinding && elementCache[bindingAttrs.dblclick] && elementCache[bindingAttrs.dblclick].length) {
        elementCache[bindingAttrs.dblclick].forEach(function (cache) {
          (0, _dbclickBinding["default"])(cache, viewModel, bindingAttrs, updateOption.forceRender);
        });
      } // apply blur binding


      if (updateOption.blurBinding && elementCache[bindingAttrs.blur] && elementCache[bindingAttrs.blur].length) {
        elementCache[bindingAttrs.blur].forEach(function (cache) {
          (0, _blurBinding["default"])(cache, viewModel, bindingAttrs, updateOption.forceRender);
        });
      } // apply focus binding


      if (updateOption.focusBinding && elementCache[bindingAttrs.focus] && elementCache[bindingAttrs.focus].length) {
        elementCache[bindingAttrs.focus].forEach(function (cache) {
          (0, _focusBinding["default"])(cache, viewModel, bindingAttrs, updateOption.forceRender);
        });
      } // apply hover binding


      if (updateOption.hoverBinding && elementCache[bindingAttrs.hover] && elementCache[bindingAttrs.hover].length) {
        elementCache[bindingAttrs.hover].forEach(function (cache) {
          (0, _hoverBinding["default"])(cache, viewModel, bindingAttrs, updateOption.forceRender);
        });
      }
    }
  }, {
    key: "postProcess",
    value: function postProcess(tasks) {
      if (!tasks || !tasks.length) {
        return;
      }

      (0, _util.each)(tasks, function (index, task) {
        if (typeof task === 'function') {
          try {
            task();
          } catch (err) {
            (0, _util.throwErrorMessage)(err, 'Error postProcess: ' + String(task));
          }
        }
      });
    }
  }]);

  return Binder;
}();

exports.Binder = Binder;

var renderTemplatesBinding = function renderTemplatesBinding(_ref2) {
  var ctx = _ref2.ctx,
      elementCache = _ref2.elementCache,
      updateOption = _ref2.updateOption,
      bindingAttrs = _ref2.bindingAttrs,
      viewModel = _ref2.viewModel;

  if (!elementCache || !bindingAttrs) {
    return false;
  } // render and apply binding to template(s) and forOf DOM


  if (elementCache[bindingAttrs.tmp] && elementCache[bindingAttrs.tmp].length) {
    // when re-render call with {templateBinding: true}
    // template and nested templates
    if (updateOption.templateBinding) {
      // overwrite updateOption with 'init' bindingUpdateConditions
      updateOption = createBindingOption(config.bindingUpdateConditions.init);
      elementCache[bindingAttrs.tmp].forEach(function ($element) {
        (0, _renderTemplate["default"])($element, viewModel, bindingAttrs, elementCache);
      }); // update cache after all template(s) rendered

      ctx.updateElementCache({
        templateCache: true,
        elementCache: elementCache,
        isRenderedTemplates: true
      });
    } // enforce render even element is not in DOM tree


    updateOption.forceRender = true; // apply bindings to rendered templates element

    elementCache[bindingAttrs.tmp].forEach(function (cache) {
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


exports.renderTemplatesBinding = renderTemplatesBinding;

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
    case config.bindingUpdateConditions.serverRendered:
      updateOption = (0, _util.extend)({}, eventsBindingOptions, serverRenderedOptions, opt);
      break;

    case config.bindingUpdateConditions.init:
      // flag templateBinding to true to render tempalte(s)
      opt.templateBinding = true;
      updateOption = (0, _util.extend)({}, visualBindingOptions, eventsBindingOptions, opt);
      break;

    default:
      // when called again only update visualBinding options
      updateOption = (0, _util.extend)({}, visualBindingOptions, opt);
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


exports.createBindingOption = createBindingOption;

var renderIteration = function renderIteration(_ref3) {
  var elementCache = _ref3.elementCache,
      iterationVm = _ref3.iterationVm,
      bindingAttrs = _ref3.bindingAttrs,
      isRegenerate = _ref3.isRegenerate;
  var bindingUpdateOption = isRegenerate ? createBindingOption(config.bindingUpdateConditions.init) : createBindingOption(); // enforce render even element is not in DOM tree

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

exports.renderIteration = renderIteration;

},{"./attrBinding":1,"./blurBinding":3,"./changeBinding":4,"./clickBinding":5,"./config":7,"./cssBinding":8,"./dbclickBinding":9,"./domWalker":10,"./focusBinding":11,"./forOfBinding":12,"./hoverBinding":13,"./ifBinding":14,"./modelBinding":16,"./pubSub":17,"./renderTemplate":20,"./showBinding":21,"./submitBinding":22,"./switchBinding":23,"./textBinding":24,"./util":25}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _util = require("./util");

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
  var handlerFn;
  var viewModelContext;
  var APP = viewModel.APP || viewModel.$root.APP;

  if (!handlerName || !forceRender && !APP.$rootElement.contains(cache.el)) {
    return;
  }

  handlerFn = (0, _util.getViewModelValue)(viewModel, handlerName);

  if (typeof handlerFn === 'function') {
    viewModelContext = (0, _util.resolveViewModelContext)(viewModel, handlerName);
    paramList = paramList ? (0, _util.resolveParamList)(viewModel, paramList) : [];
    $(cache.el).off('blur.databind').on('blur.databind', function (e) {
      var args = [e, $(this)].concat(paramList);
      handlerFn.apply(viewModelContext, args);
    });
  }
};

var _default = blurBinding;
exports["default"] = _default;

},{"./util":25}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _util = require("./util");

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
  var handlerFn;
  var newValue = '';
  var oldValue = '';
  var viewModelContext;
  var APP = viewModel.APP || viewModel.$root.APP;

  if (!handlerName || !forceRender && !APP.$rootElement.contains(cache.el)) {
    return;
  }

  handlerFn = (0, _util.getViewModelValue)(viewModel, handlerName);

  if (typeof handlerFn === 'function') {
    viewModelContext = (0, _util.resolveViewModelContext)(viewModel, handlerName);
    paramList = paramList ? (0, _util.resolveParamList)(viewModel, paramList) : []; // assing on change event

    $(cache.el).off('change.databind').on('change.databind', function (e) {
      var $this = $(this);
      var isCheckbox = $this.is(':checkbox');
      newValue = isCheckbox ? $this.prop('checked') : _.escape($this.val()); // set data to viewModel

      if (modelDataKey) {
        oldValue = (0, _util.getViewModelValue)(viewModel, modelDataKey);
        (0, _util.setViewModelValue)(viewModel, modelDataKey, newValue);
      }

      var args = [e, $this, newValue, oldValue].concat(paramList);
      handlerFn.apply(viewModelContext, args);
      oldValue = newValue;
    });
  }
};

var _default = changeBinding;
exports["default"] = _default;

},{"./util":25}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _util = require("./util");

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
  var handlerFn;
  var viewModelContext;
  var APP = viewModel.APP || viewModel.$root.APP;

  if (!handlerName || !forceRender && !APP.$rootElement.contains(cache.el)) {
    return;
  }

  handlerFn = (0, _util.getViewModelValue)(viewModel, handlerName);

  if (typeof handlerFn === 'function') {
    viewModelContext = (0, _util.resolveViewModelContext)(viewModel, handlerName);
    paramList = paramList ? (0, _util.resolveParamList)(viewModel, paramList) : [];
    $(cache.el).off('click.databind').on('click.databind', function (e) {
      var args = [e, $(this)].concat(paramList);
      handlerFn.apply(viewModelContext, args);
    });
  }
};

var _default = clickBinding;
exports["default"] = _default;

},{"./util":25}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.insertRenderedElements = exports.setDocRangeEndAfter = exports.removeDomTemplateElement = exports.removeElemnetsByCommentWrap = exports.wrapCommentAround = exports.setCommentPrefix = exports.createClonedElementCache = void 0;

var config = _interopRequireWildcard(require("./config"));

var util = _interopRequireWildcard(require("./util"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

/* eslint-disable no-invalid-this */
var createClonedElementCache = function createClonedElementCache(bindingData) {
  var clonedElement = bindingData.el.cloneNode(true);
  bindingData.fragment = document.createDocumentFragment();
  bindingData.fragment.appendChild(clonedElement);
  return bindingData;
};

exports.createClonedElementCache = createClonedElementCache;

var setCommentPrefix = function setCommentPrefix(bindingData) {
  if (!bindingData || !bindingData.type) {
    return;
  }

  var commentPrefix = '';
  var dataKeyMarker = bindingData.dataKey ? bindingData.dataKey.replace(util.REGEX.WHITESPACES, '_') : '';

  switch (bindingData.type) {
    case config.bindingAttrs.forOf:
      commentPrefix = config.commentPrefix.forOf;
      break;

    case config.bindingAttrs["if"]:
      commentPrefix = config.commentPrefix["if"];
      break;

    case config.bindingAttrs["case"]:
      commentPrefix = config.commentPrefix["case"];
      break;

    case config.bindingAttrs["default"]:
      commentPrefix = config.commentPrefix["default"];
      break;
  }

  bindingData.commentPrefix = commentPrefix + dataKeyMarker;
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


exports.setCommentPrefix = setCommentPrefix;

var setDocRangeEndAfter = function setDocRangeEndAfter(node, bindingData) {
  if (!bindingData.commentPrefix) {
    setCommentPrefix(bindingData);
  }

  var startTextContent = bindingData.commentPrefix;
  var endTextContent = startTextContent + config.commentSuffix;
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


exports.setDocRangeEndAfter = setDocRangeEndAfter;

var wrapCommentAround = function wrapCommentAround(bindingData, node) {
  var commentBegin;
  var commentEnd;
  var prefix = '';

  if (!bindingData.commentPrefix) {
    setCommentPrefix(bindingData);
  }

  prefix = bindingData.commentPrefix;
  commentBegin = document.createComment(prefix);
  commentEnd = document.createComment(prefix + config.commentSuffix); // document fragment - logic for ForOf binding
  // check node.parentNode because node could be from cache and no longer in DOM

  if (node.nodeType === 11) {
    node.insertBefore(commentBegin, node.firstChild);
    node.appendChild(commentEnd);
  } else if (node.parentNode) {
    node.parentNode.insertBefore(commentBegin, node);
    util.insertAfter(node.parentNode, commentEnd, node); // update bindingData details

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


exports.wrapCommentAround = wrapCommentAround;

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
/**
 * removeDomTemplateElement
 * @param {object} bindingData
 * @return {object} null
 */


exports.removeElemnetsByCommentWrap = removeElemnetsByCommentWrap;

var removeDomTemplateElement = function removeDomTemplateElement(bindingData) {
  // first render - forElement is live DOM element so has parentNode
  if (bindingData.el.parentNode) {
    return bindingData.el.parentNode.removeChild(bindingData.el);
  }

  removeElemnetsByCommentWrap(bindingData);
};

exports.removeDomTemplateElement = removeDomTemplateElement;

var insertRenderedElements = function insertRenderedElements(bindingData, fragment) {
  // insert rendered fragment after the previousNonTemplateElement
  if (bindingData.previousNonTemplateElement) {
    util.insertAfter(bindingData.parentElement, fragment, bindingData.previousNonTemplateElement);
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

exports.insertRenderedElements = insertRenderedElements;

},{"./config":7,"./util":25}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.constants = exports.maxDatakeyLength = exports.bindingDataReference = exports.bindingUpdateConditions = exports.commentSuffix = exports.commentPrefix = exports.serverRenderedAttr = exports.templateSettings = exports.dataIndexAttr = exports.bindingAttrs = void 0;
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
exports.bindingAttrs = bindingAttrs;
var serverRenderedAttr = 'data-server-rendered';
exports.serverRenderedAttr = serverRenderedAttr;
var dataIndexAttr = 'data-index';
exports.dataIndexAttr = dataIndexAttr;
var commentPrefix = {
  forOf: 'data-forOf_',
  "if": 'data-if_',
  "case": 'data-case_',
  "default": 'data-default_'
};
exports.commentPrefix = commentPrefix;
var commentSuffix = '_end'; // global setting of underscore template inteprolate default token

exports.commentSuffix = commentSuffix;
var templateSettings = {
  evaluate: /<%([\s\S]+?)%>/g,
  interpolate: /\{\{=(.+?)\}\}/g,
  escape: /\{\{(.+?)\}\}/g
};
exports.templateSettings = templateSettings;
var bindingDataReference = {
  rootDataKey: '$root',
  currentData: '$data',
  currentIndex: '$index',
  mouseEnterHandlerName: 'in',
  mouseLeaveHandlerName: 'out'
};
exports.bindingDataReference = bindingDataReference;
var bindingUpdateConditions = {
  serverRendered: 'SERVER-RENDERED',
  init: 'INIT'
}; // maximum string length before running regex

exports.bindingUpdateConditions = bindingUpdateConditions;
var maxDatakeyLength = 50;
exports.maxDatakeyLength = maxDatakeyLength;
var constants = {
  filters: {
    ONCE: 'once'
  },
  PARENT_REF: '_parent'
};
exports.constants = constants;

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _util = require("./util");

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
  var vmCssListObj = (0, _util.getViewModelPropValue)(viewModel, cache);
  var vmCssListArray = [];
  var isViewDataObject = false;
  var isViewDataString = false;
  var cssList = [];

  if (typeof vmCssListObj === 'string') {
    isViewDataString = true;
  } else if ((0, _util.isPlainObject)(vmCssListObj)) {
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
    (0, _util.each)(vmCssListObj, function (k, v) {
      var i = cssList.indexOf(k);

      if (v === true) {
        cssList.push(k);
      } else if (i !== -1) {
        cssList.splice(i, 1);
      }
    });
  } else if (isViewDataString) {
    // remove oldCssList items from cssList
    cssList = (0, _util.arrayRemoveMatch)(cssList, oldCssList);
    cssList = cssList.concat(vmCssListArray);
  } // unique cssList array


  cssList = cssList.filter(function (v, i, a) {
    return a.indexOf(v) === i;
  });
  cssList = cssList.join(' '); // update element data

  cache.elementData.viewModelPropValue = newCssList; // replace all css classes

  cache.el.setAttribute('class', cssList);
};

var _default = cssBinding;
exports["default"] = _default;

},{"./util":25}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _util = require("./util");

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
  var handlerFn;
  var viewModelContext;
  var APP = viewModel.APP || viewModel.$root.APP;

  if (!handlerName || !forceRender && !APP.$rootElement.contains(cache.el)) {
    return;
  }

  handlerFn = (0, _util.getViewModelValue)(viewModel, handlerName);

  if (typeof handlerFn === 'function') {
    viewModelContext = (0, _util.resolveViewModelContext)(viewModel, handlerName);
    paramList = paramList ? (0, _util.resolveParamList)(viewModel, paramList) : [];
    $(cache.el).off('dblclick.databind').on('dblclick.databind', function (e) {
      var args = [e, $(this)].concat(paramList);
      handlerFn.apply(viewModelContext, args);
    });
  }
};

var _default = dblclickBinding;
exports["default"] = _default;

},{"./util":25}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _util = require("./util");

var _config = require("./config");

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
  var bindingAttrs = arguments.length > 1 ? arguments[1] : undefined;
  return [bindingAttrs.forOf, bindingAttrs["if"], bindingAttrs["case"], bindingAttrs["default"]].filter(function (type) {
    return typeof attrObj[type] !== 'undefined';
  });
};

var rootSkipCheck = function rootSkipCheck(node) {
  return node.tagName === 'SVG';
};

var defaultSkipCheck = function defaultSkipCheck(node, bindingAttrs) {
  return node.tagName === 'SVG' || node.hasAttribute(bindingAttrs.comp);
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

    cacheData = (0, _util.extractFilterList)(cacheData); // populate cacheData.parameters
    // for store function call parameters eg. '$index', '$root'
    // useful with DOM for-loop template as reference to binding data

    var paramList = (0, _util.getFunctionParameterList)(cacheData.dataKey);

    if (paramList) {
      cacheData.parameters = paramList;
      cacheData.dataKey = cacheData.dataKey.replace(_util.REGEX.FUNCTIONPARAM, '').trim();
    } // store parent array reference to cacheData


    cacheData[_config.constants.PARENT_REF] = bindingCache[type];
    bindingCache[type].push(cacheData);
  }

  return bindingCache;
};

var createBindingCache = function createBindingCache(_ref2) {
  var _ref2$rootNode = _ref2.rootNode,
      rootNode = _ref2$rootNode === void 0 ? null : _ref2$rootNode,
      _ref2$bindingAttrs = _ref2.bindingAttrs,
      bindingAttrs = _ref2$bindingAttrs === void 0 ? {} : _ref2$bindingAttrs,
      skipCheck = _ref2.skipCheck,
      _ref2$isRenderedTempl = _ref2.isRenderedTemplate,
      isRenderedTemplate = _ref2$isRenderedTempl === void 0 ? false : _ref2$isRenderedTempl;
  var bindingCache = {};

  if (!rootNode instanceof window.Node) {
    throw new TypeError('walkDOM: Expected a DOM node');
  }

  bindingAttrsMap = bindingAttrsMap || (0, _util.invertObj)(bindingAttrs);

  var parseNode = function parseNode(node) {
    var skipNodeCheckFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultSkipCheck;
    var attrObj;
    var isSkipForOfChild = false;

    if (node.nodeType !== 1 || !node.hasAttributes()) {
      return true;
    }

    if (skipNodeCheckFn(node, bindingAttrs) || typeof skipCheck === 'function' && skipCheck(node)) {
      return false;
    } // when creating sub bindingCache if is for tmp binding
    // skip same element that has forOf binding the  forOf is alredy parsed


    attrObj = getAttributesObject(node);
    var hasSkipChildParseBindings = checkSkipChildParseBindings(attrObj, bindingAttrs);
    var iterateList = [];

    if (hasSkipChildParseBindings.length) {
      isSkipForOfChild = true;
      iterateList = hasSkipChildParseBindings;
    } else if (isRenderedTemplate && attrObj[bindingAttrs.tmp]) {
      // skip current node parse if was called by node has template binding and already rendered
      return true;
    } else {
      iterateList = Object.keys(attrObj);
    }

    iterateList.forEach(function (key) {
      // skip for switch case and default bining
      if (key !== bindingAttrs["case"] && key !== bindingAttrs["default"]) {
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

var _default = createBindingCache;
exports["default"] = _default;

},{"./config":7,"./util":25}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _util = require("./util");

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
  var handlerFn;
  var viewModelContext;
  var APP = viewModel.APP || viewModel.$root.APP;

  if (!handlerName || !forceRender && !APP.$rootElement.contains(cache.el)) {
    return;
  }

  handlerFn = (0, _util.getViewModelValue)(viewModel, handlerName);

  if (typeof handlerFn === 'function') {
    viewModelContext = (0, _util.resolveViewModelContext)(viewModel, handlerName);
    paramList = paramList ? (0, _util.resolveParamList)(viewModel, paramList) : [];
    $(cache.el).off('focus.databind').on('focus.databind', function (e) {
      var args = [e, $(this)].concat(paramList);
      handlerFn.apply(viewModelContext, args);
    });
  }
};

var _default = focusBinding;
exports["default"] = _default;

},{"./util":25}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _config = require("./config");

var _util = require("./util");

var _renderForOfBinding = _interopRequireDefault(require("./renderForOfBinding"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * forOfBinding
 * @description
 * DOM decleartive for binding.
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
var forOfBinding = function forOfBinding(cache, viewModel, bindingAttrs) {
  var dataKey = cache.dataKey;

  if (!dataKey || dataKey.length > _config.maxDatakeyLength) {
    return;
  }

  if (!cache.iterator) {
    if (dataKey.length > _config.maxDatakeyLength) {
      return;
    } // replace mess spaces with single space


    cache.dataKey = cache.dataKey.replace(_util.REGEX.WHITESPACES, ' ');
    var forExpMatch = dataKey.match(_util.REGEX.FOROF);

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

  (0, _renderForOfBinding["default"])({
    bindingData: cache,
    viewModel: viewModel,
    bindingAttrs: bindingAttrs
  });
};

var _default = forOfBinding;
exports["default"] = _default;

},{"./config":7,"./renderForOfBinding":18,"./util":25}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _config = require("./config");

var _util = require("./util");

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
var hoverBinding = function hoverBinding(cache, viewModel, bindingAttrs, forceRender) {
  var handlerName = cache.dataKey;
  var paramList = cache.parameters;
  var inHandlerName = _config.bindingDataReference.mouseEnterHandlerName;
  var outHandlerName = _config.bindingDataReference.mouseLeaveHandlerName;
  var handlers;
  var viewModelContext;
  var APP = viewModel.APP || viewModel.$root.APP;
  cache.elementData = cache.elementData || {};

  if (!handlerName || !forceRender && !APP.$rootElement.contains(cache.el)) {
    return;
  }

  handlers = (0, _util.getViewModelValue)(viewModel, handlerName);

  if (handlers && typeof handlers[inHandlerName] === 'function' && typeof handlers[outHandlerName] === 'function') {
    viewModelContext = (0, _util.resolveViewModelContext)(viewModel, handlerName);
    paramList = paramList ? (0, _util.resolveParamList)(viewModel, paramList) : [];
    $(cache.el).off('mouseenter.databind mouseleave.databind').hover(function enter(e) {
      var args = [e, cache.el].concat(paramList);
      handlers[inHandlerName].apply(viewModelContext, args);
    }, function leave(e) {
      var args = [e, cache.el].concat(paramList);
      handlers[outHandlerName].apply(viewModelContext, args);
    });
  }
};

var _default = hoverBinding;
exports["default"] = _default;

},{"./config":7,"./util":25}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _config = require("./config");

var _util = require("./util");

var _commentWrapper = require("./commentWrapper");

var _renderIfBinding = require("./renderIfBinding");

/**
 * if-Binding
 * @description
 * DOM decleartive for binding.
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
var ifBinding = function ifBinding(cache, viewModel, bindingAttrs) {
  var dataKey = cache.dataKey; // isOnce only return if there is no child bindings

  if (!dataKey || cache.isOnce && cache.hasIterationBindingCache === false) {
    return;
  }

  cache.elementData = cache.elementData || {};
  cache.type = cache.type || _config.bindingAttrs["if"];
  var oldViewModelProValue = cache.elementData.viewModelPropValue; // getViewModelPropValue could be return undefined or null

  var viewModelPropValue = (0, _util.getViewModelPropValue)(viewModel, cache) || false; // do nothing if viewModel value not changed and no child bindings

  if (oldViewModelProValue === viewModelPropValue && !cache.hasIterationBindingCache) {
    return;
  }

  var shouldRender = Boolean(viewModelPropValue); // remove this cache from parent array

  if (!shouldRender && cache.isOnce && cache.el.parentNode) {
    (0, _util.removeElement)(cache.el); // delete cache.fragment;

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
    (0, _commentWrapper.wrapCommentAround)(cache, cache.el);
    cache.el.removeAttribute(bindingAttrs["if"]);
    (0, _commentWrapper.createClonedElementCache)(cache);
  }

  if (!shouldRender) {
    // remove element
    (0, _renderIfBinding.removeIfBinding)(cache);
  } else {
    // render element
    (0, _renderIfBinding.renderIfBinding)({
      bindingData: cache,
      viewModel: viewModel,
      bindingAttrs: bindingAttrs
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
        cache[_config.constants.PARENT_REF].splice(index, 1);
      };
    }(cache, cache[_config.constants.PARENT_REF].indexOf(cache)));
    ret = true;
  }

  return ret;
};

var _default = ifBinding;
exports["default"] = _default;

},{"./commentWrapper":6,"./config":7,"./renderIfBinding":19,"./util":25}],15:[function(require,module,exports){
"use strict";

var config = _interopRequireWildcard(require("./config"));

var _binder = require("./binder");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

var bindingAttrs = config.bindingAttrs;
var templateSettings = config.templateSettings;

var use = function use() {
  var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (settings.bindingAttrs) {
    bindingAttrs = $.extend({}, settings.bindingAttrs);
  }

  if (settings.templateSettings) {
    templateSettings = $.extend({}, settings.templateSettings);
  }
};

var init = function init($rootElement) {
  var viewModel = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  _.templateSettings = templateSettings;
  return new _binder.Binder($rootElement, viewModel, bindingAttrs);
}; // expose to global


window.dataBind = {
  use: use,
  init: init,
  version: '1.8.1'
};

},{"./binder":2,"./config":7}],16:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _util = require("./util");

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

  newValue = (0, _util.getViewModelValue)(viewModel, dataKey);

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

var _default = modelBinding;
exports["default"] = _default;

},{"./util":25}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.publishEvent = exports.unsubscribeAllEvent = exports.unsubscribeEvent = exports.subscribeEventOnce = exports.subscribeEvent = void 0;

var util = _interopRequireWildcard(require("./util"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

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
  eventName = eventName.replace(util.REGEX.WHITESPACES, '');
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

exports.subscribeEvent = subscribeEvent;

var subscribeEventOnce = function subscribeEventOnce() {
  var instance = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var eventName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var fn = arguments.length > 2 ? arguments[2] : undefined;
  subscribeEvent(instance, eventName, fn, true);
};

exports.subscribeEventOnce = subscribeEventOnce;

var unsubscribeEvent = function unsubscribeEvent() {
  var compId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var eventName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  if (!compId || !eventName) {
    return;
  }

  var i = 0;
  var subscribersLength = 0;
  var subscriber;
  eventName = eventName.replace(util.REGEX.WHITESPACES, '');

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


exports.unsubscribeEvent = unsubscribeEvent;

var unsubscribeAllEvent = function unsubscribeAllEvent() {
  var compId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  if (!compId) {
    return;
  }

  Object.keys(EVENTS).forEach(function (eventName) {
    unsubscribeEvent(compId, eventName);
  });
};

exports.unsubscribeAllEvent = unsubscribeAllEvent;

var publishEvent = function publishEvent() {
  var eventName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  if (!eventName || !EVENTS[eventName]) {
    return;
  }

  eventName = eventName.replace(util.REGEX.WHITESPACES, '');
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

exports.publishEvent = publishEvent;

},{"./util":25}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _config = require("./config");

var _util = require("./util");

var _domWalker = _interopRequireDefault(require("./domWalker"));

var _binder = require("./binder");

var _commentWrapper = require("./commentWrapper");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/* eslint-disable no-invalid-this */
var renderForOfBinding = function renderForOfBinding(_ref) {
  var bindingData = _ref.bindingData,
      viewModel = _ref.viewModel,
      bindingAttrs = _ref.bindingAttrs;

  if (!bindingData || !viewModel || !bindingAttrs) {
    return;
  }

  var keys;
  var iterationDataLength;
  var iterationData = (0, _util.getViewModelPropValue)(viewModel, bindingData.iterator);
  var isRegenerate = false; // check iterationData and set iterationDataLength

  if ((0, _util.isArray)(iterationData)) {
    iterationDataLength = iterationData.length;
  } else if ((0, _util.isPlainObject)(iterationData)) {
    keys = Object.keys(iterationData);
    iterationDataLength = keys.length;
  } else {
    // throw error but let script contince to run
    return (0, _util.throwErrorMessage)(null, 'iterationData is not an plain object or array');
  } // flag as pared for-of logic with bindingData.type


  if (!bindingData.type) {
    bindingData.type = _config.bindingAttrs.forOf;
    (0, _commentWrapper.wrapCommentAround)(bindingData, bindingData.el);
  } // assign forOf internal id to bindingData once


  if (typeof bindingData.iterationSize === 'undefined') {
    // store iterationDataLength
    bindingData.iterationSize = iterationDataLength; // remove orignal node for-of attributes

    bindingData.el.removeAttribute(bindingAttrs.forOf);
    isRegenerate = true;
  } else {
    // only regenerate cache if iterationDataLength changed
    isRegenerate = bindingData.iterationSize !== iterationDataLength; // update iterationSize

    bindingData.iterationSize = iterationDataLength;
  }

  if (!isRegenerate) {
    bindingData.iterationBindingCache.forEach(function (elementCache, i) {
      if (!(0, _util.isEmptyObject)(elementCache)) {
        var iterationVm = createIterationViewModel({
          bindingData: bindingData,
          viewModel: viewModel,
          iterationData: iterationData,
          keys: keys,
          index: i
        });
        (0, _binder.renderIteration)({
          elementCache: elementCache,
          iterationVm: iterationVm,
          bindingAttrs: bindingAttrs,
          isRegenerate: false
        });
      }
    });
    return;
  } // generate forOfBinding elements into fragment


  var fragment = generateForOfElements(bindingData, viewModel, bindingAttrs, iterationData, keys);
  (0, _commentWrapper.removeElemnetsByCommentWrap)(bindingData); // insert fragment content into DOM

  return (0, _commentWrapper.insertRenderedElements)(bindingData, fragment);
};

var createIterationViewModel = function createIterationViewModel(_ref2) {
  var bindingData = _ref2.bindingData,
      viewModel = _ref2.viewModel,
      iterationData = _ref2.iterationData,
      keys = _ref2.keys,
      index = _ref2.index;
  var iterationVm = {};
  iterationVm[bindingData.iterator.alias] = keys ? iterationData[keys[index]] : iterationData[index]; // populate common binding data reference

  iterationVm[_config.bindingDataReference.rootDataKey] = viewModel.$root || viewModel;
  iterationVm[_config.bindingDataReference.currentData] = iterationVm[bindingData.iterator.alias];
  iterationVm[_config.bindingDataReference.currentIndex] = index;
  return iterationVm;
};

var generateForOfElements = function generateForOfElements(bindingData, viewModel, bindingAttrs, iterationData, keys) {
  var fragment = document.createDocumentFragment();
  var iterationDataLength = bindingData.iterationSize;
  var clonedItem;
  var iterationVm;
  var iterationBindingCache;
  var i = 0; // create or clear exisitng iterationBindingCache

  if ((0, _util.isArray)(bindingData.iterationBindingCache)) {
    bindingData.iterationBindingCache.length = 0;
  } else {
    bindingData.iterationBindingCache = [];
  } // generate forOf and append to DOM


  for (i = 0; i < iterationDataLength; i += 1) {
    clonedItem = (0, _util.cloneDomNode)(bindingData.el); // create bindingCache per iteration

    iterationBindingCache = (0, _domWalker["default"])({
      rootNode: clonedItem,
      bindingAttrs: bindingAttrs
    });
    bindingData.iterationBindingCache.push(iterationBindingCache);

    if (!(0, _util.isEmptyObject)(iterationBindingCache)) {
      // create an iterationVm match iterator alias
      iterationVm = createIterationViewModel({
        bindingData: bindingData,
        viewModel: viewModel,
        iterationData: iterationData,
        keys: keys,
        index: i
      });
      (0, _binder.renderIteration)({
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

var _default = renderForOfBinding;
exports["default"] = _default;

},{"./binder":2,"./commentWrapper":6,"./config":7,"./domWalker":10,"./util":25}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeIfBinding = exports.renderIfBinding = void 0;

var _util = require("./util");

var _binder = require("./binder");

var _domWalker = _interopRequireDefault(require("./domWalker"));

var _config = require("./config");

var _commentWrapper = require("./commentWrapper");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
      if (endCommentTag.textContent === commentStartTextContent + _config.commentSuffix) {
        ret = true;
      }
    }
  }

  return ret;
};

var renderIfBinding = function renderIfBinding(_ref) {
  var bindingData = _ref.bindingData,
      viewModel = _ref.viewModel,
      bindingAttrs = _ref.bindingAttrs;

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
    bindingData.iterationBindingCache = (0, _domWalker["default"])({
      rootNode: rootElement,
      bindingAttrs: bindingAttrs
    });
  } // only render if has iterationBindingCache
  // means has other dataBindings to be render


  if (!(0, _util.isEmptyObject)(bindingData.iterationBindingCache)) {
    bindingData.hasIterationBindingCache = true;
    (0, _binder.renderIteration)({
      elementCache: bindingData.iterationBindingCache,
      iterationVm: viewModel,
      bindingAttrs: bindingAttrs,
      isRegenerate: true
    });
  } // insert to new rendered DOM
  // TODO: check unnecessary insertion when DOM is preserved


  (0, _commentWrapper.insertRenderedElements)(bindingData, rootElement);
};

exports.renderIfBinding = renderIfBinding;

var removeIfBinding = function removeIfBinding(bindingData) {
  (0, _commentWrapper.removeElemnetsByCommentWrap)(bindingData); // remove cache.IterationBindingCache to prevent memory leak

  if (bindingData.hasIterationBindingCache) {
    delete bindingData.iterationBindingCache;
    delete bindingData.hasIterationBindingCache;
  }
};

exports.removeIfBinding = removeIfBinding;

},{"./binder":2,"./commentWrapper":6,"./config":7,"./domWalker":10,"./util":25}],20:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _config = require("./config");

var _util = require("./util");

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


var renderTemplate = function renderTemplate(cache, viewModel, bindingAttrs, elementCache) {
  var settings = typeof cache.dataKey === 'string' ? (0, _util.parseStringToJson)(cache.dataKey) : cache.dataKey;
  var viewData = settings.data;
  var isAppend = settings.append;
  var isPrepend = settings.prepend;
  var html;
  var $element;
  var $index;
  var $currentElement;
  var $nestedTemplates;
  cache.dataKey = settings;
  viewData = typeof viewData === 'undefined' || viewData === '$root' ? viewModel : (0, _util.getViewModelPropValue)(viewModel, {
    dataKey: settings.data,
    parameters: cache.parameters
  });

  if (!viewData) {
    return;
  }

  $element = $(cache.el);
  $index = typeof viewModel.$index !== 'undefined' ? viewModel.$index : $element.attr(_config.dataIndexAttr);

  if (typeof $index !== 'undefined') {
    viewData.$index = $index;
  }

  $domFragment = $domFragment ? $domFragment : $('<div/>');
  $templateRoot = $templateRoot ? $templateRoot : $element;
  html = compileTemplate(settings.id, viewData); // domFragment should be empty in first run
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


  $nestedTemplates = $currentElement.find('[' + bindingAttrs.tmp + ']');

  if ($nestedTemplates.length) {
    nestTemplatesCount += $nestedTemplates.length;
    $nestedTemplates.each(function (index, element) {
      var thisTemplateCache = {
        el: element,
        dataKey: element.getAttribute(bindingAttrs.tmp)
      };
      elementCache[bindingAttrs.tmp].push(thisTemplateCache); // recursive template render

      renderTemplate(thisTemplateCache, viewModel, bindingAttrs, elementCache);
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

var _default = renderTemplate;
exports["default"] = _default;

},{"./config":7,"./util":25}],21:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _util = require("./util");

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

  shouldShow = (0, _util.getViewModelPropValue)(viewModel, cache); // treat undefined || null as false.
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

var _default = showBinding;
exports["default"] = _default;

},{"./util":25}],22:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _util = require("./util");

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
  var handlerFn;
  var $element;
  var viewModelContext;
  var APP = viewModel.APP || viewModel.$root.APP;

  if (!handlerName || !forceRender && !APP.$rootElement.contains(cache.el)) {
    return;
  }

  handlerFn = (0, _util.getViewModelValue)(viewModel, handlerName);
  $element = $(cache.el);

  if (typeof handlerFn === 'function') {
    viewModelContext = (0, _util.resolveViewModelContext)(viewModel, handlerName);
    paramList = paramList ? (0, _util.resolveParamList)(viewModel, paramList) : []; // assing on change event

    $element.off('submit.databind').on('submit.databind', function (e) {
      var args = [e, $element, (0, _util.getFormData)($element)].concat(paramList);
      handlerFn.apply(viewModelContext, args);
    });
  }
};

var _default = submitBinding;
exports["default"] = _default;

},{"./util":25}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _util = require("./util");

var _commentWrapper = require("./commentWrapper");

var _renderIfBinding = require("./renderIfBinding");

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
  var newExpression = (0, _util.getViewModelPropValue)(viewModel, cache);

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
        (0, _commentWrapper.wrapCommentAround)(caseData, caseData.el); // remove binding attribute for later dataBind parse

        if (caseData.isDefault) {
          caseData.el.removeAttribute(bindingAttrs["default"]);
        } else {
          caseData.el.removeAttribute(bindingAttrs["case"]);
        }

        (0, _commentWrapper.createClonedElementCache)(caseData);
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
        newCaseValue = (0, _util.getViewModelPropValue)(viewModel, cache.cases[j]) || cache.cases[j].dataKey;
      }

      if (newCaseValue === cache.elementData.viewModelPropValue || cache.cases[j].isDefault) {
        hasMatch = true; // render element

        (0, _renderIfBinding.renderIfBinding)({
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
      (0, _renderIfBinding.removeIfBinding)(caseData); // remove cache.IterationBindingCache to prevent memory leak

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

var _default = switchBinding;
exports["default"] = _default;

},{"./commentWrapper":6,"./renderIfBinding":19,"./util":25}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _util = require("./util");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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

  var newValue = (0, _util.getViewModelPropValue)(viewModel, cache);
  var oldValue = cache.el.textContent;

  if (typeof newValue !== 'undefined' && _typeof(newValue) !== 'object' && newValue !== null) {
    if (newValue !== oldValue) {
      cache.el.textContent = newValue;
    }
  }
};

var _default = textBinding;
exports["default"] = _default;

},{"./util":25}],25:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.throwErrorMessage = exports.setViewModelValue = exports.resolveViewModelContext = exports.resolveParamList = exports.removeElement = exports.parseStringToJson = exports.isPlainObject = exports.isJsObject = exports.isEmptyObject = exports.isArray = exports.invertObj = exports.insertAfter = exports.getViewModelValue = exports.getViewModelPropValue = exports.getNodeAttrObj = exports.getFunctionParameterList = exports.getFormData = exports.generateElementCache = exports.extractFilterList = exports.extend = exports.each = exports.debounceRaf = exports.cloneDomNode = exports.arrayRemoveMatch = exports.REGEX = void 0;

var config = _interopRequireWildcard(require("./config"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// require to use lodash
_ = window._ || {};
var hasIsArray = Array.isArray;
var supportPromise = false; //  typeof window['Promise'] === 'function';

var REGEX = {
  FUNCTIONPARAM: /\((.*?)\)/,
  WHITESPACES: /\s+/g,
  FOROF: /(.*?)\s+(?:in|of)\s+(.*)/,
  PIPE: /\|/
};
exports.REGEX = REGEX;

var generateElementCache = function generateElementCache(bindingAttrs) {
  var elementCache = {};
  $.each(bindingAttrs, function (k, v) {
    elementCache[v] = [];
  });
  return elementCache;
};

exports.generateElementCache = generateElementCache;

var isArray = function isArray(obj) {
  return hasIsArray ? Array.isArray(obj) : Object.prototype.toString.call(obj) === '[object Array]';
};

exports.isArray = isArray;

var isJsObject = function isJsObject(obj) {
  return obj !== null && _typeof(obj) === 'object' && Object.prototype.toString.call(obj) === '[object Object]';
};

exports.isJsObject = isJsObject;

var isPlainObject = function isPlainObject(obj) {
  var ctor;
  var prot;

  if (!isJsObject(obj)) {
    return false;
  } // If has modified constructor


  ctor = obj.constructor;
  if (typeof ctor !== 'function') return false; // If has modified prototype

  prot = ctor.prototype;
  if (isJsObject(prot) === false) return false; // If constructor does not have an Object-specific method

  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  } // Most likely a plain Object


  return true;
};

exports.isPlainObject = isPlainObject;

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


exports.isEmptyObject = isEmptyObject;

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


exports.getViewModelValue = getViewModelValue;

var setViewModelValue = function setViewModelValue(obj, prop, value) {
  return _.set(obj, prop, value);
};

exports.setViewModelValue = setViewModelValue;

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

exports.getViewModelPropValue = getViewModelPropValue;

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


exports.parseStringToJson = parseStringToJson;

var arrayRemoveMatch = function arrayRemoveMatch(toArray, frommArray) {
  return toArray.filter(function (value, index) {
    return frommArray.indexOf(value) < 0;
  });
};

exports.arrayRemoveMatch = arrayRemoveMatch;

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


exports.getFormData = getFormData;

var getFunctionParameterList = function getFunctionParameterList(str) {
  if (!str || str.length > config.maxDatakeyLength) {
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

exports.getFunctionParameterList = getFunctionParameterList;

var extractFilterList = function extractFilterList(cacheData) {
  if (!cacheData || !cacheData.dataKey || cacheData.dataKey.length > config.maxDatakeyLength) {
    return cacheData;
  }

  var filterList = cacheData.dataKey.split(REGEX.PIPE);
  var isOnceIndex;
  cacheData.dataKey = filterList[0].trim();

  if (filterList.length > 1) {
    filterList.shift(0);
    filterList.forEach(function (v, i) {
      filterList[i] = v.trim();

      if (filterList[i] === config.constants.filters.ONCE) {
        cacheData.isOnce = true;
        isOnceIndex = i;
      }
    });

    if (isOnceIndex >= 0) {
      filterList.splice(isOnceIndex, 1);
    }

    cacheData.filters = filterList;
  }

  return cacheData;
};

exports.extractFilterList = extractFilterList;

var invertObj = function invertObj(sourceObj) {
  return Object.keys(sourceObj).reduce(function (obj, key) {
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


exports.invertObj = invertObj;

var debounceRaf = function debounceRaf(fn) {
  var ctx = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  return function (fn, ctx) {
    var dfObj = supportPromise ? {} : $.Deferred(); // eslint-disable-line new-cap

    var rafId = 0;

    if (supportPromise) {
      dfObj.promise = new Promise(function (resolve, reject) {
        dfObj.resolve = resolve;
        dfObj.reject = reject;
      });
    } // return decorated fn


    return function () {
      var _arguments = arguments;
      var args;
      /* eslint-disable prefer-rest-params */

      args = Array.from ? Array.from(arguments) : Array.prototype.slice.call(arguments);
      window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(function () {
        if (supportPromise) {
          var fnPromise = new Promise(fn.bind(ctx));
          Promise.all([fnPromise]).then(dfObj.resolve.apply(ctx, _arguments), dfObj.reject.apply(ctx, _arguments));
        } else {
          $.when(fn.apply(ctx, args)).then(dfObj.resolve.apply(ctx, _arguments), dfObj.reject.apply(ctx, _arguments), dfObj.notify.apply(ctx, _arguments));
          dfObj = $.Deferred(); // eslint-disable-line new-cap
        }

        window.cancelAnimationFrame(rafId);
      });
      /* eslint-enable prefer-rest-params */

      return supportPromise ? dfObj.promise : dfObj.promise();
    };
  }(fn, ctx);
};
/**
 * getNodeAttrObj
 * @description convert Node attributes object to a json object
 * @param {object} node
 * @param {array} skipList
 * @return {object}
 */


exports.debounceRaf = debounceRaf;

var getNodeAttrObj = function getNodeAttrObj(node, skipList) {
  var attrObj;
  var attributesLength = 0;
  var skipArray;

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
    for (var i = 0; i < attributesLength; i += 1) {
      var attribute = node.attributes.item(i);
      attrObj[attribute.nodeName] = attribute.nodeValue;
    }
  }

  if (isArray(skipArray)) {
    skipArray.forEach(function (item) {
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


exports.getNodeAttrObj = getNodeAttrObj;

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

exports.extend = extend;

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

exports.each = each;

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


exports.cloneDomNode = cloneDomNode;

var insertAfter = function insertAfter(parentNode, newNode, referenceNode) {
  var refNextElement = referenceNode && referenceNode.nextSibling ? referenceNode.nextSibling : null;
  return parentNode.insertBefore(newNode, refNextElement);
};

exports.insertAfter = insertAfter;

var resolveViewModelContext = function resolveViewModelContext(viewModel, datakey) {
  var ret = viewModel;
  var bindingDataContext;

  if (typeof datakey !== 'string') {
    return ret;
  }

  bindingDataContext = datakey.split('.');

  if (bindingDataContext.length > 1) {
    if (bindingDataContext[0] === config.bindingDataReference.rootDataKey) {
      ret = viewModel[config.bindingDataReference.rootDataKey] || viewModel;
    } else if (bindingDataContext[0] === config.bindingDataReference.currentData) {
      ret = viewModel[config.bindingDataReference.currentData] || viewModel;
    }
  }

  return ret;
};

exports.resolveViewModelContext = resolveViewModelContext;

var resolveParamList = function resolveParamList(viewModel, paramList) {
  if (!viewModel || !isArray(paramList)) {
    return;
  }

  return paramList.map(function (param) {
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

exports.resolveParamList = resolveParamList;

var removeElement = function removeElement(el) {
  if (el && el.parentNode) {
    el.parentNode.removeChild(el);
  }
};

exports.removeElement = removeElement;

var throwErrorMessage = function throwErrorMessage() {
  var err = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var errorMessage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var message = err && err.message ? err.message : errorMessage;

  if (typeof console.error === 'function') {
    return console.error(message);
  }

  return console.log(message);
};

exports.throwErrorMessage = throwErrorMessage;

},{"./config":7}]},{},[15])


//# sourceMappingURL=dataBind.js.map
