import * as config from './config';
import {debounceRaf, extend} from './util';
import renderTemplate from './renderTemplate';
import clickBinding from './clickBinding';
import dblclickBinding from './dbclickBinding';
import blurBinding from './blurBinding';
import focusBinding from './focusBinding';
import changeBinding from './changeBinding';
import modelBinding from './modelBinding';
import submitBinding from './submitBinding';
import textBinding from './textBinding';
import showBinding from './showBinding';
import cssBinding from './cssBinding';
import attrBinding from './attrBinding';
import forOfBinding from './forOfBinding';
import ifBinding from './ifBinding';
import createBindingCache from './domWalker';
import * as pubSub from './pubSub';

let compIdIndex = 0;
const rootDataKey = config.bindingDataReference.rootDataKey;

class Binder {
    constructor($rootElement, viewModel, bindingAttrs) {
        if (
            !$rootElement instanceof jQuery ||
            !$rootElement.length ||
            viewModel === null ||
            typeof viewModel !== 'object'
        ) {
            throw new TypeError('$rootElement or viewModel is invalid');
        }

        this.initRendered = false;

        this.compId = compIdIndex += 1;

        this.$rootElement = $rootElement.eq(0);

        this.viewModel = viewModel;

        this.bindingAttrs = bindingAttrs;

        this.render = debounceRaf(this.render, this);

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
    parseView() {
        // store viewModel data as $root for easy access
        this.$rootElement.data(rootDataKey, this.viewModel);

        this.elementCache = createBindingCache({
            rootNode: this.$rootElement[0],
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
                rootNode: this.$rootElement[0],
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
                forOfBinding(cache, viewModel, bindingAttrs);
            });
        }

        // apply attr Binding
        if (updateOption.attrBinding && elementCache[bindingAttrs.attr] && elementCache[bindingAttrs.attr].length) {
            elementCache[bindingAttrs.attr].forEach((cache) => {
                attrBinding(cache, viewModel, bindingAttrs);
            });
        }

        // apply if Binding
        if (updateOption.ifBinding && elementCache[bindingAttrs.if] && elementCache[bindingAttrs.if].length) {
            elementCache[bindingAttrs.if].forEach((cache) => {
                ifBinding(cache, viewModel, bindingAttrs);
            });
        }

        // apply show Binding
        if (updateOption.showBinding && elementCache[bindingAttrs.show] && elementCache[bindingAttrs.show].length) {
            elementCache[bindingAttrs.show].forEach((cache) => {
                showBinding(cache, viewModel, bindingAttrs);
            });
        }

        // apply text binding
        if (updateOption.textBinding && elementCache[bindingAttrs.text] && elementCache[bindingAttrs.text].length) {
            elementCache[bindingAttrs.text].forEach((cache) => {
                textBinding(cache, viewModel, bindingAttrs);
            });
        }

        // apply cssBinding
        if (updateOption.cssBinding && elementCache[bindingAttrs.css] && elementCache[bindingAttrs.css].length) {
            elementCache[bindingAttrs.css].forEach((cache) => {
                cssBinding(cache, viewModel, bindingAttrs);
            });
        }

        // apply model binding
        if (updateOption.modelBinding && elementCache[bindingAttrs.model] && elementCache[bindingAttrs.model].length) {
            elementCache[bindingAttrs.model].forEach((cache) => {
                modelBinding(cache, viewModel, bindingAttrs);
            });
        }

        // apply change binding
        if (
            updateOption.changeBinding &&
            elementCache[bindingAttrs.change] &&
            elementCache[bindingAttrs.change].length
        ) {
            elementCache[bindingAttrs.change].forEach((cache) => {
                changeBinding(cache, viewModel, bindingAttrs);
            });
        }

        // apply submit binding
        if (
            updateOption.submitBinding &&
            elementCache[bindingAttrs.submit] &&
            elementCache[bindingAttrs.submit].length
        ) {
            elementCache[bindingAttrs.submit].forEach((cache) => {
                submitBinding(cache, viewModel, bindingAttrs);
            });
        }

        // apply click binding
        if (updateOption.clickBinding && elementCache[bindingAttrs.click] && elementCache[bindingAttrs.click].length) {
            elementCache[bindingAttrs.click].forEach((cache) => {
                clickBinding(cache, viewModel, bindingAttrs);
            });
        }

        // apply double click binding
        if (
            updateOption.dblclickBinding &&
            elementCache[bindingAttrs.dblclick] &&
            elementCache[bindingAttrs.dblclick].length
        ) {
            elementCache[bindingAttrs.dblclick].forEach((cache) => {
                dblclickBinding(cache, viewModel, bindingAttrs);
            });
        }

        // apply blur binding
        if (updateOption.blurBinding && elementCache[bindingAttrs.blur] && elementCache[bindingAttrs.blur].length) {
            elementCache[bindingAttrs.blur].forEach((cache) => {
                blurBinding(cache, viewModel, bindingAttrs);
            });
        }

        // apply focus binding
        if (updateOption.focus && elementCache[bindingAttrs.focus] && elementCache[bindingAttrs.focus].length) {
            elementCache[bindingAttrs.focus].forEach((cache) => {
                focusBinding(cache, viewModel, bindingAttrs);
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
            });
        }
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
    };
    let eventsBindingOptions = {
        changeBinding: true,
        clickBinding: true,
        dblclickBinding: true,
        blurBinding: true,
        focusBinding: true,
        submitBinding: true,
    };
    // this is visualBindingOptions but everything fals
    // keep it static instead dynamic for performance purpose
    let serverRenderedOptions = {
        templateBinding: false,
        textBinding: false,
        cssBinding: false,
        ifBinding: false,
        showBinding: false,
        modelBinding: false,
        attrBinding: false,
        forOfBinding: false,
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
