const bindingAttrs = {
    comp: 'data-jq-comp',
    tmp: 'data-jq-tmp',
    text: 'data-jq-text',
    click: 'data-jq-click',
    dblclick: 'data-jq-dblclick',
    blur: 'data-jq-blur',
    focus: 'data-jq-focus',
    change: 'data-jq-change',
    submit: 'data-jq-submit',
    model: 'data-jq-model',
    show: 'data-jq-show',
    css: 'data-jq-css',
    attr: 'data-jq-attr',
    forOf: 'data-jq-for',
};
const serverRenderedAttr = 'data-server-rendered';
const dataIndexAttr = 'data-index';
const commentPrefix = 'data-forOf-';

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
};

const bindingUpdateConditions = {
    serverRendered: 'SERVER-RENDERED',
    init: 'INIT',
};

// maximum string length before running regex
const maxDatakeyLength = 50;

export {
    bindingAttrs,
    dataIndexAttr,
    templateSettings,
    serverRenderedAttr,
    commentPrefix,
    bindingUpdateConditions,
    bindingDataReference,
    maxDatakeyLength,
};
