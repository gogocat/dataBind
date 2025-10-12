declare class Binder {
    initRendered: boolean;
    compId: number;
    $rootElement: any;
    viewModel: any;
    bindingAttrs: any;
    isServerRendered: boolean;
    elementCache: any;
    postProcessQueue: any[];
    render: (opt?: any) => void;
    constructor($rootElement: any, viewModel: any, bindingAttrs: any);
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
    updateElementCache(opt?: any): void;
    _render(opt?: any): void;
    subscribe(eventName: string, fn: any): this;
    subscribeOnce(eventName: string, fn: any): this;
    unsubscribe(eventName?: string): this;
    unsubscribeAll(): this;
    publish(eventName?: string, ...args: any[]): this;
}
export default Binder;
//# sourceMappingURL=binder.d.ts.map