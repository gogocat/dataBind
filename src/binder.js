import * as config from './config';
import {debounceRaf} from './util';
import createBindingCache from './domWalker';
import createBindingOption from './createBindingOption';
import applyBinding from './applyBinding';
import renderTemplatesBinding from './renderTemplatesBinding';
import postProcess from './postProcess';
import * as pubSub from './pubSub';

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

        this.isServerRendered = this.$rootElement.getAttribute(config.serverRenderedAttr) !== null;

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
        this.$rootElement[config.bindingDataReference.rootDataKey] = this.viewModel;

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
        const elementCache = opt.elementCache || this.elementCache;

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

        // create postProcessQueue before start rendering
        this.postProcessQueue = [];

        const renderBindingOption = {
            ctx: this,
            elementCache: this.elementCache,
            updateOption: updateOption,
            bindingAttrs: this.bindingAttrs,
            viewModel: this.viewModel,
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

export default Binder;
