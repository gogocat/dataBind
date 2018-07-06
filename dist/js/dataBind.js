/**
 * dataBind - Simple MV* framework work with jQuery and underscore template
 * @version v1.7.0
 * @link https://github.com/gogocat/dataBind#readme
 * @license MIT
 */
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _util = require('./util');

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

    if (!(0, _util.isPlainObject)(vmAttrObj) || (0, _util.isEmptyObject)(vmAttrObj)) {
        // reject if vmAttrListObj is not an object or empty
        return;
    }

    // reject if nothing changed
    if (JSON.stringify(oldAttrObj) === JSON.stringify(vmAttrObj)) {
        return;
    }

    // get current DOM element attributes object
    // let domAttrObj = util.getNodeAttrObj(cache.el, [bindingAttrs.attr]);

    if ((0, _util.isEmptyObject)(oldAttrObj)) {
        for (var key in vmAttrObj) {
            if (vmAttrObj.hasOwnProperty(key)) {
                cache.el.setAttribute(key, vmAttrObj[key]);
            }
        }
    } else {
        for (var _key in oldAttrObj) {
            if (oldAttrObj.hasOwnProperty(_key)) {
                if (vmAttrObj[_key] === undefined) {
                    // remove attribute if not present in current vm
                    cache.el.removeAttribute(_key);
                }
            }
        }
        for (var _key2 in vmAttrObj) {
            if (vmAttrObj.hasOwnProperty(_key2)) {
                if (oldAttrObj[_key2] !== vmAttrObj[_key2]) {
                    // update attribute if value changed
                    cache.el.setAttribute(_key2, vmAttrObj[_key2]);
                }
            }
        }
    }
    // update element data
    cache.elementData.viewModelProValue = vmAttrObj;
};

exports['default'] = attrBinding;

},{"./util":24}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.renderIteration = exports.renderTemplatesBinding = exports.createBindingOption = exports.Binder = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _config = require('./config');

var config = _interopRequireWildcard(_config);

var _util = require('./util');

var _renderTemplate = require('./renderTemplate');

var _renderTemplate2 = _interopRequireDefault(_renderTemplate);

var _clickBinding = require('./clickBinding');

var _clickBinding2 = _interopRequireDefault(_clickBinding);

var _dbclickBinding = require('./dbclickBinding');

var _dbclickBinding2 = _interopRequireDefault(_dbclickBinding);

var _blurBinding = require('./blurBinding');

var _blurBinding2 = _interopRequireDefault(_blurBinding);

var _focusBinding = require('./focusBinding');

var _focusBinding2 = _interopRequireDefault(_focusBinding);

var _changeBinding = require('./changeBinding');

var _changeBinding2 = _interopRequireDefault(_changeBinding);

var _modelBinding = require('./modelBinding');

var _modelBinding2 = _interopRequireDefault(_modelBinding);

var _submitBinding = require('./submitBinding');

var _submitBinding2 = _interopRequireDefault(_submitBinding);

var _textBinding = require('./textBinding');

var _textBinding2 = _interopRequireDefault(_textBinding);

var _showBinding = require('./showBinding');

var _showBinding2 = _interopRequireDefault(_showBinding);

var _cssBinding = require('./cssBinding');

var _cssBinding2 = _interopRequireDefault(_cssBinding);

var _attrBinding = require('./attrBinding');

var _attrBinding2 = _interopRequireDefault(_attrBinding);

var _forOfBinding = require('./forOfBinding');

var _forOfBinding2 = _interopRequireDefault(_forOfBinding);

var _ifBinding = require('./ifBinding');

var _ifBinding2 = _interopRequireDefault(_ifBinding);

var _switchBinding = require('./switchBinding');

var _switchBinding2 = _interopRequireDefault(_switchBinding);

var _domWalker = require('./domWalker');

var _domWalker2 = _interopRequireDefault(_domWalker);

var _pubSub = require('./pubSub');

var pubSub = _interopRequireWildcard(_pubSub);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var compIdIndex = 0;
var rootDataKey = config.bindingDataReference.rootDataKey;

