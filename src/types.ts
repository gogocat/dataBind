// Common types used across the application

// Generic unknown value type - safer than any
export type UnknownValue = unknown;

export interface PlainObject {
    [key: string]: unknown;
}

export interface ViewModel {
    [key: string]: unknown;
    APP?: {
        render?: (opt?: UpdateOption) => void | Promise<void>;
        postProcessQueue?: Array<() => void>;
        [key: string]: unknown;
    };
    $root?: ViewModel;
    $data?: unknown;
    $index?: number;
}

export interface ElementData {
    viewModelPropValue?: unknown;
    displayStyle?: string | null;
    computedStyle?: string | null;
    [key: string]: unknown;
}

export interface BindingCache {
    el: HTMLElement;
    dataKey?: string;
    parameters?: unknown[];
    filters?: string[];
    isOnce?: boolean;
    elementData?: ElementData;
    bindingCache?: unknown;
    type?: string;
    fragment?: DocumentFragment;
    hasIterationBindingCache?: boolean;
    iterationBindingCache?: unknown;
    parentElement?: HTMLElement | null;
    previousNonTemplateElement?: Node | null;
    nextNonTemplateElement?: Node | null;
    iterator?: {
        alias?: string;
        dataKey?: string;
    };
    cases?: CaseData[];
    [key: string]: unknown;
}

export interface CaseData {
    el: HTMLElement;
    dataKey?: string;
    type: string;
    isDefault?: boolean;
    fragment?: DocumentFragment;
    hasIterationBindingCache?: boolean;
    iterationBindingCache?: unknown;
    [key: string]: unknown;
}

export interface ElementCache {
    [key: string]: BindingCache[];
}

export interface UpdateOption {
    forceRender?: boolean;
    attrBinding?: boolean;
    cssBinding?: boolean;
    textBinding?: boolean;
    modelBinding?: boolean;
    showBinding?: boolean;
    ifBinding?: boolean;
    switchBinding?: boolean;
    forOfBinding?: boolean;
    changeBinding?: boolean;
    submitBinding?: boolean;
    clickBinding?: boolean;
    dblclickBinding?: boolean;
    blurBinding?: boolean;
    focusBinding?: boolean;
    hoverBinding?: boolean;
    inputBinding?: boolean;
    [key: string]: unknown;
}

export interface DeferredObj<T = unknown> {
    promise: Promise<T>;
    resolve: (value?: T) => void;
    reject: (reason?: unknown) => void;
}

export interface WrapMap {
    [key: string]: [string, string, string];
}

export interface BindingAttrs {
    [key: string]: string;
    attr: string;
    css: string;
    text: string;
    model: string;
    show: string;
    if: string;
    switch: string;
    case: string;
    default: string;
    forOf: string;
    change: string;
    submit: string;
    click: string;
    dblclick: string;
    blur: string;
    focus: string;
    hover: string;
    input: string;
    tmp: string;
}
