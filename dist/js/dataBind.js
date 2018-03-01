/**
 * dataBind - Simple MV* framework work with jQuery and underscore template
 * @version v1.1.0
 * @link https://github.com/gogocat/dataBind#readme
 * @license MIT
 */
(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _config = require('./config');

var config = _interopRequireWildcard(_config);

var _util = require('./util');

var util = _interopRequireWildcard(_util);

var _bindings = require('./bindings');

var binds = _interopRequireWildcard(_bindings);

var _domWalker = require('./domWalker');

var _domWalker2 = _interopRequireDefault(_domWalker);

var _pubSub = require('./pubSub');

var pubSub = _interopRequireWildcard(_pubSub);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var compIdIndex = 0;
var rootDataKey = '$root';

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

        this.render = util.debounceRaf(this.render, this);

        this.isServerRendered = typeof this.$rootElement.attr(config.serverRenderedAttr) !== 'undefined';

        // inject instance into viewModel
        this.viewModel.APP = this;

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
            var _this = this;

            // store viewModel data as $root for easy access
            this.$rootElement.data(rootDataKey, this.viewModel);

            this.elementCache = (0, _domWalker2['default'])(this.$rootElement[0], this.bindingAttrs);

            // skip template render if server rendered
            if (this.isServerRendered && !this.initRendered) {
                this.updateElementCache({
                    templateCache: true
                });
                return this;
            }

            // render template and nested templates first
            if (this.elementCache[this.bindingAttrs.tmp] && this.elementCache[this.bindingAttrs.tmp].length) {
                this.elementCache[this.bindingAttrs.tmp].forEach(function (cache) {
                    binds.renderTemplate(cache, _this.viewModel, _this.bindingAttrs, _this.elementCache);
                });

                // update cache after template(s) rendered
                this.updateElementCache({
                    templateCache: true
                });
            }
            return this;
        }
    }, {
        key: 'updateElementCache',
        value: function updateElementCache() {
            var _this2 = this;

            var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            if (opt.allCache) {
                this.elementCache = (0, _domWalker2['default'])(this.$rootElement[0], this.bindingAttrs);
            }
            // walk DOM from each rendered template(s) and cache bindings in 'bindingCache'
            if (opt.allCache || opt.templateCache) {
                if (this.elementCache[this.bindingAttrs.tmp] && this.elementCache[this.bindingAttrs.tmp].length) {
                    this.elementCache[this.bindingAttrs.tmp].forEach(function (cache) {
                        cache.bindingCache = (0, _domWalker2['default'])(cache.el, _this2.bindingAttrs);
                    });
                }
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var visualBindingOptions = {
                templateBinding: false,
                textBinding: true,
                cssBinding: true,
                showBinding: true,
                modelBinding: true,
                attrBinding: true,
                forOfBinding: true
            };
            var eventsBindingOptions = {
                changeBinding: true,
                clickBinding: true,
                dblclickBinding: true,
                blurBinding: true,
                focusBinding: true,
                submitBinding: true
            };
            var serverRenderedOptions = {
                templateBinding: false,
                textBinding: false,
                cssBinding: false,
                showBinding: false,
                modelBinding: false,
                attrBinding: false,
                forOfBinding: false
            };
            var updateOption = {};

            if (!this.initRendered) {
                // only update eventsBinding if server rendered
                if (this.isServerRendered) {
                    this.$rootElement.removeAttr(config.serverRenderedAttr);
                    updateOption = $.extend({}, eventsBindingOptions, serverRenderedOptions, opt);
                } else {
                    updateOption = $.extend({}, visualBindingOptions, eventsBindingOptions, opt);
                }
            } else {
                // when called again only update visualBinding options
                updateOption = $.extend({}, visualBindingOptions, opt);
            }

            // apply binding to rendered templates
            if (this.elementCache[this.bindingAttrs.tmp] && this.elementCache[this.bindingAttrs.tmp].length) {
                // when re-render template
                if (updateOption.templateBinding) {
                    $.extend(updateOption, eventsBindingOptions);

                    this.elementCache[this.bindingAttrs.tmp].forEach(function ($element) {
                        binds.renderTemplate($element, _this3.viewModel, _this3.bindingAttrs, _this3.elementCache);
                    });
                    // update cache after template(s) rendered
                    this.updateElementCache({
                        templateCache: true
                    });
                }
                // apply bindings to rendered templates
                this.elementCache[this.bindingAttrs.tmp].forEach(function (cache) {
                    Binder.applyBinding({
                        elementCache: cache.bindingCache,
                        updateOption: updateOption,
                        bindingAttrs: _this3.bindingAttrs,
                        viewModel: _this3.viewModel
                    });
                });
            }

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
        value: function applyBinding() {
            var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var elementCache = opt.elementCache,
                updateOption = opt.updateOption,
                bindingAttrs = opt.bindingAttrs,
                viewModel = opt.viewModel;


            if (!elementCache && !updateOption) {
                return;
            }

            // the follow binding should be in order for better efficiency

            // apply for Binding
            if (updateOption.forOfBinding && elementCache[bindingAttrs.forOf] && elementCache[bindingAttrs.forOf].length) {
                elementCache[bindingAttrs.forOf].forEach(function (cache) {
                    binds.forOfBinding(cache, viewModel, bindingAttrs);
                });
            }

            // apply attr Binding
            if (updateOption.attrBinding && elementCache[bindingAttrs.attr] && elementCache[bindingAttrs.attr].length) {
                elementCache[bindingAttrs.attr].forEach(function (cache) {
                    binds.attrBinding(cache, viewModel, bindingAttrs);
                });
            }

            // apply show Binding
            if (updateOption.showBinding && elementCache[bindingAttrs.show] && elementCache[bindingAttrs.show].length) {
                elementCache[bindingAttrs.show].forEach(function (cache) {
                    binds.showBinding(cache, viewModel, bindingAttrs);
                });
            }
            // apply text binding
            if (updateOption.textBinding && elementCache[bindingAttrs.text] && elementCache[bindingAttrs.text].length) {
                elementCache[bindingAttrs.text].forEach(function (cache) {
                    binds.textBinding(cache, viewModel, bindingAttrs);
                });
            }

            // apply cssBinding
            if (updateOption.cssBinding && elementCache[bindingAttrs.css] && elementCache[bindingAttrs.css].length) {
                elementCache[bindingAttrs.css].forEach(function (cache) {
                    binds.cssBinding(cache, viewModel, bindingAttrs);
                });
            }

            // apply model binding
            if (updateOption.modelBinding && elementCache[bindingAttrs.model] && elementCache[bindingAttrs.model].length) {
                elementCache[bindingAttrs.model].forEach(function (cache) {
                    binds.modelBinding(cache, viewModel, bindingAttrs);
                });
            }

            // apply change binding
            if (updateOption.changeBinding && elementCache[bindingAttrs.change] && elementCache[bindingAttrs.change].length) {
                elementCache[bindingAttrs.change].forEach(function (cache) {
                    binds.changeBinding(cache, viewModel, bindingAttrs);
                });
            }

            // apply submit binding
            if (updateOption.submitBinding && elementCache[bindingAttrs.submit] && elementCache[bindingAttrs.submit].length) {
                elementCache[bindingAttrs.submit].forEach(function (cache) {
                    binds.submitBinding(cache, viewModel, bindingAttrs);
                });
            }

            // apply click binding
            if (updateOption.clickBinding && elementCache[bindingAttrs.click] && elementCache[bindingAttrs.click].length) {
                elementCache[bindingAttrs.click].forEach(function (cache) {
                    binds.clickBinding(cache, viewModel, bindingAttrs);
                });
            }

            // apply double click binding
            if (updateOption.dblclickBinding && elementCache[bindingAttrs.dblclick] && elementCache[bindingAttrs.dblclick].length) {
                elementCache[bindingAttrs.dblclick].forEach(function (cache) {
                    binds.dblclickBinding(cache, viewModel, bindingAttrs);
                });
            }

            // apply blur binding
            if (updateOption.blurBinding && elementCache[bindingAttrs.blur] && elementCache[bindingAttrs.blur].length) {
                elementCache[bindingAttrs.blur].forEach(function (cache) {
                    binds.blurBinding(cache, viewModel, bindingAttrs);
                });
            }

            // apply focus binding
            if (updateOption.focus && elementCache[bindingAttrs.focus] && elementCache[bindingAttrs.focus].length) {
                elementCache[bindingAttrs.focus].forEach(function (cache) {
                    binds.focusBinding(cache, viewModel, bindingAttrs);
                });
            }
        }
    }]);

    return Binder;
}();