var Binder = function () {
    function Binder($rootElement, viewModel, bindingAttrs) {
        _classCallCheck(this, Binder);

        if (!$rootElement instanceof jQuery || !$rootElement.length || viewModel === null || (typeof viewModel === 'undefined' ? 'undefined' : _typeof(viewModel)) !== 'object') {
            throw new TypeError('$rootElement or viewModel is invalid');
        }

        this.initRendered = false;

        this.compId = compIdIndex += 1;

        this.$rootElement = $rootElement.eq(0);

        this.viewModel = viewModel;

        this.bindingAttrs = bindingAttrs;

        this.render = (0, _util.debounceRaf)(this.render, this);

        this.isServerRendered = typeof this.$rootElement.attr(config.serverRenderedAttr) !== 'undefined';

        // inject instance into viewModel
        this.viewModel.APP = this;

        this.viewModel.$root = this.viewModel;

        this.parseView();

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
        key: 'parseView',
        value: function parseView() {
            // store viewModel data as $root for easy access
            this.$rootElement.data(rootDataKey, this.viewModel);

            this.elementCache = (0, _domWalker2['default'])({
                rootNode: this.$rootElement[0],
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

    }, {
        key: 'updateElementCache',
        value: function updateElementCache() {
            var _this = this;

            var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var elementCache = opt.elementCache || this.elementCache;

            if (opt.allCache) {
                // walk dom from root element to regenerate elementCache
                this.elementCache = (0, _domWalker2['default'])({
                    rootNode: this.$rootElement[0],
                    bindingAttrs: this.bindingAttrs
                });
            }
            // walk from first rendered template node to create/update child bindingCache
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
                        cache.bindingCache = (0, _domWalker2['default'])({
                            rootNode: cache.el,
                            bindingAttrs: _this.bindingAttrs,
                            skipCheck: skipForOfParseFn
                        });
                    });
                }
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var updateOption = {};
            if (!this.initRendered) {
                // only update eventsBinding if server rendered
                if (this.isServerRendered) {
                    this.$rootElement.removeAttr(config.serverRenderedAttr);
                    updateOption = createBindingOption(config.bindingUpdateConditions.serverRendered, opt);
                } else {
                    updateOption = createBindingOption(config.bindingUpdateConditions.init, opt);
                }
            } else {
                // when called again only update visualBinding options
                updateOption = createBindingOption('', opt);
            }

            // render and apply binding to template(s)
            // this is an share function therefore passing 'this' context
            renderTemplatesBinding({
                ctx: this,
                elementCache: this.elementCache,
                updateOption: updateOption,
                bindingAttrs: this.bindingAttrs,
                viewModel: this.viewModel
            });

            // apply bindings to rest of the DOM
            Binder.applyBinding({
                elementCache: this.elementCache,
                updateOption: updateOption,
                bindingAttrs: this.bindingAttrs,
                viewModel: this.viewModel
            });

            this.initRendered = true;
        }
    }, {
        key: 'subscribe',
        value: function subscribe() {
            var eventName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
            var fn = arguments[1];

            pubSub.subscribeEvent(this, eventName, fn);
            return this;
        }
    }, {
        key: 'subscribeOnce',
        value: function subscribeOnce() {
            var eventName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
            var fn = arguments[1];

            pubSub.subscribeEventOnce(this, eventName, fn);
            return this;
        }
    }, {
        key: 'unsubscribe',
        value: function unsubscribe() {
            var eventName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

            pubSub.unsubscribeEvent(this.compId, eventName);
            return this;
        }
    }, {
        key: 'unsubscribeAll',
        value: function unsubscribeAll() {
            pubSub.unsubscribeAllEvent(this.compId);
            return this;
        }
    }, {
        key: 'publish',
        value: function publish() {
            var eventName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            pubSub.publishEvent.apply(pubSub, [eventName].concat(args));
            return this;
        }
    }], [{
        key: 'applyBinding',
        value: function applyBinding(_ref) {
            var elementCache = _ref.elementCache,
                updateOption = _ref.updateOption,
                bindingAttrs = _ref.bindingAttrs,
                viewModel = _ref.viewModel;

            if (!elementCache || !updateOption) {
                return;
            }

            // the follow binding should be in order for better efficiency

            // apply forOf Binding
            if (updateOption.forOfBinding && elementCache[bindingAttrs.forOf] && elementCache[bindingAttrs.forOf].length) {
                elementCache[bindingAttrs.forOf].forEach(function (cache) {
                    (0, _forOfBinding2['default'])(cache, viewModel, bindingAttrs);
                });
            }

            // apply attr Binding
            if (updateOption.attrBinding && elementCache[bindingAttrs.attr] && elementCache[bindingAttrs.attr].length) {
                elementCache[bindingAttrs.attr].forEach(function (cache) {
                    (0, _attrBinding2['default'])(cache, viewModel, bindingAttrs);
                });
            }

            // apply if Binding
            if (updateOption.ifBinding && elementCache[bindingAttrs['if']] && elementCache[bindingAttrs['if']].length) {
                elementCache[bindingAttrs['if']].forEach(function (cache) {
                    (0, _ifBinding2['default'])(cache, viewModel, bindingAttrs);
                });
            }

            // apply show Binding
            if (updateOption.showBinding && elementCache[bindingAttrs.show] && elementCache[bindingAttrs.show].length) {
                elementCache[bindingAttrs.show].forEach(function (cache) {
                    (0, _showBinding2['default'])(cache, viewModel, bindingAttrs);
                });
            }

            // apply switch Binding
            if (updateOption.switchBinding && elementCache[bindingAttrs['switch']] && elementCache[bindingAttrs['switch']].length) {
                elementCache[bindingAttrs['switch']].forEach(function (cache) {
                    (0, _switchBinding2['default'])(cache, viewModel, bindingAttrs);
                });
            }

            // apply text binding
            if (updateOption.textBinding && elementCache[bindingAttrs.text] && elementCache[bindingAttrs.text].length) {
                elementCache[bindingAttrs.text].forEach(function (cache) {
                    (0, _textBinding2['default'])(cache, viewModel, bindingAttrs);
                });
            }

            // apply cssBinding
            if (updateOption.cssBinding && elementCache[bindingAttrs.css] && elementCache[bindingAttrs.css].length) {
                elementCache[bindingAttrs.css].forEach(function (cache) {
                    (0, _cssBinding2['default'])(cache, viewModel, bindingAttrs);
                });
            }

            // apply model binding
            if (updateOption.modelBinding && elementCache[bindingAttrs.model] && elementCache[bindingAttrs.model].length) {
                elementCache[bindingAttrs.model].forEach(function (cache) {
                    (0, _modelBinding2['default'])(cache, viewModel, bindingAttrs);
                });
            }

            // apply change binding
            if (updateOption.changeBinding && elementCache[bindingAttrs.change] && elementCache[bindingAttrs.change].length) {
                elementCache[bindingAttrs.change].forEach(function (cache) {
                    (0, _changeBinding2['default'])(cache, viewModel, bindingAttrs);
                });
            }

            // apply submit binding
            if (updateOption.submitBinding && elementCache[bindingAttrs.submit] && elementCache[bindingAttrs.submit].length) {
                elementCache[bindingAttrs.submit].forEach(function (cache) {
                    (0, _submitBinding2['default'])(cache, viewModel, bindingAttrs);
                });
            }

            // apply click binding
            if (updateOption.clickBinding && elementCache[bindingAttrs.click] && elementCache[bindingAttrs.click].length) {
                elementCache[bindingAttrs.click].forEach(function (cache) {
                    (0, _clickBinding2['default'])(cache, viewModel, bindingAttrs);
                });
            }

            // apply double click binding
            if (updateOption.dblclickBinding && elementCache[bindingAttrs.dblclick] && elementCache[bindingAttrs.dblclick].length) {
                elementCache[bindingAttrs.dblclick].forEach(function (cache) {
                    (0, _dbclickBinding2['default'])(cache, viewModel, bindingAttrs);
                });
            }

            // apply blur binding
            if (updateOption.blurBinding && elementCache[bindingAttrs.blur] && elementCache[bindingAttrs.blur].length) {
                elementCache[bindingAttrs.blur].forEach(function (cache) {
                    (0, _blurBinding2['default'])(cache, viewModel, bindingAttrs);
                });
            }

            // apply focus binding
            if (updateOption.focus && elementCache[bindingAttrs.focus] && elementCache[bindingAttrs.focus].length) {
                elementCache[bindingAttrs.focus].forEach(function (cache) {
                    (0, _focusBinding2['default'])(cache, viewModel, bindingAttrs);
                });
            }
        }
    }]);

    return Binder;
}();

