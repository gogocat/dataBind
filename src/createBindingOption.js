import {
    bindingUpdateConditions,
} from './config';
import {extend} from './util';
/**
 * createBindingOption
 * @param {string} condition
 * @param {object} opt
 * @description
 * generate binding update option object by condition
 * @return {object} updateOption
 */
function createBindingOption(condition = '', opt = {}) {
    const visualBindingOptions = {
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
    const eventsBindingOptions = {
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
    const serverRenderedOptions = {
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
    let updateOption = {};

    switch (condition) {
    case bindingUpdateConditions.serverRendered:
        updateOption = extend({}, eventsBindingOptions, serverRenderedOptions, opt);
        break;
    case bindingUpdateConditions.init:
        // flag templateBinding to true to render tempalte(s)
        opt.templateBinding = true;
        opt.forceRender = true;
        updateOption = extend({}, visualBindingOptions, eventsBindingOptions, opt);
        break;
    default:
        // when called again only update visualBinding options
        updateOption = extend({}, visualBindingOptions, opt);
    }

    return updateOption;
}

export default createBindingOption;
