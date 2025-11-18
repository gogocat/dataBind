import * as config from './config';
import {debounceRaf} from './util';
import createBindingCache from './domWalker';
import createBindingOption from './createBindingOption';
import applyBinding from './applyBinding';
import renderTemplatesBinding from './renderTemplatesBinding';
import postProcess from './postProcess';
import * as pubSub from './pubSub';
import {createReactiveProxy, isProxySupported} from './reactiveProxy';
import type {ViewModel, ElementCache, UpdateOption, BindingAttrs, BinderOptions} from './types';

let compIdIndex = 0;

class Binder {
    [key: string]: unknown;
    public initRendered: boolean;
    public compId: number;
    public $rootElement: HTMLElement;
    public viewModel: ViewModel;
    public bindingAttrs: BindingAttrs;
    public isServerRendered: boolean;
    public elementCache: ElementCache;
    public postProcessQueue: Array<() => void>;
    public render: (opt?: UpdateOption) => void;
    public isReactive: boolean;
    public originalViewModel: ViewModel;
    private afterRenderCallbacks: Array<() => void>;

    constructor($rootElement: HTMLElement, viewModel: ViewModel, bindingAttrs: BindingAttrs, options: BinderOptions = {}) {
        if (!$rootElement || $rootElement.nodeType !== 1 || viewModel === null || typeof viewModel !== 'object') {
            throw new TypeError('$rootElement or viewModel is invalid');
        }

        this.initRendered = false;

        this.compId = compIdIndex += 1;

        this.$rootElement = $rootElement;

        this.bindingAttrs = bindingAttrs;

        this.isServerRendered = this.$rootElement.getAttribute(config.serverRenderedAttr) !== null;

        // Initialize afterRender callbacks array
        this.afterRenderCallbacks = [];

        // Initialize render method with debounced version
        this.render = debounceRaf(this._render.bind(this), this) as (opt?: UpdateOption) => void;

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
                    trackChanges: options.trackChanges,
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
    public parseView(): this {
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
    public updateElementCache(
        opt: {
            allCache?: boolean;
            templateCache?: boolean;
            elementCache?: ElementCache;
            isRenderedTemplates?: boolean;
        } = {},
    ): void {
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
                // Use for loop to handle templates added during rendering
                for (let i = 0; i < elementCache[this.bindingAttrs.tmp].length; i++) {
                    const cache = elementCache[this.bindingAttrs.tmp][i];
                    // set skipCheck as skipForOfParseFn whenever an node has
                    // both template and forOf bindings
                    // then the template bindingCache should be an empty object
                    let skipForOfParseFn: (() => boolean) | null = null;
                    if (cache.el.hasAttribute(this.bindingAttrs.forOf)) {
                        skipForOfParseFn = (): boolean => {
                            return true;
                        };
                    }
                    cache.bindingCache = createBindingCache({
                        rootNode: cache.el,
                        bindingAttrs: this.bindingAttrs,
                        skipCheck: skipForOfParseFn,
                        isRenderedTemplate: opt.isRenderedTemplates,
                    });
                }
            }
        }
    }

    private _render(opt: UpdateOption = {}): void {
        let updateOption: UpdateOption = {};

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
            updateOption,
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

        // Call afterRender callbacks after rendering is fully complete
        this._callAfterRenderCallbacks();
    }

    /**
     * Call all registered afterRender callbacks
     * Called automatically after each render completes
     */
    private _callAfterRenderCallbacks(): void {
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
    public afterRender(callback: () => void): this {
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
    public removeAfterRender(callback: () => void): this {
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
    public clearAfterRender(): this {
        this.afterRenderCallbacks.length = 0;
        return this;
    }

    public subscribe(eventName: string = '', fn: (...args: unknown[]) => void): this {
        pubSub.subscribeEvent(this, eventName, fn);
        return this;
    }

    public subscribeOnce(eventName: string = '', fn: (...args: unknown[]) => void): this {
        pubSub.subscribeEventOnce(this, eventName, fn);
        return this;
    }

    public unsubscribe(eventName: string = ''): this {
        pubSub.unsubscribeEvent(this.compId, eventName);
        return this;
    }

    public unsubscribeAll(): this {
        pubSub.unsubscribeAllEvent(this.compId);
        return this;
    }

    public publish(eventName: string = '', ...args: unknown[]): this {
        pubSub.publishEvent(eventName, ...args);
        return this;
    }
}

export default Binder;