var renderTemplatesBinding = function renderTemplatesBinding(_ref2) {
    var ctx = _ref2.ctx,
        elementCache = _ref2.elementCache,
        updateOption = _ref2.updateOption,
        bindingAttrs = _ref2.bindingAttrs,
        viewModel = _ref2.viewModel;

    if (!elementCache || !bindingAttrs) {
        return false;
    }
    // render and apply binding to template(s) and forOf DOM
    if (elementCache[bindingAttrs.tmp] && elementCache[bindingAttrs.tmp].length) {
        // when re-render call with {templateBinding: true}
        // template and nested templates
        if (updateOption.templateBinding) {
            // overwrite updateOption with 'init' bindingUpdateConditions
            updateOption = createBindingOption(config.bindingUpdateConditions.init);

            elementCache[bindingAttrs.tmp].forEach(function ($element) {
                (0, _renderTemplate2['default'])($element, viewModel, bindingAttrs, elementCache);
            });
            // update cache after all template(s) rendered
            ctx.updateElementCache({
                templateCache: true,
                elementCache: elementCache
            });
        }
        // apply bindings to rendered templates element
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
        submitBinding: true
    };
    // this is visualBindingOptions but everything false
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
var renderIteration = function renderIteration(_ref3) {
    var elementCache = _ref3.elementCache,
        iterationVm = _ref3.iterationVm,
        bindingAttrs = _ref3.bindingAttrs,
        isRegenerate = _ref3.isRegenerate;

    var bindingUpdateOption = isRegenerate ? createBindingOption(config.bindingUpdateConditions.init) : createBindingOption();

    // render and apply binding to template(s)
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

exports.Binder = Binder;
exports.createBindingOption = createBindingOption;
exports.renderTemplatesBinding = renderTemplatesBinding;
exports.renderIteration = renderIteration;

},{"./attrBinding":1,"./blurBinding":3,"./changeBinding":4,"./clickBinding":5,"./config":7,"./cssBinding":8,"./dbclickBinding":9,"./domWalker":10,"./focusBinding":11,"./forOfBinding":12,"./ifBinding":13,"./modelBinding":15,"./pubSub":16,"./renderTemplate":19,"./showBinding":20,"./submitBinding":21,"./switchBinding":22,"./textBinding":23,"./util":24}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _util = require('./util');

/**
 * blurBinding
 * DOM decleartive on blur event binding
 * event handler bind to viewModel method according to the DOM attribute
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
var blurBinding = function blurBinding(cache, viewModel, bindingAttrs) {
    var handlerName = cache.dataKey;
    var paramList = cache.parameters;
    var handlerFn = void 0;
    var viewModelContext = void 0;

    if (!handlerName) {
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
}; /* eslint-disable no-invalid-this */
exports['default'] = blurBinding;

},{"./util":24}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _util = require('./util');

/**
 * changeBinding
 * @description input element on change event binding. DOM -> viewModel update
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
var changeBinding = function changeBinding(cache, viewModel, bindingAttrs) {
    var handlerName = cache.dataKey;
    var paramList = cache.parameters;
    var modelDataKey = cache.el.getAttribute(bindingAttrs.model);
    var handlerFn = void 0;
    var newValue = void 0;
    var oldValue = void 0;
    var viewModelContext = void 0;

    if (!handlerName) {
        return;
    }

    handlerFn = (0, _util.getViewModelValue)(viewModel, handlerName);

    if (typeof handlerFn === 'function') {
        viewModelContext = (0, _util.resolveViewModelContext)(viewModel, handlerName);
        paramList = paramList ? (0, _util.resolveParamList)(viewModel, paramList) : [];

        // assing on change event
        $(cache.el).off('change.databind').on('change.databind', function (e) {
            var $this = $(this);
            var isCheckbox = $this.is(':checkbox');
            newValue = isCheckbox ? $this.prop('checked') : _.escape($this.val());
            // set data to viewModel
            if (modelDataKey) {
                oldValue = (0, _util.getViewModelValue)(viewModel, modelDataKey);
                (0, _util.setViewModelValue)(viewModel, modelDataKey, newValue);
            }
            var args = [e, $this, newValue, oldValue].concat(paramList);
            handlerFn.apply(viewModelContext, args);
            oldValue = newValue;
        });
    }
}; /* eslint-disable no-invalid-this */
exports['default'] = changeBinding;

},{"./util":24}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _util = require('./util');

/**
 * clickBinding
 * @description
 * DOM decleartive click event binding
 * event handler bind to viewModel method according to the DOM attribute
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
var clickBinding = function clickBinding(cache, viewModel, bindingAttrs) {
    var handlerName = cache.dataKey;
    var paramList = cache.parameters;
    var handlerFn = void 0;
    var viewModelContext = void 0;

    if (!handlerName) {
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
}; /* eslint-disable no-invalid-this */
exports['default'] = clickBinding;

},{"./util":24}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.insertRenderedElements = exports.setDocRangeEndAfter = exports.removeDomTemplateElement = exports.removeElemnetsByCommentWrap = exports.wrapCommentAround = exports.setCommentPrefix = exports.createClonedElementCache = undefined;

var _config = require('./config');

var config = _interopRequireWildcard(_config);

var _util = require('./util');

