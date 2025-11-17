import type { ViewModel, ElementCache, UpdateOption, BindingAttrs, BinderOptions } from './types';
declare class Binder {
    [key: string]: unknown;
    initRendered: boolean;
    compId: number;
    $rootElement: HTMLElement;
    viewModel: ViewModel;
    bindingAttrs: BindingAttrs;
    isServerRendered: boolean;
    elementCache: ElementCache;
    postProcessQueue: Array<() => void>;
    render: (opt?: UpdateOption) => void;
    isReactive: boolean;
    originalViewModel: ViewModel;
    private afterRenderCallbacks;
    constructor($rootElement: HTMLElement, viewModel: ViewModel, bindingAttrs: BindingAttrs, options?: BinderOptions);
    /**
     * parseView
     * @description
     * @return {this}
     * traver from $rootElement to find each data-bind-* element
     * then apply data binding
     */
    parseView(): this;
    /**
     * updateElementCache
     * @param {object} opt
     * @description call createBindingCache to parse view and generate bindingCache
     */
    updateElementCache(opt?: {
        allCache?: boolean;
        templateCache?: boolean;
        elementCache?: ElementCache;
        isRenderedTemplates?: boolean;
    }): void;
    private _render;
    /**
     * Call all registered afterRender callbacks
     * Called automatically after each render completes
     */
    private _callAfterRenderCallbacks;
    /**
     * Register a callback to be called after each render completes
     * Useful for reactive mode where renders happen automatically
     * @param callback Function to call after render completes
     * @returns this for chaining
     */
    afterRender(callback: () => void): this;
    /**
     * Remove a specific afterRender callback
     * @param callback The callback function to remove
     * @returns this for chaining
     */
    removeAfterRender(callback: () => void): this;
    /**
     * Clear all afterRender callbacks
     * @returns this for chaining
     */
    clearAfterRender(): this;
    subscribe(eventName: string, fn: (...args: unknown[]) => void): this;
    subscribeOnce(eventName: string, fn: (...args: unknown[]) => void): this;
    unsubscribe(eventName?: string): this;
    unsubscribeAll(): this;
    publish(eventName?: string, ...args: unknown[]): this;
}
export default Binder;
//# sourceMappingURL=binder.d.ts.map