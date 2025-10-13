import {
    getFormData,
    getViewModelValue,
    resolveViewModelContext,
    resolveParamList,
} from './util';
import type {BindingCache, ViewModel} from './types';

/**
 * Create event handler wrapper
 */
function createEventHandlerWrapper(
    type: string,
    paramList: unknown[],
    handlerFn: Function,
    viewModelContext: ViewModel,
): EventListener {
    return function handlerWrap(e: Event): void {
        let formData: Record<string, unknown>;
        let args: unknown[] = [];
        if (type === 'submit') {
            formData = getFormData(e.currentTarget as HTMLFormElement);
            args = [e, e.currentTarget, formData].concat(paramList as any[]);
        } else {
            args = [e, e.currentTarget].concat(paramList as any[]);
        }
        handlerFn.apply(viewModelContext, args);
    };
}

interface CreateEventBindingParams {
    cache?: BindingCache;
    forceRender?: boolean;
    type?: string;
    viewModel?: ViewModel;
}

const createEventBinding = ({
    cache = {} as BindingCache,
    forceRender = false,
    type = '',
    viewModel = {} as ViewModel,
}: CreateEventBindingParams): void => {
    const handlerName = cache.dataKey;
    let paramList = cache.parameters;
    let viewModelContext: ViewModel;
    const APP = viewModel.APP || viewModel.$root?.APP;
    const rootElement = APP?.$rootElement as HTMLElement | undefined;

    if (!type || !handlerName || (!forceRender && rootElement && !rootElement.contains(cache.el))) {
        return;
    }

    const handlerFn = getViewModelValue(viewModel, handlerName);

    if (typeof handlerFn === 'function') {
        viewModelContext = resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? resolveParamList(viewModel, paramList) : [];

        const handlerWrap = createEventHandlerWrapper(
            type,
            paramList,
            handlerFn,
            viewModelContext,
        );

        cache.el.removeEventListener(type, handlerWrap, false);
        cache.el.addEventListener(type, handlerWrap, false);
    }
};

export default createEventBinding;
