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
export declare const bindingAttrs: BindingAttrs;
export declare const serverRenderedAttr = "data-server-rendered";
export declare const dataIndexAttr = "data-index";
export interface CommentPrefix {
    forOf: string;
    if: string;
    case: string;
    default: string;
}
export declare const commentPrefix: CommentPrefix;
export declare const commentSuffix = "_end";
export interface BindingDataReference {
    rootDataKey: string;
    currentData: string;
    currentIndex: string;
    mouseEnterHandlerName: string;
    mouseLeaveHandlerName: string;
}
export declare const bindingDataReference: BindingDataReference;
export interface BindingUpdateConditions {
    serverRendered: string;
    init: string;
}
export declare const bindingUpdateConditions: BindingUpdateConditions;
export declare const maxDatakeyLength = 250;
export interface Constants {
    filters: {
        ONCE: string;
    };
    PARENT_REF: string;
}
export declare const constants: Constants;
//# sourceMappingURL=config.d.ts.map