
import {
    getViewModelValue,
    setViewModelValue,
    resolveViewModelContext,
    resolveParamList,
} from './util';
import _escape from './_escape';
import type {BindingCache, ViewModel, BindingAttrs} from './types';

/**
 * Create change handler
 */
function createChangeHandler(
    viewModel: ViewModel,
    modelDataKey: string | null,
    paramList: unknown[],
    handlerFn: Function,
    viewModelContext: ViewModel,
): EventListener {
    let oldValue: unknown = '';
    let newValue: unknown = '';

    return function changeHandler(this: HTMLInputElement, e: Event) {
        const $this = this;
        const isCheckbox = $this.type === 'checkbox';
        newValue = isCheckbox ? $this.checked : _escape($this.value);
        // set data to viewModel
        if (modelDataKey) {
            oldValue = getViewModelValue(viewModel, modelDataKey);
            setViewModelValue(viewModel, modelDataKey, newValue);
        }
        const args = [e, e.currentTarget, newValue, oldValue].concat(paramList as any[]);
        handlerFn.apply(viewModelContext, args);
        oldValue = newValue;
    };
}

interface ChangeBindingParams {
    cache: BindingCache;
    viewModel: ViewModel;
    bindingAttrs: BindingAttrs;
    forceRender: boolean;
    type?: string;
}

/**
 * changeBinding
 * @description input element on change event binding. DOM -> viewModel update
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 * @param {boolean} forceRender
 */
const changeBinding = ({
    cache,
    viewModel,
    bindingAttrs,
    forceRender,
    type = 'change',
}: ChangeBindingParams): void => {
    const handlerName = cache.dataKey;
    let paramList = cache.parameters;
    const modelDataKey = cache.el.getAttribute(bindingAttrs.model);
    let viewModelContext: ViewModel;
    const APP = viewModel.APP || viewModel.$root?.APP;
    const rootElement = APP?.$rootElement as HTMLElement | undefined;

    if (!handlerName || (!forceRender && rootElement && !rootElement.contains(cache.el))) {
        return;
    }

    const handlerFn = getViewModelValue(viewModel, handlerName);

    if (typeof handlerFn === 'function') {
        viewModelContext = resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? resolveParamList(viewModel, paramList) : [];

        const changeHandler = createChangeHandler(
            viewModel,
            modelDataKey,
            paramList,
            handlerFn,
            viewModelContext,
        );

        // assign on change event
        cache.el.removeEventListener(type, changeHandler, false);
        cache.el.addEventListener(type, changeHandler, false);
    }
};

export default changeBinding;
