import {
    bindingUpdateConditions,
} from './config';
import {extend} from './util';

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
function createBindingOption(condition: string = '', opt: BindingOption = {}): BindingOption {
    const visualBindingOptions: BindingOption = {
        templateBinding: false,
        textBinding: true,
        cssBinding: true,
        ifBinding: true,
        showBinding: true,
        modelBinding: true,
        attrBinding: true,
        forOfBinding: true,
        switchBinding: true,
    };
    const eventsBindingOptions: BindingOption = {
        changeBinding: true,
        clickBinding: true,
        dblclickBinding: true,
        blurBinding: true,
        focusBinding: true,
        hoverBinding: true,
        inputBinding: true,
        submitBinding: true,
    };
    // this is visualBindingOptions but everything false
    // concrete declear for performance purpose
    const serverRenderedOptions: BindingOption = {
        templateBinding: false,
        textBinding: false,
        cssBinding: false,
        ifBinding: false,
        showBinding: false,
        modelBinding: false,
        attrBinding: false,
        forOfBinding: false,
        switchBinding: false,
    };
    let updateOption: BindingOption = {};

    switch (condition) {
    case bindingUpdateConditions.serverRendered:
        updateOption = extend(false, {}, eventsBindingOptions, serverRenderedOptions, opt);
        break;
    case bindingUpdateConditions.init:
        // flag templateBinding to true to render tempalte(s)
        opt.templateBinding = true;
        opt.forceRender = true;
        updateOption = extend(false, {}, visualBindingOptions, eventsBindingOptions, opt);
        break;
    default:
        // when called again only update visualBinding options
        updateOption = extend(false, {}, visualBindingOptions, opt);
    }

    return updateOption;
}

export default createBindingOption;
