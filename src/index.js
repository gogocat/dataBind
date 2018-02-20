import * as config from './config';
import Binder from './binder';

let bindingAttrs = config.bindingAttrs;
let templateSettings = config.templateSettings;

const use = (settings = {}) => {
    if (settings.bindingAttrs) {
        bindingAttrs = $.extend({}, settings.bindingAttrs);
    }
    if (settings.templateSettings) {
        templateSettings = $.extend({}, settings.templateSettings);
    }
};

const init = ($rootElement, viewModel = null) => {
    _.templateSettings = templateSettings;
    return new Binder($rootElement, viewModel, bindingAttrs);
};

// expose to global
window.dataBind = {
    use: use,
    init: init,
};
