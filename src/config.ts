export interface BindingAttrs {
    comp: string;
    tmp: string;
    text: string;
    click: string;
    dblclick: string;
    blur: string;
    focus: string;
    hover: string;
    input: string;
    change: string;
    submit: string;
    model: string;
    show: string;
    css: string;
    attr: string;
    forOf: string;
    if: string;
    switch: string;
    case: string;
    default: string;
}

export const bindingAttrs: BindingAttrs = {
    comp: 'data-bind-comp',
    tmp: 'data-bind-tmp',
    text: 'data-bind-text',
    click: 'data-bind-click',
    dblclick: 'data-bind-dblclick',
    blur: 'data-bind-blur',
    focus: 'data-bind-focus',
    hover: 'data-bind-hover',
    input: 'data-bind-input',
    change: 'data-bind-change',
    submit: 'data-bind-submit',
    model: 'data-bind-model',
    show: 'data-bind-show',
    css: 'data-bind-css',
    attr: 'data-bind-attr',
    forOf: 'data-bind-for',
    if: 'data-bind-if',
    switch: 'data-bind-switch',
    case: 'data-bind-case',
    default: 'data-bind-default',
};

export const serverRenderedAttr = 'data-server-rendered';
export const dataIndexAttr = 'data-index';

export interface CommentPrefix {
    forOf: string;
    if: string;
    case: string;
    default: string;
}

export const commentPrefix: CommentPrefix = {
    forOf: 'data-forOf_',
    if: 'data-if_',
    case: 'data-case_',
    default: 'data-default_',
};

export const commentSuffix = '_end';

export interface BindingDataReference {
    rootDataKey: string;
    currentData: string;
    currentIndex: string;
    mouseEnterHandlerName: string;
    mouseLeaveHandlerName: string;
}

export const bindingDataReference: BindingDataReference = {
    rootDataKey: '$root',
    currentData: '$data',
    currentIndex: '$index',
    mouseEnterHandlerName: 'in',
    mouseLeaveHandlerName: 'out',
};

export interface BindingUpdateConditions {
    serverRendered: string;
    init: string;
}

export const bindingUpdateConditions: BindingUpdateConditions = {
    serverRendered: 'SERVER-RENDERED',
    init: 'INIT',
};

// maximum string length before running regex
export const maxDatakeyLength = 250;

export interface Constants {
    filters: {
        ONCE: string;
    };
    PARENT_REF: string;
}

export const constants: Constants = {
    filters: {
        ONCE: 'once',
    },
    PARENT_REF: '_parent',
};