var util = _interopRequireWildcard(_util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

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
    var commentPrefix = '';
    var dataKeyMarker = bindingData.dataKey ? bindingData.dataKey.replace(util.REGEX.WHITESPACES, '_') : '';

    switch (bindingData.type) {
        case config.bindingAttrs.forOf:
            commentPrefix = config.commentPrefix.forOf;
            break;
        case config.bindingAttrs['if']:
            commentPrefix = config.commentPrefix['if'];
            break;
        case config.bindingAttrs['case']:
            commentPrefix = config.commentPrefix['case'];
            break;
        case config.bindingAttrs['default']:
            commentPrefix = config.commentPrefix['default'];
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
var setDocRangeEndAfter = function setDocRangeEndAfter(node, bindingData) {
    if (!bindingData.commentPrefix) {
        setCommentPrefix(bindingData);
    }
    var startTextContent = bindingData.commentPrefix;
    var endTextContent = startTextContent + config.commentSuffix;
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
var wrapCommentAround = function wrapCommentAround(bindingData, node) {
    var commentBegin = void 0;
    var commentEnd = void 0;
    var prefix = '';
    if (!bindingData.commentPrefix) {
        setCommentPrefix(bindingData);
    }
    prefix = bindingData.commentPrefix;
    commentBegin = document.createComment(prefix);
    commentEnd = document.createComment(prefix + config.commentSuffix);
    // document fragment - logic for ForOf binding
    if (node.nodeType === 11) {
        node.insertBefore(commentBegin, node.firstChild);
        node.appendChild(commentEnd);
    } else {
        node.parentNode.insertBefore(commentBegin, node);
        util.insertAfter(node.parentNode, commentEnd, node);
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
var removeDomTemplateElement = function removeDomTemplateElement(bindingData) {
    // first render - forElement is live DOM element so has parentNode
    if (bindingData.el.parentNode) {
        return bindingData.el.parentNode.removeChild(bindingData.el);
    }
    removeElemnetsByCommentWrap(bindingData);
};

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

exports.createClonedElementCache = createClonedElementCache;
exports.setCommentPrefix = setCommentPrefix;
exports.wrapCommentAround = wrapCommentAround;
exports.removeElemnetsByCommentWrap = removeElemnetsByCommentWrap;
exports.removeDomTemplateElement = removeDomTemplateElement;
exports.setDocRangeEndAfter = setDocRangeEndAfter;
exports.insertRenderedElements = insertRenderedElements;

},{"./config":7,"./util":24}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var bindingAttrs = {
    comp: 'data-jq-comp',
    tmp: 'data-jq-tmp',
    text: 'data-jq-text',
    click: 'data-jq-click',
    dblclick: 'data-jq-dblclick',
    blur: 'data-jq-blur',
    focus: 'data-jq-focus',
    change: 'data-jq-change',
    submit: 'data-jq-submit',
    model: 'data-jq-model',
    show: 'data-jq-show',
    css: 'data-jq-css',
    attr: 'data-jq-attr',
    forOf: 'data-jq-for',
    'if': 'data-jq-if',
    'switch': 'data-jq-switch',
    'case': 'data-jq-case',
    'default': 'data-jq-default'
};
var serverRenderedAttr = 'data-server-rendered';
var dataIndexAttr = 'data-index';
var commentPrefix = {
    forOf: 'data-forOf_',
    'if': 'data-if_',
    'case': 'data-case_',
    'default': 'data-default_'
};
var commentSuffix = '_end';

// global setting of underscore template inteprolate default token
var templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /\{\{=(.+?)\}\}/g,
    escape: /\{\{(.+?)\}\}/g
};

var bindingDataReference = {
    rootDataKey: '$root',
    currentData: '$data',
    currentIndex: '$index'
};

var bindingUpdateConditions = {
    serverRendered: 'SERVER-RENDERED',
    init: 'INIT'
};

// maximum string length before running regex
var maxDatakeyLength = 50;

exports.bindingAttrs = bindingAttrs;
exports.dataIndexAttr = dataIndexAttr;
exports.templateSettings = templateSettings;
exports.serverRenderedAttr = serverRenderedAttr;
exports.commentPrefix = commentPrefix;
exports.commentSuffix = commentSuffix;
exports.bindingUpdateConditions = bindingUpdateConditions;
exports.bindingDataReference = bindingDataReference;
exports.maxDatakeyLength = maxDatakeyLength;

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _util = require('./util');

/**
 * cssBinding
 * @description
 * DOM decleartive css binding. update classlist.
 * viewModel data can function but must return JSOL.
 * added css class if value is true
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
var cssBinding = function cssBinding(cache, viewModel, bindingAttrs) {
    var dataKey = cache.dataKey;

    if (!dataKey) {
        return;
    }

    cache.elementData = cache.elementData || {};
    cache.elementData.viewModelPropValue = cache.elementData.viewModelPropValue || '';

    // let $element = $(cache.el);
    var oldCssList = cache.elementData.viewModelPropValue;
    var newCssList = '';
    var vmCssListObj = (0, _util.getViewModelPropValue)(viewModel, cache);
    var vmCssListArray = void 0;
    var isViewDataObject = false;
    var isViewDataString = false;
    var domCssList = void 0;
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
    }
    // reject if nothing changed
    if (oldCssList === newCssList) {
        return;
    }

    // get current css classes from element
    domCssList = cache.el.classList;
    // clone domCssList as new array
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
    }

    // unique cssList array
    cssList = _.uniq(cssList).join(' ');
    // replace all css classes
    // TODO: this is the slowness part. Try only update changed css in the classList
    // rather than replace the whole class attribute
    cache.el.setAttribute('class', cssList);
    // update element data
    cache.elementData.viewModelPropValue = newCssList;
};

exports['default'] = cssBinding;

},{"./util":24}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _util = require('./util');

/**
 * dblclickBinding
 * DOM decleartive double click event binding
 * event handler bind to viewModel method according to the DOM attribute
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
var dblclickBinding = function dblclickBinding(cache, viewModel, bindingAttrs) {
    var handlerName = cache.dataKey;
    var paramList = cache.parameters;
    var handlerFn = void 0;
    var viewModelContext = void 0;

    if (!handlerName) {
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
}; /* eslint-disable no-invalid-this */
exports['default'] = dblclickBinding;

},{"./util":24}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _util = require('./util');

var bindingAttrsMap = void 0;

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
    var bindingAttrs = arguments[1];

    return [bindingAttrs.forOf, bindingAttrs['if'], bindingAttrs['case'], bindingAttrs['default']].filter(function (type) {
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

    var attrValue = void 0;
    var cacheData = void 0;

    if (bindingAttrsMap && bindingAttrsMap[type] && typeof attrObj[type] !== 'undefined') {
        bindingCache[type] = bindingCache[type] || [];
        attrValue = attrObj[type].trim();
        cacheData = {
            el: node,
            dataKey: attrValue
        };

        // for store function call parameters eg. '$index', '$root'
        // useful with DOM for-loop template as reference to binding data
        var paramList = (0, _util.getFunctionParameterList)(attrValue);
        if (paramList) {
            cacheData.parameters = paramList;
            cacheData.dataKey = cacheData.dataKey.replace(_util.REGEX.FUNCTIONPARAM, '').trim();
        }

        bindingCache[type].push(cacheData);
    }
    return bindingCache;
};

var createBindingCache = function createBindingCache(_ref2) {
    var _ref2$rootNode = _ref2.rootNode,
        rootNode = _ref2$rootNode === undefined ? null : _ref2$rootNode,
        _ref2$bindingAttrs = _ref2.bindingAttrs,
        bindingAttrs = _ref2$bindingAttrs === undefined ? {} : _ref2$bindingAttrs,
        skipCheck = _ref2.skipCheck;

    var bindingCache = {};

    if (!rootNode instanceof window.Node) {
        throw new TypeError('walkDOM: Expected a DOM node');
    }

    bindingAttrsMap = bindingAttrsMap || (0, _util.invertObj)(bindingAttrs);

    var parseNode = function parseNode(node) {
        var skipNodeCheckFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultSkipCheck;

        var attrObj = void 0;
        var isSkipForOfChild = false;

        if (node.nodeType !== 1 || !node.hasAttributes()) {
            return true;
        }
        if (skipNodeCheckFn(node, bindingAttrs) || typeof skipCheck === 'function' && skipCheck(node)) {
            return false;
        }

        // when creating sub bindingCache if is for tmp binding
        // skip same element that has forOf binding the  forOf is alredy parsed
        attrObj = getAttributesObject(node);
        var hasSkipChildParseBindings = checkSkipChildParseBindings(attrObj, bindingAttrs);
        var iterateList = Object.keys(attrObj);

        if (hasSkipChildParseBindings.length) {
            isSkipForOfChild = true;
            iterateList = hasSkipChildParseBindings;
        }

        iterateList.forEach(function (key) {
            // skip for switch case and default bining
            if (key !== bindingAttrs['case'] && key !== bindingAttrs['default']) {
                bindingCache = populateBindingCache({
                    node: node,
                    attrObj: attrObj,
                    bindingCache: bindingCache,
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

exports['default'] = createBindingCache;

},{"./util":24}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _util = require('./util');

/**
 * focusBinding
 * DOM decleartive on focus event binding
 * event handler bind to viewModel method according to the DOM attribute
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
var focusBinding = function focusBinding(cache, viewModel, bindingAttrs) {
    var handlerName = cache.dataKey;
    var paramList = cache.parameters;
    var handlerFn = void 0;
    var viewModelContext = void 0;

    if (!handlerName) {
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
}; /* eslint-disable no-invalid-this */
exports['default'] = focusBinding;

},{"./util":24}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _config = require('./config');

var _util = require('./util');

var _renderForOfBinding = require('./renderForOfBinding');

var _renderForOfBinding2 = _interopRequireDefault(_renderForOfBinding);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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
    // replace mess spaces with single space
    cache.dataKey = cache.dataKey.replace(_util.REGEX.WHITESPACES, ' ');

    if (!cache.iterator) {
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

    (0, _renderForOfBinding2['default'])({
        bindingData: cache,
        viewModel: viewModel,
        bindingAttrs: bindingAttrs
    });
};

exports['default'] = forOfBinding;

},{"./config":7,"./renderForOfBinding":17,"./util":24}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _config = require('./config');

var _util = require('./util');

var _commentWrapper = require('./commentWrapper');

var _renderIfBinding = require('./renderIfBinding');

/**
 * if-Binding
 * @description
 * DOM decleartive for binding.
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
var ifBinding = function ifBinding(cache, viewModel, bindingAttrs) {
    var dataKey = cache.dataKey;

    if (!dataKey) {
        return;
    }

    cache.elementData = cache.elementData || {};
    cache.type = cache.type || _config.bindingAttrs['if'];

    var oldViewModelProValue = cache.elementData.viewModelPropValue;
    var viewModelPropValue = (0, _util.getViewModelPropValue)(viewModel, cache);
    var shouldRender = Boolean(viewModelPropValue);

    if (typeof viewModelPropValue !== 'undefined' && oldViewModelProValue === viewModelPropValue && !cache.hasIterationBindingCache) {
        return;
    }

    // store new show status
    cache.elementData.viewModelPropValue = viewModelPropValue;

    // only create fragment once
    // wrap comment tag around
    // remove if attribute from original element to allow later dataBind parsing
    if (!cache.fragment) {
        (0, _commentWrapper.wrapCommentAround)(cache, cache.el);
        cache.el.removeAttribute(bindingAttrs['if']);
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
        });
    }
};

exports['default'] = ifBinding;

},{"./commentWrapper":6,"./config":7,"./renderIfBinding":18,"./util":24}],14:[function(require,module,exports){
'use strict';

var _config = require('./config');

var config = _interopRequireWildcard(_config);

var _binder = require('./binder');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

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
};

// expose to global
window.dataBind = {
    use: use,
    init: init,
    version: '1.7.0'
};

},{"./binder":2,"./config":7}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _util = require('./util');

/**
 * modelBinding
 * @description input element data binding. viewModel -> DOM update
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
var modelBinding = function modelBinding(cache, viewModel, bindingAttrs) {
    var dataKey = cache.dataKey;
    var newValue = void 0;

    if (!dataKey) {
        return;
    }

    newValue = (0, _util.getViewModelValue)(viewModel, dataKey);

    if (typeof newValue !== 'undefined' && newValue !== null) {
        var $element = $(cache.el);
        var isCheckbox = $element.is(':checkbox');
        var isRadio = $element.is(':radio');
        var inputName = $element[0].name;
        var $radioGroup = isRadio ? $('input[name="' + inputName + '"]') : null;
        var oldValue = isCheckbox ? $element.prop('checked') : $element.val();

        // update element value
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

exports['default'] = modelBinding;

},{"./util":24}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.publishEvent = exports.unsubscribeAllEvent = exports.unsubscribeEvent = exports.subscribeEventOnce = exports.subscribeEvent = undefined;

var _util = require('./util');

var util = _interopRequireWildcard(_util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

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
    var fn = arguments[2];
    var isOnce = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    if (!instance || !instance.compId || !eventName || typeof fn !== 'function') {
        return;
    }

    var subscriber = void 0;
    var isSubscribed = false;

    eventName = eventName.replace(util.REGEX.WHITESPACES, '');
    EVENTS[eventName] = EVENTS[eventName] || [];
    // check if already subscribed and update callback fn
    isSubscribed = EVENTS[eventName].some(function (subscriber) {
        if (subscriber[instance.compId]) {
            subscriber[instance.compId] = fn.bind(instance.viewModel);
            subscriber.isOnce = isOnce;
            return true;
        }
    });
    // push if not yet subscribe
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
    var fn = arguments[2];

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
    var subscriber = void 0;

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
    }
    // delete the event if no more subscriber
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
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
    }

    var eventName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

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

exports.subscribeEvent = subscribeEvent;
exports.subscribeEventOnce = subscribeEventOnce;
exports.unsubscribeEvent = unsubscribeEvent;
exports.unsubscribeAllEvent = unsubscribeAllEvent;
exports.publishEvent = publishEvent;

},{"./util":24}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _config = require('./config');

var _util = require('./util');

var _domWalker = require('./domWalker');

var _domWalker2 = _interopRequireDefault(_domWalker);

var _binder = require('./binder');

var _commentWrapper = require('./commentWrapper');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var renderForOfBinding = function renderForOfBinding(_ref) {
    var bindingData = _ref.bindingData,
        viewModel = _ref.viewModel,
        bindingAttrs = _ref.bindingAttrs;

    if (!bindingData || !viewModel || !bindingAttrs) {
        return;
    }
    var keys = void 0;
    var iterationDataLength = void 0;
    var iterationData = (0, _util.getViewModelValue)(viewModel, bindingData.iterator.dataKey);
    var isRegenerate = false;

    // check iterationData and set iterationDataLength
    if ((0, _util.isArray)(iterationData)) {
        iterationDataLength = iterationData.length;
    } else if ((0, _util.isPlainObject)(iterationData)) {
        keys = Object.keys(iterationData);
        iterationDataLength = keys.length;
    } else {
        // throw error but let script contince to run
        return (0, _util.throwErrorMessage)(null, 'iterationData is not an plain object or array');
    }

    if (!bindingData.type) {
        bindingData.type = _config.bindingAttrs.forOf;
        (0, _commentWrapper.wrapCommentAround)(bindingData, bindingData.el);
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
    }

    // generate forOfBinding elements into fragment
    var fragment = generateForOfElements(bindingData, viewModel, bindingAttrs, iterationData, keys);

    (0, _commentWrapper.removeElemnetsByCommentWrap)(bindingData);

    // insert fragment content into DOM
    return (0, _commentWrapper.insertRenderedElements)(bindingData, fragment);
}; /* eslint-disable no-invalid-this */


var createIterationViewModel = function createIterationViewModel(_ref2) {
    var bindingData = _ref2.bindingData,
        viewModel = _ref2.viewModel,
        iterationData = _ref2.iterationData,
        keys = _ref2.keys,
        index = _ref2.index;

    var iterationVm = {};
    iterationVm[bindingData.iterator.alias] = keys ? iterationData[keys[index]] : iterationData[index];
    // populate common binding data reference
    iterationVm[_config.bindingDataReference.rootDataKey] = viewModel.$root || viewModel;
    iterationVm[_config.bindingDataReference.currentData] = iterationVm[bindingData.iterator.alias];
    iterationVm[_config.bindingDataReference.currentIndex] = index;
    return iterationVm;
};

var generateForOfElements = function generateForOfElements(bindingData, viewModel, bindingAttrs, iterationData, keys) {
    var fragment = document.createDocumentFragment();
    var iterationDataLength = bindingData.iterationSize;
    var clonedItem = void 0;
    var iterationVm = void 0;
    var iterationBindingCache = void 0;
    var i = 0;

    // create or clear exisitng iterationBindingCache
    if ((0, _util.isArray)(bindingData.iterationBindingCache)) {
        bindingData.iterationBindingCache.length = 0;
    } else {
        bindingData.iterationBindingCache = [];
    }

    // generate forOf and append to DOM
    for (i = 0; i < iterationDataLength; i += 1) {
        clonedItem = (0, _util.cloneDomNode)(bindingData.el);

        // create bindingCache per iteration
        iterationBindingCache = (0, _domWalker2['default'])({
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

exports['default'] = renderForOfBinding;

},{"./binder":2,"./commentWrapper":6,"./config":7,"./domWalker":10,"./util":24}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.removeIfBinding = exports.renderIfBinding = undefined;

var _util = require('./util');

var _binder = require('./binder');

var _domWalker = require('./domWalker');

var _domWalker2 = _interopRequireDefault(_domWalker);

var _config = require('./config');

var _commentWrapper = require('./commentWrapper');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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
    // use fragment for create iterationBindingCache
    var rootElement = bindingData.fragment.firstChild.cloneNode(true);

    // remove current old DOM.
    if (!isDomRemoved) {
        removeIfBinding(bindingData);
    }

    // walk clonedElement to create iterationBindingCache
    if (!bindingData.iterationBindingCache || !bindingData.hasIterationBindingCache) {
        bindingData.iterationBindingCache = (0, _domWalker2['default'])({
            rootNode: rootElement,
            bindingAttrs: bindingAttrs
        });
    }

    // only render if has iterationBindingCache
    // means has other dataBindings to be render
    if (!(0, _util.isEmptyObject)(bindingData.iterationBindingCache)) {
        bindingData.hasIterationBindingCache = true;
        (0, _binder.renderIteration)({
            elementCache: bindingData.iterationBindingCache,
            iterationVm: viewModel,
            bindingAttrs: bindingAttrs,
            isRegenerate: true
        });
    }

    // insert to new rendered DOM
    (0, _commentWrapper.insertRenderedElements)(bindingData, rootElement);
};

var removeIfBinding = function removeIfBinding(bindingData) {
    (0, _commentWrapper.removeElemnetsByCommentWrap)(bindingData);
    // remove cache.IterationBindingCache to prevent memory leak
    if (bindingData.hasIterationBindingCache) {
        bindingData.iterationBindingCache = {};
        bindingData.hasIterationBindingCache = false;
    }
};

exports.renderIfBinding = renderIfBinding;
exports.removeIfBinding = removeIfBinding;

},{"./binder":2,"./commentWrapper":6,"./config":7,"./domWalker":10,"./util":24}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _config = require('./config');

var _util = require('./util');

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

    var templateString = void 0;
    var templateElement = void 0;

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
    var settings = (0, _util.parseStringToJson)(cache.dataKey);
    var viewData = settings.data === '$root' ? viewModel : (0, _util.getViewModelValue)(viewModel, settings.data);
    var isAppend = settings.append;
    var isPrepend = settings.prepend;
    var html = void 0;
    var $element = void 0;
    var $index = void 0;
    var $currentElement = void 0;
    var $nestedTemplates = void 0;

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
    html = compileTemplate(settings.id, viewData);

    // domFragment should be empty in first run
    // append rendered html
    if (!$domFragment.children().length) {
        $currentElement = $domFragment;
        $domFragment.append(html);
    } else {
        $currentElement = $element;
        $currentElement.append(html);
    }

    // check if there are nested template then recurisive render them
    $nestedTemplates = $currentElement.find('[' + bindingAttrs.tmp + ']');

    if ($nestedTemplates.length) {
        nestTemplatesCount += $nestedTemplates.length;
        $nestedTemplates.each(function (index, element) {
            var thisTemplateCache = {
                el: element,
                dataKey: element.getAttribute(bindingAttrs.tmp)
            };
            elementCache[bindingAttrs.tmp].push(thisTemplateCache);
            // recursive template render
            renderTemplate(thisTemplateCache, viewModel, bindingAttrs, elementCache);
            nestTemplatesCount -= 1;
        });
    }

    // no more nested tempalted to render, start to append $domFragment into $templateRoot
    if (nestTemplatesCount === 0) {
        // append to DOM once
        if (!isAppend && !isPrepend) {
            $templateRoot.empty();
        }
        if (isPrepend) {
            $templateRoot.prepend($domFragment.html());
        } else {
            $templateRoot.append($domFragment.html());
        }
        // clear cached fragment
        $domFragment = $templateRoot = null;
        // trigger callback if provided
        if (typeof viewModel.afterTemplateRender === 'function') {
            viewModel.afterTemplateRender(viewData);
        }
    }
};

exports['default'] = renderTemplate;

},{"./config":7,"./util":24}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _util = require('./util');

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

    var oldShowStatus = cache.elementData.viewModelPropValue;

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
            var computeStyle = window.getComputedStyle(cache.el, null).getPropertyValue('display');
            if (!computeStyle || computeStyle === 'none') {
                cache.elementData.displayStyle = 'block';
                cache.elementData.computedStyle = null;
            } else {
                cache.elementData.displayStyle = null;
                cache.elementData.computedStyle = computeStyle;
            }
        }
    }

    shouldShow = (0, _util.getViewModelPropValue)(viewModel, cache);

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
            if (currentInlineSytle.length > 1) {
                cache.el.style.removeProperty('display');
            } else {
                cache.el.removeAttribute('style');
            }
        } else {
            cache.el.style.setProperty('display', cache.elementData.displayStyle);
        }
    }

    // store new show status
    cache.elementData.viewModelPropValue = shouldShow;
};

exports['default'] = showBinding;

},{"./util":24}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _util = require('./util');

