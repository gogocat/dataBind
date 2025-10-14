import * as config from './config';
import {extend} from './util';
import Binder from './binder';
import type {PlainObject, ViewModel} from './types';

const isSupportPromise = typeof window['Promise'] === 'function';

let bindingAttrs = config.bindingAttrs;

const use = (settings: PlainObject = {}): void => {
    if (settings.bindingAttrs) {
        bindingAttrs = extend(false, {}, settings.bindingAttrs as PlainObject) as unknown as typeof config.bindingAttrs;
    }
};

const init = ($rootElement: HTMLElement, viewModel: ViewModel | null = null): Binder | void => {
    if (!isSupportPromise) {
        return console.warn('Browser not support Promise');
    }
    return new Binder($rootElement, viewModel, bindingAttrs as unknown as import('./types').BindingAttrs);
};

export default {
    use,
    init,
    version: '@version@',
};
