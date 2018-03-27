import * as config from './config';
import * as util from './util';
import * as binds from './bindings';
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

        this.render = util.debounceRaf(this.render, this);

        this.isServerRendered =
            typeof this.$rootElement.attr(config.serverRenderedAttr) !== 'undefined';

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
        let skipForOfParseFn;

        if (opt.allCache) {
            this.elementCache = createBindingCache({
                rootNode: this.$rootElement[0],
                bindingAttrs: this.bindingAttrs,
            });
        }
        // walk from first rendered template node to create/update child bindingCache
        if (opt.allCache || opt.templateCache) {
            if (
                this.elementCache[this.bindingAttrs.tmp] &&
                this.elementCache[this.bindingAttrs.tmp].length
            ) {
                this.elementCache[this.bindingAttrs.tmp].forEach((cache) => {
                    // set skipCheck as skipForOfParseFn whenever an node has
                    // both template and forOf bindings
                    // then the template bindingCache should be an empty object
                    if (cache.el.hasAttribute(this.bindingAttrs.forOf)) {
                        skipForOfParseFn = (node) => {
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
                updateOption = createBindingOption(
                    config.bindingUpdateConditions.serverRendered,
                    opt
                );
            } else {
                updateOption = createBindingOption(config.bindingUpdateConditions.init, opt);
            }
        } else {
            // when called again only update visualBinding options
            updateOption = createBindingOption('', opt);
        }

        // render and apply binding to template(s) and forOf DOM
        if (
            this.elementCache[this.bindingAttrs.tmp] &&
            this.elementCache[this.bindingAttrs.tmp].length
        ) {
            // when re-render call with {templateBinding: true}
            // template and nested templates
            if (updateOption.templateBinding) {
                // overwrite updateOption with 'init' bindingUpdateConditions
                updateOption = createBindingOption(config.bindingUpdateConditions.init);

                this.elementCache[this.bindingAttrs.tmp].forEach(($element) => {
                    binds.renderTemplate(
                        $element,
                        this.viewModel,
                        this.bindingAttrs,
                        this.elementCache
                    );
                });
                // update cache after all template(s) rendered
                this.updateElementCache({
                    templateCache: true,
                });
            }
            // apply bindings to rendered templates element
            this.elementCache[this.bindingAttrs.tmp].forEach((cache) => {
                Binder.applyBinding({
                    elementCache: cache.bindingCache,
                    updateOption: updateOption,
                    bindingAttrs: this.bindingAttrs,
                    viewModel: this.viewModel,
                });
            });
        }

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
        if (!elementCache && !updateOption) {
            return;
        }

        // the follow binding should be in order for better efficiency

        // apply forOf Binding
        if (
            updateOption.forOfBinding &&
            elementCache[bindingAttrs.forOf] &&
            elementCache[bindingAttrs.forOf].length
        ) {
            elementCache[bindingAttrs.forOf].forEach((cache) => {
                binds.forOfBinding(cache, viewModel, bindingAttrs);
            });
        }

        // apply attr Binding
        if (
            updateOption.attrBinding &&
            elementCache[bindingAttrs.attr] &&
            elementCache[bindingAttrs.attr].length
        ) {
            elementCache[bindingAttrs.attr].forEach((cache) => {
                binds.attrBinding(cache, viewModel, bindingAttrs);
            });
        }

        // apply show Binding
        if (
            updateOption.showBinding &&
            elementCache[bindingAttrs.show] &&
            elementCache[bindingAttrs.show].length
        ) {
            elementCache[bindingAttrs.show].forEach((cache) => {
                binds.showBinding(cache, viewModel, bindingAttrs);
            });
        }
        // apply text binding
        if (
            updateOption.textBinding &&
            elementCache[bindingAttrs.text] &&
            elementCache[bindingAttrs.text].length
        ) {
            elementCache[bindingAttrs.text].forEach((cache) => {
                binds.textBinding(cache, viewModel, bindingAttrs);
            });
        }

        // apply cssBinding
        if (
            updateOption.cssBinding &&
            elementCache[bindingAttrs.css] &&
            elementCache[bindingAttrs.css].length
        ) {
            elementCache[bindingAttrs.css].forEach((cache) => {
                binds.cssBinding(cache, viewModel, bindingAttrs);
            });
        }

        // apply model binding
        if (
            updateOption.modelBinding &&
            elementCache[bindingAttrs.model] &&
            elementCache[bindingAttrs.model].length
        ) {
            elementCache[bindingAttrs.model].forEach((cache) => {
                binds.modelBinding(cache, viewModel, bindingAttrs);
            });
        }

        // apply change binding
        if (
            updateOption.changeBinding &&
            elementCache[bindingAttrs.change] &&
            elementCache[bindingAttrs.change].length
        ) {
            elementCache[bindingAttrs.change].forEach((cache) => {
                binds.changeBinding(cache, viewModel, bindingAttrs);
            });
        }

        // apply submit binding
        if (
            updateOption.submitBinding &&
            elementCache[bindingAttrs.submit] &&
            elementCache[bindingAttrs.submit].length
        ) {
            elementCache[bindingAttrs.submit].forEach((cache) => {
                binds.submitBinding(cache, viewModel, bindingAttrs);
            });
        }

        // apply click binding
        if (
            updateOption.clickBinding &&
            elementCache[bindingAttrs.click] &&
            elementCache[bindingAttrs.click].length
        ) {
            elementCache[bindingAttrs.click].forEach((cache) => {
                binds.clickBinding(cache, viewModel, bindingAttrs);
            });
        }

        // apply double click binding
        if (
            updateOption.dblclickBinding &&
            elementCache[bindingAttrs.dblclick] &&
            elementCache[bindingAttrs.dblclick].length
        ) {
            elementCache[bindingAttrs.dblclick].forEach((cache) => {
                binds.dblclickBinding(cache, viewModel, bindingAttrs);
            });
        }

        // apply blur binding
        if (
            updateOption.blurBinding &&
            elementCache[bindingAttrs.blur] &&
            elementCache[bindingAttrs.blur].length
        ) {
            elementCache[bindingAttrs.blur].forEach((cache) => {
                binds.blurBinding(cache, viewModel, bindingAttrs);
            });
        }

        // apply focus binding
        if (
            updateOption.focus &&
            elementCache[bindingAttrs.focus] &&
            elementCache[bindingAttrs.focus].length
        ) {
            elementCache[bindingAttrs.focus].forEach((cache) => {
                binds.focusBinding(cache, viewModel, bindingAttrs);
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
        showBinding: false,
        modelBinding: false,
        attrBinding: false,
        forOfBinding: false,
    };
    let updateOption = {};

    switch (condition) {
    case config.bindingUpdateConditions.serverRendered:
        updateOption = util.extend({}, eventsBindingOptions, serverRenderedOptions, opt);
        break;
    case config.bindingUpdateConditions.init:
        // flag templateBinding to true to render tempalte(s)
        opt.templateBinding = true;
        updateOption = util.extend({}, visualBindingOptions, eventsBindingOptions, opt);
        break;
    default:
        // when called again only update visualBinding options
        updateOption = util.extend({}, visualBindingOptions, opt);
    }

    return updateOption;
};

export {Binder, createBindingOption};
