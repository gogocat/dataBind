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
const createEventHandlerWrapper = (
    type: string,
    paramList: unknown[],
    handlerFn: Function,
    viewModelContext: ViewModel,
): EventListener => {
    return function handlerWrap(e: Event): void {
        let formData: Record<string, unknown>;
        let args: unknown[] = [];
        if (type === 'submit') {
            formData = getFormData(e.currentTarget as HTMLFormElement);
            args = [e, e.currentTarget, formData, ...paramList];
        } else {
            args = [e, e.currentTarget, ...paramList];
        }
        handlerFn.apply(viewModelContext, args);
    };
};

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

        // Store handler key for this event type on the DOM element itself
        // This prevents duplicate handlers even if multiple cache objects exist for same element
        const handlerKey = `_db_${type}Handler`;
        const el = cache.el as HTMLElement & Record<string, unknown>;

        // Check if handler already exists and skip if it's the same
        // This prevents adding duplicate handlers when the same element is processed multiple times
        if (el[handlerKey]) {
            // Handler already exists, remove it before adding new one
            el.removeEventListener(type, el[handlerKey] as EventListener, false);
        }

        // Create new handler wrapper
        const handlerWrap = createEventHandlerWrapper(
            type,
            paramList,
            handlerFn,
            viewModelContext,
        );

        // Store the handler on the DOM element so we can remove it later
        el[handlerKey] = handlerWrap;

        // Add the new event listener
        el.addEventListener(type, handlerWrap, false);
    }
};

export default createEventBinding;
