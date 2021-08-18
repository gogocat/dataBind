const bindingAttrs = {
    comp: 'data-bind-comp',
    tmp: 'data-bind-tmp',
    text: 'data-bind-text',
    click: 'data-bind-click',
    dblclick: 'data-bind-dblclick',
    blur: 'data-bind-blur',
    focus: 'data-bind-focus',
    hover: 'data-bind-hover',
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
const serverRenderedAttr = 'data-server-rendered';
const dataIndexAttr = 'data-index';
const commentPrefix = {
    forOf: 'data-forOf_',
    if: 'data-if_',
    case: 'data-case_',
    default: 'data-default_',
};
const commentSuffix = '_end';

const bindingDataReference = {
    rootDataKey: '$root',
    currentData: '$data',
    currentIndex: '$index',
    mouseEnterHandlerName: 'in',
    mouseLeaveHandlerName: 'out',
};

const bindingUpdateConditions = {
    serverRendered: 'SERVER-RENDERED',
    init: 'INIT',
};

// maximum string length before running regex
const maxDatakeyLength = 250;

const constants = {
    filters: {
        ONCE: 'once',
    },
    PARENT_REF: '_parent',
};

export {
    bindingAttrs,
    dataIndexAttr,
    serverRenderedAttr,
    commentPrefix,
    commentSuffix,
    bindingUpdateConditions,
    bindingDataReference,
    maxDatakeyLength,
    constants,
};
