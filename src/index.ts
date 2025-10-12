import * as config from './config';
import {extend} from './util';
import Binder from './binder';

const isSupportPromise = typeof window['Promise'] === 'function';

let bindingAttrs = config.bindingAttrs;

const use = (settings: any = {}): void => {
    if (settings.bindingAttrs) {
        bindingAttrs = extend(false, {}, settings.bindingAttrs);
    }
};

const init = ($rootElement: any, viewModel: any = null): any => {
    if (!isSupportPromise) {
        return console.warn('Browser not support Promise');
    }
    return new Binder($rootElement, viewModel, bindingAttrs);
};

export default {
    use: use,
    init: init,
    version: '@version@',
};
