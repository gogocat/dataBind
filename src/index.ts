import * as config from './config';
import {extend} from './util';
import Binder from './binder';
import type {PlainObject, ViewModel, BindingAttrs, BinderOptions} from './types';

const isSupportPromise = typeof window['Promise'] === 'function';

let bindingAttrs = config.bindingAttrs;

// Global default options for all Binder instances
const defaultOptions: BinderOptions = {
    reactive: true, // Enable reactive mode by default
};

interface DataBindAPI {
    use: (settings: PlainObject) => DataBindAPI;
    init: ($rootElement: HTMLElement, viewModel: ViewModel | null, options?: BinderOptions) => Binder | void;
    version: string;
}

const use = (settings: PlainObject = {}): DataBindAPI => {
    if (settings.bindingAttrs) {
        bindingAttrs = extend(false, {}, settings.bindingAttrs as PlainObject) as unknown as typeof config.bindingAttrs;
    }
    // Allow setting global reactive option
    if (typeof settings.reactive === 'boolean') {
        defaultOptions.reactive = settings.reactive;
    }
    // Allow setting global trackChanges option
    if (typeof settings.trackChanges === 'boolean') {
        defaultOptions.trackChanges = settings.trackChanges;
    }
    // Return API for chaining
    return api;
};

const init = ($rootElement: HTMLElement, viewModel: ViewModel | null = null, options?: BinderOptions): Binder | void => {
    if (!isSupportPromise) {
        return console.warn('Browser not support Promise');
    }
    // Merge global defaults with instance-specific options
    // Instance options take precedence over global defaults
    const mergedOptions = {...defaultOptions, ...options};
    return new Binder($rootElement, viewModel, bindingAttrs as unknown as BindingAttrs, mergedOptions);
};

const api: DataBindAPI = {
    use,
    init,
    version: '@version@',
};

export default api;