exports['default'] = Binder;

},{"./bindings":2,"./config":3,"./domWalker":4,"./pubSub":6,"./util":7}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.forOfBinding = exports.attrBinding = exports.cssBinding = exports.showBinding = exports.textBinding = exports.submitBinding = exports.modelBinding = exports.changeBinding = exports.focusBinding = exports.blurBinding = exports.dblclickBinding = exports.clickBinding = exports.renderTemplate = undefined;

var _config = require('./config');

var config = _interopRequireWildcard(_config);

var _util = require('./util');

var util = _interopRequireWildcard(_util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

/* eslint-disable no-invalid-this */
var $domFragment = null;
var $templateRoot = null;
var nestTemplatesCount = 0;
var templateCache = {};
var elementDataNamespace = 'dataBind';

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

    if (templateCache[id]) {
        return templateCache[id](templateData);
    }
    templateElement = document.getElementById(id);
    templateString = templateElement ? templateElement.innerHTML : ''; // $('#' + id).html() || '';
    templateCache[id] = _.template(templateString, {
        variable: 'data'
    });

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
    var settings = util.parseStringToJson(cache.dataKey);
    var viewData = settings.data === '$root' ? viewModel : util.getViewModelValue(viewModel, settings.data);
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
    $index = $element.attr(config.dataIndexAttr);
    if ($index) {
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
    var handlerFn = void 0;
    var $element = void 0;

    if (!handlerName) {
        return;
    }

    handlerFn = util.getViewModelValue(viewModel, handlerName);

    if (typeof handlerFn === 'function') {
        $element = $(cache.el);
        $element.off('click.databind').on('click.databind', function (e) {
            handlerFn.call(viewModel, e, $element);
        });
    }
};

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
    var handlerFn = void 0;
    var $element = void 0;

    if (!handlerName) {
        return;
    }

    handlerFn = util.getViewModelValue(viewModel, handlerName);

    if (typeof handlerFn === 'function') {
        $element = $(cache.el);
        $element.off('dblclick.databind').on('dblclick.databind', function (e) {
            handlerFn.call(viewModel, e, $element);
        });
    }
};

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
    var handlerFn = void 0;
    var $element = void 0;

    if (!handlerName) {
        return;
    }

    handlerFn = util.getViewModelValue(viewModel, handlerName);

    if (typeof handlerFn === 'function') {
        $element = $(cache.el);
        $element.off('blur.databind').on('blur.databind', function (e) {
            handlerFn.call(viewModel, e, $element);
        });
    }
};

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
    var handlerFn = void 0;
    var $element = void 0;

    if (!handlerName) {
        return;
    }

    handlerFn = util.getViewModelValue(viewModel, handlerName);

    if (typeof handlerFn === 'function') {
        $element = $(cache.el);
        $element.off('focus.databind').on('focus.databind', function (e) {
            handlerFn.call(viewModel, e, $element);
        });
    }
};

