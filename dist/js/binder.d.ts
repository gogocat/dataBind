import type { ViewModel, ElementCache, UpdateOption, BindingAttrs } from './types';
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
    constructor($rootElement: HTMLElement, viewModel: ViewModel, bindingAttrs: BindingAttrs);
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
    _render(opt?: UpdateOption): void;
    subscribe(eventName: string, fn: (...args: unknown[]) => void): this;
    subscribeOnce(eventName: string, fn: (...args: unknown[]) => void): this;
    unsubscribe(eventName?: string): this;
    unsubscribeAll(): this;
    publish(eventName?: string, ...args: unknown[]): this;
}
export default Binder;
//# sourceMappingURL=binder.d.ts.map