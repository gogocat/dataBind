const bindingAttrs = {
    comp: 'data-jq-comp',
    tmp: 'data-jq-tmp',
    text: 'data-jq-text',
    click: 'data-jq-click',
    dblclick: 'data-jq-dblclick',
    blur: 'data-jq-blur',
    focus: 'data-jq-focus',
    hover: 'data-jq-hover',
    change: 'data-jq-change',
    submit: 'data-jq-submit',
    model: 'data-jq-model',
    show: 'data-jq-show',
    css: 'data-jq-css',
    attr: 'data-jq-attr',
    forOf: 'data-jq-for',
    if: 'data-jq-if',
    switch: 'data-jq-switch',
    case: 'data-jq-case',
    default: 'data-jq-default',
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

// global setting of underscore template inteprolate default token
const templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /\{\{=(.+?)\}\}/g,
    escape: /\{\{(.+?)\}\}/g,
};

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
const maxDatakeyLength = 50;

const constants = {
    filters: {
        ONCE: 'once',
    },
};

export {
    bindingAttrs,
    dataIndexAttr,
    templateSettings,
    serverRenderedAttr,
    commentPrefix,
    commentSuffix,
    bindingUpdateConditions,
    bindingDataReference,
    maxDatakeyLength,
    constants,
};
