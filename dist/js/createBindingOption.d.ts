export interface BindingOption {
    templateBinding?: boolean;
    textBinding?: boolean;
    cssBinding?: boolean;
    ifBinding?: boolean;
    showBinding?: boolean;
    modelBinding?: boolean;
    attrBinding?: boolean;
    forOfBinding?: boolean;
    switchBinding?: boolean;
    changeBinding?: boolean;
    clickBinding?: boolean;
    dblclickBinding?: boolean;
    blurBinding?: boolean;
    focusBinding?: boolean;
    hoverBinding?: boolean;
    inputBinding?: boolean;
    submitBinding?: boolean;
    forceRender?: boolean;
    [key: string]: any;
}
/**
 * createBindingOption
 * @param {string} condition
 * @param {object} opt
 * @description
 * generate binding update option object by condition
 * @return {object} updateOption
 */
declare function createBindingOption(condition?: string, opt?: BindingOption): BindingOption;
export default createBindingOption;
//# sourceMappingURL=createBindingOption.d.ts.map