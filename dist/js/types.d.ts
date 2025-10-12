export interface ViewModel {
    [key: string]: any;
    APP?: any;
    $root?: ViewModel;
    $data?: any;
    $index?: number;
}
export interface BindingCache {
    el: HTMLElement;
    dataKey?: string;
    parameters?: any[];
    filters?: string[];
    isOnce?: boolean;
    elementData?: any;
    bindingCache?: any;
}
export interface ElementCache {
    [key: string]: BindingCache[];
}
export interface DeferredObj {
    promise: Promise<any>;
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}
export interface WrapMap {
    [key: string]: [string, string, string];
}
//# sourceMappingURL=types.d.ts.map