/**
 * changeBinding
 * @description input element on change event binding. DOM -> viewModel update
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
var changeBinding = function changeBinding(cache, viewModel, bindingAttrs) {
    var handlerName = cache.dataKey;
    var modelDataKey = cache.el.getAttribute(bindingAttrs.model);
    var handlerFn = void 0;
    var isCheckbox = void 0;
    var newValue = void 0;
    var oldValue = void 0;
    var $element = void 0;

    if (!handlerName) {
        return;
    }

    handlerFn = util.getViewModelValue(viewModel, handlerName);

    $element = $(cache.el);

    if (typeof handlerFn === 'function') {
        isCheckbox = $element.is(':checkbox');
        // assing on change event
        $element.off('change.databind').on('change.databind', function (e) {
            newValue = isCheckbox ? $element.prop('checked') : _.escape($element.val());
            // set data to viewModel
            if (modelDataKey) {
                oldValue = util.getViewModelValue(viewModel, modelDataKey);
                util.setViewModelValue(viewModel, modelDataKey, newValue);
            }
            handlerFn.call(viewModel, e, $element, newValue, oldValue);
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
 */
var modelBinding = function modelBinding(cache, viewModel, bindingAttrs) {
    var dataKey = cache.dataKey;
    var newValue = void 0;

    if (!dataKey) {
        return;
    }

    newValue = util.getViewModelValue(viewModel, dataKey);

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

/**
 * submitBinding
 * @description on form submit binding. pass current form data as json object to handler
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
var submitBinding = function submitBinding(cache, viewModel, bindingAttrs) {
    var handlerName = cache.dataKey;
    var handlerFn = void 0;
    var $element = void 0;

    if (!handlerName) {
        return;
    }

    handlerFn = util.getViewModelValue(viewModel, handlerName);
    $element = $(cache.el);

    if (typeof handlerFn === 'function') {
        // assing on change event
        $element.off('submit.databind').on('submit.databind', function (e) {
            handlerFn.call(viewModel, e, $element, util.getFormData($element));
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
 */
var textBinding = function textBinding(cache, viewModel, bindingAttrs) {
    var dataKey = cache.dataKey;

    if (!dataKey) {
        return;
    }

    var newValue = util.getViewModelValue(viewModel, dataKey);
    var oldValue = cache.el.textContent;

    if (typeof newValue !== 'undefined' && newValue !== null) {
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

    if (!dataKey) {
        return;
    }

    var $element = $(cache.el);
    var elementData = $element.data(elementDataNamespace) || {};
    var oldShowStatus = elementData.showStatus;
    var isInvertBoolean = dataKey.charAt(0) === '!';
    var shouldShow = void 0;

    dataKey = isInvertBoolean ? dataKey.substring(1) : dataKey;
    shouldShow = util.getViewModelValue(viewModel, dataKey);

    // do nothing if data in viewModel is undefined
    if (typeof shouldShow !== 'undefined' && shouldShow !== null) {
        if (typeof shouldShow === 'function') {
            shouldShow = shouldShow.call(viewModel, oldShowStatus, $element);
        }

        shouldShow = Boolean(shouldShow);

        // reject if nothing changed
        if (oldShowStatus === shouldShow) {
            return;
        }

        // store new show status
        elementData.showStatus = shouldShow;
        $element.data(elementDataNamespace, elementData);

        // reverse if has '!' expression from DOM deceleration
        if (isInvertBoolean) {
            shouldShow = !shouldShow;
        }
        if (!shouldShow) {
            $element.hide();
        } else {
            $element.show();
        }
    }
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
 */
var cssBinding = function cssBinding(cache, viewModel, bindingAttrs) {
    var dataKey = cache.dataKey;

    if (!dataKey) {
        return;
    }

    var $element = $(cache.el);
    var elementData = $element.data(elementDataNamespace) || {};
    var oldCssList = elementData.cssList || '';
    var newCssList = '';
    var vmCssListObj = util.getViewModelValue(viewModel, dataKey);
    var vmCssListArray = void 0;
    var isViewDataObject = false;
    var isViewDataString = false;
    var domCssList = void 0;
    var cssList = [];

    if (typeof vmCssListObj === 'function') {
        vmCssListObj = vmCssListObj.call(viewModel, oldCssList, $element);
    }

    if (util.isPlainObject(vmCssListObj)) {
        isViewDataObject = true;
    } else if (typeof vmCssListObj === 'string') {
        isViewDataString = true;
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
    $.each(domCssList, function (i, v) {
        cssList.push(v);
    });

    if (isViewDataObject) {
        $.each(vmCssListObj, function (k, v) {
            var i = cssList.indexOf(k);
            if (v === true) {
                cssList.push(k);
            } else if (i !== -1) {
                cssList.splice(i, 1);
            }
        });
    } else if (isViewDataString) {
        // remove oldCssList items from cssList
        cssList = util.arrayRemoveMatch(cssList, oldCssList);
        cssList = cssList.concat(vmCssListArray);
    }

    // unique cssList array
    cssList = _.uniq(cssList).join(' ');
    // replace all css classes
    $element.attr('class', cssList);
    // update element data
    elementData.cssList = newCssList;
    $element.data(elementDataNamespace, elementData);
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

    var $element = $(cache.el);
    var elementData = $element.data(elementDataNamespace) || {};
    var oldAttrObj = elementData.attrObj || {};
    var vmAttrObj = util.getViewModelValue(viewModel, dataKey);

    if (typeof vmAttrObj === 'function') {
        vmAttrObj = vmAttrObj.call(viewModel, oldAttrObj, $element);
    }

    if (!util.isPlainObject(vmAttrObj) || util.isEmptyObject(vmAttrObj)) {
        // reject if vmAttrListObj is not an object or empty
        return;
    }

    // reject if nothing changed
    if (JSON.stringify(oldAttrObj) === JSON.stringify(vmAttrObj)) {
        return;
    }

    // get current DOM element attributes object
    // let domAttrObj = util.getNodeAttrObj(cache.el, [bindingAttrs.attr]);

    if (util.isEmptyObject(oldAttrObj)) {
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
    elementData.attrObj = vmAttrObj;
    $element.data(elementDataNamespace, elementData);
};

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

    if (!dataKey) {
        return;
    }

    var forExpMatch = dataKey.match(util.REGEX.FOROF);
    var iterator = {};
    if (forExpMatch) {
        iterator.alias = forExpMatch[1].trim();
        if (forExpMatch[2]) {
            var vmDataKey = forExpMatch[2].trim();
            iterator.dataKey = vmDataKey;
            iterator.data = util.getViewModelValue(viewModel, vmDataKey);
        }
    }
    console.log('iterator: ', iterator);
};

exports.renderTemplate = renderTemplate;
exports.clickBinding = clickBinding;
exports.dblclickBinding = dblclickBinding;
exports.blurBinding = blurBinding;
exports.focusBinding = focusBinding;
exports.changeBinding = changeBinding;
exports.modelBinding = modelBinding;
exports.submitBinding = submitBinding;
exports.textBinding = textBinding;
exports.showBinding = showBinding;
exports.cssBinding = cssBinding;
exports.attrBinding = attrBinding;
exports.forOfBinding = forOfBinding;

},{"./config":3,"./util":7}],3:[function(require,module,exports){
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
    forOf: 'data-jq-for'
};
var serverRenderedAttr = 'data-server-rendered';
var dataIndexAttr = 'data-index';

// global setting of underscore template inteprolate default token
var templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /\{\{=(.+?)\}\}/g,
    escape: /\{\{(.+?)\}\}/g
};

exports.bindingAttrs = bindingAttrs;
exports.dataIndexAttr = dataIndexAttr;
exports.templateSettings = templateSettings;
exports.serverRenderedAttr = serverRenderedAttr;

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _util = require('./util');

var util = _interopRequireWildcard(_util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

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

var createBindingCache = function createBindingCache() {
    var rootNode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var bindingAttrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var skipCheck = arguments[2];

    var bindingCache = {};

    if (!rootNode instanceof window.Node) {
        throw new TypeError('walkDOM: Expected a DOM node');
    }

    bindingAttrsMap = bindingAttrsMap || util.invertObj(bindingAttrs);

    var rootSkipCheck = function rootSkipCheck(node) {
        return node.tagName === 'SVG';
    };

    var defaultSkipCheck = typeof skipCheck === 'function' ? skipCheck : function (node) {
        return node.tagName === 'SVG' || node.getAttribute(bindingAttrs.comp);
    };

    var parseNode = function parseNode(node) {
        var skipCheckFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultSkipCheck;

        var attrObj = void 0;
        var attrValue = void 0;
        var cacheData = void 0;

        if (node.nodeType === 1 && node.hasAttributes()) {
            if (skipCheckFn(node)) {
                return false;
            }

            attrObj = getAttributesObject(node);

            Object.keys(attrObj).forEach(function (key) {
                if (bindingAttrsMap[key] && attrObj[key]) {
                    bindingCache[key] = bindingCache[key] || [];
                    attrValue = attrObj[key].trim();
                    cacheData = {
                        el: node,
                        dataKey: attrValue
                    };

                    // forOfBinding specific
                    if (key === bindingAttrs.forOf) {
                        var forExpMatch = attrValue.match(util.REGEX.FOROF);
                        cacheData.iterator = {};
                        if (forExpMatch) {
                            cacheData.iterator.alias = forExpMatch[1].trim();
                            if (forExpMatch[2]) {
                                cacheData.iterator.dataKey = forExpMatch[2].trim();
                            }
                        }
                    }

                    // TODO - for store function call parameters eg. '$data', '$root'
                    // useful with DOM for-loop template as reference to binding data
                    /*
                    paramList = util.getFunctionParameterList(attrValue);
                    if (paramList) {
                        cacheData.parameters = paramList;
                        cacheData.dataKey =
                            cacheData.dataKey.replace(util.REGEX.FUNCTIONPARAM, '').trim();
                    }
                    */
                    bindingCache[key].push(cacheData);
                }
            });
        }
        return true;
    };

    if (parseNode(rootNode, rootSkipCheck)) {
        walkDOM(rootNode, parseNode);
    }
    return bindingCache;
};

exports['default'] = createBindingCache;

},{"./util":7}],5:[function(require,module,exports){
'use strict';

var _config = require('./config');

var config = _interopRequireWildcard(_config);

var _binder = require('./binder');

var _binder2 = _interopRequireDefault(_binder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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
    return new _binder2['default']($rootElement, viewModel, bindingAttrs);
};

// expose to global
window.dataBind = {
    use: use,
    init: init
};

},{"./binder":1,"./config":3}],6:[function(require,module,exports){
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

},{"./util":7}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var isObject = function isObject(item) {
    return item !== null && (typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object';
};

var isMergebleObject = function isMergebleObject(item) {
    return isObject(item) && !isArray(item);
};

exports.REGEX = REGEX;
exports.isArray = isArray;
exports.isPlainObject = isPlainObject;
exports.isEmptyObject = isEmptyObject;
exports.extend = extend;
exports.generateElementCache = generateElementCache;
exports.getViewModelValue = getViewModelValue;
exports.setViewModelValue = setViewModelValue;
exports.parseStringToJson = parseStringToJson;
exports.debounceRaf = debounceRaf;
exports.arrayRemoveMatch = arrayRemoveMatch;
exports.getFormData = getFormData;
exports.getFunctionParameterList = getFunctionParameterList;
exports.invertObj = invertObj;
exports.getNodeAttrObj = getNodeAttrObj;

},{}]},{},[5])


//# sourceMappingURL=dataBind.js.map