/**
 * submitBinding
 * @description on form submit binding. pass current form data as json object to handler
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
var submitBinding = function submitBinding(cache, viewModel, bindingAttrs) {
    var handlerName = cache.dataKey;
    var paramList = cache.parameters;
    var handlerFn = void 0;
    var $element = void 0;
    var viewModelContext = void 0;

    if (!handlerName) {
        return;
    }

    handlerFn = (0, _util.getViewModelValue)(viewModel, handlerName);
    $element = $(cache.el);

    if (typeof handlerFn === 'function') {
        viewModelContext = (0, _util.resolveViewModelContext)(viewModel, handlerName);
        paramList = paramList ? (0, _util.resolveParamList)(viewModel, paramList) : [];
        // assing on change event
        $element.off('submit.databind').on('submit.databind', function (e) {
            var args = [e, $element, (0, _util.getFormData)($element)].concat(paramList);
            handlerFn.apply(viewModelContext, args);
        });
    }
};

exports['default'] = submitBinding;

},{"./util":24}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _util = require('./util');

var _commentWrapper = require('./commentWrapper');

var _renderIfBinding = require('./renderIfBinding');

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
    var paramList = cache.parameters;

    if (!dataKey) {
        return;
    }

    cache.elementData = cache.elementData || {};

    var newExpression = (0, _util.getViewModelValue)(viewModel, dataKey);
    if (typeof newExpression === 'function') {
        var viewModelContext = (0, _util.resolveViewModelContext)(viewModel, newExpression);
        paramList = paramList ? (0, _util.resolveParamList)(viewModel, paramList) : [];
        var args = paramList.slice(0);
        newExpression = newExpression.apply(viewModelContext, args);
    }

    if (newExpression === cache.elementData.expression) {
        return;
    }

    cache.elementData.expression = newExpression;

    // build switch cases if not yet defined
    if (!cache.cases) {
        var childrenElements = cache.el.children;
        if (!childrenElements.length) {
            return;
        }
        cache.cases = [];
        for (var i = 0, elementLength = childrenElements.length; i < elementLength; i += 1) {
            var caseData = null;
            if (childrenElements[i].hasAttribute(bindingAttrs['case'])) {
                caseData = createCaseData(childrenElements[i], bindingAttrs['case']);
            } else if (childrenElements[i].hasAttribute(bindingAttrs['default'])) {
                caseData = createCaseData(childrenElements[i], bindingAttrs['default']);
                caseData.isDefault = true;
            }
            // create fragment by clone node
            // wrap with comment tag
            if (caseData) {
                (0, _commentWrapper.wrapCommentAround)(caseData, caseData.el);
                // remove binding attribute for later dataBind parse
                if (caseData.isDefault) {
                    caseData.el.removeAttribute(bindingAttrs['default']);
                } else {
                    caseData.el.removeAttribute(bindingAttrs['case']);
                }
                (0, _commentWrapper.createClonedElementCache)(caseData);
                cache.cases.push(caseData);
            }
        }
    }

    if (cache.cases.length) {
        var hasMatch = false;
        // do switch operation - reuse if binding logic
        for (var j = 0, casesLength = cache.cases.length; j < casesLength; j += 1) {
            var newCaseValue = void 0;
            if (cache.cases[j].dataKey) {
                newCaseValue = (0, _util.getViewModelValue)(viewModel, cache.cases[j].dataKey);
                if (typeof newCaseValue === 'function') {
                    var _viewModelContext = (0, _util.resolveViewModelContext)(viewModel, newCaseValue);
                    var _paramList = _paramList ? (0, _util.resolveParamList)(viewModel, _paramList) : [];
                    var _args = _paramList.slice(0);
                    newCaseValue = newCaseValue.apply(_viewModelContext, _args);
                }
                // set back to dataKey if nothing found in viewModel
                newCaseValue = newCaseValue || cache.cases[j].dataKey;
            }

            if (newCaseValue === cache.elementData.expression || cache.cases[j].isDefault) {
                hasMatch = true;
                // render element
                (0, _renderIfBinding.renderIfBinding)({
                    bindingData: cache.cases[j],
                    viewModel: viewModel,
                    bindingAttrs: bindingAttrs
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

function removeUnmatchCases(cases, matchedIndex) {
    cases.forEach(function (caseData, index) {
        if (index !== matchedIndex || typeof matchedIndex === 'undefined') {
            (0, _renderIfBinding.removeIfBinding)(caseData);
            // remove cache.IterationBindingCache to prevent memory leak
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

exports['default'] = switchBinding;

},{"./commentWrapper":6,"./renderIfBinding":18,"./util":24}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _util = require('./util');

/**
 * textBinding
 * * @description
 * DOM decleartive text binding update dom textnode with viewModel data
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
var textBinding = function textBinding(cache, viewModel, bindingAttrs) {
    var dataKey = cache.dataKey;
    var paramList = cache.parameters;
    var viewModelContext = void 0;

    if (!dataKey) {
        return;
    }

    var newValue = (0, _util.getViewModelValue)(viewModel, dataKey);
    if (typeof newValue === 'function') {
        viewModelContext = (0, _util.resolveViewModelContext)(viewModel, newValue);
        paramList = paramList ? (0, _util.resolveParamList)(viewModel, paramList) : [];
        var args = paramList.slice(0);
        newValue = newValue.apply(viewModelContext, args);
    }
    var oldValue = cache.el.textContent;

    if (typeof newValue !== 'undefined' && (typeof newValue === 'undefined' ? 'undefined' : _typeof(newValue)) !== 'object' && newValue !== null) {
        if (newValue !== oldValue) {
            cache.el.textContent = newValue;
        }
    }
};

exports['default'] = textBinding;

},{"./util":24}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.throwErrorMessage = exports.resolveParamList = exports.resolveViewModelContext = exports.insertAfter = exports.cloneDomNode = exports.getNodeAttrObj = exports.invertObj = exports.getFunctionParameterList = exports.getFormData = exports.arrayRemoveMatch = exports.debounceRaf = exports.parseStringToJson = exports.getViewModelPropValue = exports.setViewModelValue = exports.getViewModelValue = exports.generateElementCache = exports.extend = exports.each = exports.isEmptyObject = exports.isJsObject = exports.isPlainObject = exports.isArray = exports.REGEX = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _config = require('./config');

var config = _interopRequireWildcard(_config);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

// require to use lodash
_ = window._ || {};

var hasIsArray = Array.isArray;

var REGEX = {
    FUNCTIONPARAM: /\((.*?)\)/,
    WHITESPACES: /\s+/g,
    FOROF: /(.*?)\s+(?:in|of)\s+(.*)/
};

var generateElementCache = function generateElementCache(bindingAttrs) {
    var elementCache = {};
    $.each(bindingAttrs, function (k, v) {
        elementCache[v] = [];
    });
    return elementCache;
};

var isArray = function isArray(obj) {
    return hasIsArray ? Array.isArray(obj) : Object.prototype.toString.call(obj) === '[object Array]';
};

var isJsObject = function isJsObject(obj) {
    return obj !== null && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && Object.prototype.toString.call(obj) === '[object Object]';
};

var isPlainObject = function isPlainObject(obj) {
    var ctor = void 0;
    var prot = void 0;

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

var isEmptyObject = function isEmptyObject(obj) {
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
var getViewModelValue = function getViewModelValue(obj, prop) {
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
        paramList = paramList ? resolveParamList(viewModel, paramList) : [];
        // let args = [oldViewModelProValue, bindingCache.el].concat(paramList);
        var args = paramList.concat([oldViewModelProValue, bindingCache.el]);
        ret = ret.apply(viewModelContext, args);
    }

    if (typeof ret === 'undefined' || ret === null) {
        return ret;
    }

    if (isInvertBoolean && typeof ret === 'string' && ret === 'true' || ret === 'false') {
        ret = JSON.parse(ret);
    }

    return isInvertBoolean && typeof ret === 'boolean' ? !ret : ret;
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
var debounceRaf = function debounceRaf(fn) {
    var ctx = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    return function (fn, ctx) {
        var dfObj = $.Deferred(); // eslint-disable-line new-cap
        var rafId = 0;

        // return decorated fn
        return function () {
            var _arguments = arguments;

            var args = void 0;
            /* eslint-disable prefer-rest-params */
            args = Array.from ? Array.from(arguments) : Array.prototype.slice.call(arguments);

            window.cancelAnimationFrame(rafId);
            rafId = window.requestAnimationFrame(function () {
                $.when(fn.apply(ctx, args)).then(dfObj.resolve.apply(ctx, _arguments), dfObj.reject.apply(ctx, _arguments), dfObj.notify.apply(ctx, _arguments));
                dfObj = $.Deferred(); // eslint-disable-line new-cap
            });
            /* eslint-enable prefer-rest-params */
            return dfObj.promise();
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
var getNodeAttrObj = function getNodeAttrObj(node, skipList) {
    var attrObj = void 0;
    var attributesLength = 0;
    var skipArray = void 0;

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
var extend = function extend() {
    for (var _len = arguments.length, sources = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        sources[_key - 2] = arguments[_key];
    }

    var isDeepMerge = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var target = arguments[1];

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

    return extend.apply(undefined, [true, target].concat(sources));
};

var each = function each(obj, fn) {
    if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object' || typeof fn !== 'function') {
        return;
    }
    var keys = [];
    var keysLength = 0;
    var isArrayObj = isArray(obj);
    var key = void 0;
    var value = void 0;
    var i = void 0;

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
    var bindingDataContext = void 0;
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

var throwErrorMessage = function throwErrorMessage() {
    var err = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var errorMessage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

    var message = err && err.message ? err.message : errorMessage;
    if (typeof console.error === 'function') {
        return console.error(message);
    }
    return console.log(message);
};

exports.REGEX = REGEX;
exports.isArray = isArray;
exports.isPlainObject = isPlainObject;
exports.isJsObject = isJsObject;
exports.isEmptyObject = isEmptyObject;
exports.each = each;
exports.extend = extend;
exports.generateElementCache = generateElementCache;
exports.getViewModelValue = getViewModelValue;
exports.setViewModelValue = setViewModelValue;
exports.getViewModelPropValue = getViewModelPropValue;
exports.parseStringToJson = parseStringToJson;
exports.debounceRaf = debounceRaf;
exports.arrayRemoveMatch = arrayRemoveMatch;
exports.getFormData = getFormData;
exports.getFunctionParameterList = getFunctionParameterList;
exports.invertObj = invertObj;
exports.getNodeAttrObj = getNodeAttrObj;
exports.cloneDomNode = cloneDomNode;
exports.insertAfter = insertAfter;
exports.resolveViewModelContext = resolveViewModelContext;
exports.resolveParamList = resolveParamList;
exports.throwErrorMessage = throwErrorMessage;

},{"./config":7}]},{},[14])


//# sourceMappingURL=dataBind.js.map
