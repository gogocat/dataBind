import * as config from './config';
import {debounceRaf, extend} from './util';
import renderTemplate from './renderTemplate';
import clickBinding from './clickBinding';
import dblclickBinding from './dbclickBinding';
import blurBinding from './blurBinding';
import focusBinding from './focusBinding';
import hoverBinding from './hoverBinding';
import changeBinding from './changeBinding';
import modelBinding from './modelBinding';
import submitBinding from './submitBinding';
import textBinding from './textBinding';
import showBinding from './showBinding';
import cssBinding from './cssBinding';
import attrBinding from './attrBinding';
import forOfBinding from './forOfBinding';
import ifBinding from './ifBinding';
import switchBinding from './switchBinding';
import createBindingCache from './domWalker';
import * as pubSub from './pubSub';

let compIdIndex = 0;

class Binder {
    constructor($rootElement, viewModel, bindingAttrs) {
        if ($rootElement instanceof window.jQuery && $rootElement.length) {
            $rootElement = $rootElement.eq(0)[0];
        }

        if (!$rootElement || $rootElement.nodeType !== 1 || viewModel === null || typeof viewModel !== 'object') {
            throw new TypeError('$rootElement or viewModel is invalid');
        }

        this.initRendered = false;

        this.compId = compIdIndex += 1;

        this.$rootElement = $rootElement;

        this.viewModel = viewModel;

        this.bindingAttrs = bindingAttrs;

        this.render = debounceRaf(this.render, this);

        this.isServerRendered = this.$rootElement.getAttribute(config.serverRenderedAttr) !== null;

        // inject instance into viewModel
        this.viewModel.APP = this;

        this.viewModel.$root = this.viewModel;

        this.parseView();

        // for jquery user set viewModel referece to $rootElement for easy debug
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
    parseView() {
        this.elementCache = createBindingCache({
            rootNode: this.$rootElement,
            bindingAttrs: this.bindingAttrs,
        });

        // updateElementCache if server rendered on init
        if (this.isServerRendered && !this.initRendered) {
            this.updateElementCache({
                templateCache: true,
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
        let elementCache = opt.elementCache || this.elementCache;

        if (opt.allCache) {
            // walk dom from root element to regenerate elementCache
            this.elementCache = createBindingCache({
                rootNode: this.$rootElement,
                bindingAttrs: this.bindingAttrs,
            });
        }
        // walk from first rendered template node to create/update child bindingCache
        if (opt.allCache || opt.templateCache) {
            if (elementCache[this.bindingAttrs.tmp] && elementCache[this.bindingAttrs.tmp].length) {
                elementCache[this.bindingAttrs.tmp].forEach((cache) => {
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
                        isRenderedTemplate: opt.isRenderedTemplates,
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
                this.$rootElement.removeAttribute(config.serverRenderedAttr);
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
            viewModel: this.viewModel,
        });

        // apply bindings to rest of the DOM
        Binder.applyBinding({
            elementCache: this.elementCache,
            updateOption: updateOption,
            bindingAttrs: this.bindingAttrs,
            viewModel: this.viewModel,
        });

        this.initRendered = true;
    }

    static applyBinding({elementCache, updateOption, bindingAttrs, viewModel}) {
        if (!elementCache || !updateOption) {
            return;
        }

        // the follow binding should be in order for better efficiency

        // apply forOf Binding
        if (updateOption.forOfBinding && elementCache[bindingAttrs.forOf] && elementCache[bindingAttrs.forOf].length) {
            elementCache[bindingAttrs.forOf].forEach((cache) => {
                forOfBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
            });
        }

        // apply attr Binding
        if (updateOption.attrBinding && elementCache[bindingAttrs.attr] && elementCache[bindingAttrs.attr].length) {
            elementCache[bindingAttrs.attr].forEach((cache) => {
                attrBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
            });
        }

        // apply if Binding
        if (updateOption.ifBinding && elementCache[bindingAttrs.if] && elementCache[bindingAttrs.if].length) {
            elementCache[bindingAttrs.if].forEach((cache) => {
                ifBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
            });
        }

        // apply show Binding
        if (updateOption.showBinding && elementCache[bindingAttrs.show] && elementCache[bindingAttrs.show].length) {
            elementCache[bindingAttrs.show].forEach((cache) => {
                showBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
            });
        }

        // apply switch Binding
        if (
            updateOption.switchBinding &&
            elementCache[bindingAttrs.switch] &&
            elementCache[bindingAttrs.switch].length
        ) {
            elementCache[bindingAttrs.switch].forEach((cache) => {
                switchBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
            });
        }

        // apply text binding
        if (updateOption.textBinding && elementCache[bindingAttrs.text] && elementCache[bindingAttrs.text].length) {
            elementCache[bindingAttrs.text].forEach((cache) => {
                textBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
            });
        }

        // apply cssBinding
        if (updateOption.cssBinding && elementCache[bindingAttrs.css] && elementCache[bindingAttrs.css].length) {
            elementCache[bindingAttrs.css].forEach((cache) => {
                cssBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
            });
        }

        // apply model binding
        if (updateOption.modelBinding && elementCache[bindingAttrs.model] && elementCache[bindingAttrs.model].length) {
            elementCache[bindingAttrs.model].forEach((cache) => {
                modelBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
            });
        }

        // apply change binding
        if (
            updateOption.changeBinding &&
            elementCache[bindingAttrs.change] &&
            elementCache[bindingAttrs.change].length
        ) {
            elementCache[bindingAttrs.change].forEach((cache) => {
                changeBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
            });
        }

        // apply submit binding
        if (
            updateOption.submitBinding &&
            elementCache[bindingAttrs.submit] &&
            elementCache[bindingAttrs.submit].length
        ) {
            elementCache[bindingAttrs.submit].forEach((cache) => {
                submitBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
            });
        }

        // apply click binding
        if (updateOption.clickBinding && elementCache[bindingAttrs.click] && elementCache[bindingAttrs.click].length) {
            elementCache[bindingAttrs.click].forEach((cache) => {
                clickBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
            });
        }

        // apply double click binding
        if (
            updateOption.dblclickBinding &&
            elementCache[bindingAttrs.dblclick] &&
            elementCache[bindingAttrs.dblclick].length
        ) {
            elementCache[bindingAttrs.dblclick].forEach((cache) => {
                dblclickBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
            });
        }

        // apply blur binding
        if (updateOption.blurBinding && elementCache[bindingAttrs.blur] && elementCache[bindingAttrs.blur].length) {
            elementCache[bindingAttrs.blur].forEach((cache) => {
                blurBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
            });
        }

        // apply focus binding
        if (updateOption.focusBinding && elementCache[bindingAttrs.focus] && elementCache[bindingAttrs.focus].length) {
            elementCache[bindingAttrs.focus].forEach((cache) => {
                focusBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
            });
        }

        // apply hover binding
        if (updateOption.hoverBinding && elementCache[bindingAttrs.hover] && elementCache[bindingAttrs.hover].length) {
            elementCache[bindingAttrs.hover].forEach((cache) => {
                hoverBinding(cache, viewModel, bindingAttrs, updateOption.forceRender);
            });
        }
    }

    subscribe(eventName = '', fn) {
        pubSub.subscribeEvent(this, eventName, fn);
        return this;
    }

    subscribeOnce(eventName = '', fn) {
        pubSub.subscribeEventOnce(this, eventName, fn);
        return this;
    }

    unsubscribe(eventName = '') {
        pubSub.unsubscribeEvent(this.compId, eventName);
        return this;
    }

    unsubscribeAll() {
        pubSub.unsubscribeAllEvent(this.compId);
        return this;
    }

    publish(eventName = '', ...args) {
        pubSub.publishEvent(eventName, ...args);
        return this;
    }
}

const renderTemplatesBinding = ({ctx, elementCache, updateOption, bindingAttrs, viewModel}) => {
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

            elementCache[bindingAttrs.tmp].forEach(($element) => {
                renderTemplate($element, viewModel, bindingAttrs, elementCache);
            });
            // update cache after all template(s) rendered
            ctx.updateElementCache({
                templateCache: true,
                elementCache: elementCache,
                isRenderedTemplates: true,
            });
        }
        // enforce render even element is not in DOM tree
        updateOption.forceRender = true;

        // apply bindings to rendered templates element
        elementCache[bindingAttrs.tmp].forEach((cache) => {
            Binder.applyBinding({
                elementCache: cache.bindingCache,
                updateOption: updateOption,
                bindingAttrs: bindingAttrs,
                viewModel: viewModel,
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
    let visualBindingOptions = {
        templateBinding: false,
        textBinding: true,
        cssBinding: true,
        ifBinding: true,
        showBinding: true,
        modelBinding: true,
        attrBinding: true,
        forOfBinding: true,
        switchBinding: true,
    };
    let eventsBindingOptions = {
        changeBinding: true,
        clickBinding: true,
        dblclickBinding: true,
        blurBinding: true,
        focusBinding: true,
        hoverBinding: true,
        submitBinding: true,
    };
    // this is visualBindingOptions but everything false
    // concrete declear for performance purpose
    let serverRenderedOptions = {
        templateBinding: false,
        textBinding: false,
        cssBinding: false,
        ifBinding: false,
        showBinding: false,
        modelBinding: false,
        attrBinding: false,
        forOfBinding: false,
        switchBinding: false,
    };
    let updateOption = {};

    switch (condition) {
    case config.bindingUpdateConditions.serverRendered:
        updateOption = extend({}, eventsBindingOptions, serverRenderedOptions, opt);
        break;
    case config.bindingUpdateConditions.init:
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
const renderIteration = ({elementCache, iterationVm, bindingAttrs, isRegenerate}) => {
    let bindingUpdateOption = isRegenerate
        ? createBindingOption(config.bindingUpdateConditions.init)
        : createBindingOption();

    // enforce render even element is not in DOM tree
    bindingUpdateOption.forceRender = true;

    // render and apply binding to template(s)
    // this is an share function therefore passing current APP 'this' context
    // viewModel is a dynamic generated iterationVm
    renderTemplatesBinding({
        ctx: iterationVm.$root ? iterationVm.$root.APP : iterationVm.APP,
        elementCache: elementCache,
        updateOption: bindingUpdateOption,
        bindingAttrs: bindingAttrs,
        viewModel: iterationVm,
    });

    Binder.applyBinding({
        elementCache: elementCache,
        updateOption: bindingUpdateOption,
        bindingAttrs: bindingAttrs,
        viewModel: iterationVm,
    });
};

export {Binder, createBindingOption, renderTemplatesBinding, renderIteration};
