
import {bindingDataReference} from './config';
import {
    getViewModelValue,
    resolveViewModelContext,
    resolveParamList,
} from './util';
import type {BindingCache, ViewModel, BindingAttrs, PlainObject} from './types';

/**
 * Create mouse enter handler
 */
const createMouseEnterHandler = (
    cache: BindingCache,
    handlers: PlainObject,
    inHandlerName: string,
    viewModelContext: ViewModel,
    paramList: unknown[],
): (e: MouseEvent) => void => {
    return function onMouseEnterHandler(e: MouseEvent) {
        const args = [e, cache.el, ...paramList];
        (handlers[inHandlerName] as Function).apply(viewModelContext, args);
    };
};

/**
 * Create mouse leave handler
 */
const createMouseLeaveHandler = (
    cache: BindingCache,
    handlers: PlainObject,
    outHandlerName: string,
    viewModelContext: ViewModel,
    paramList: unknown[],
): (e: MouseEvent) => void => {
    return function onMouseLeaveHandler(e: MouseEvent) {
        const args = [e, cache.el, ...paramList];
        (handlers[outHandlerName] as Function).apply(viewModelContext, args);
    };
};

/**
 * hoverBinding
 * DOM decleartive on hover event binding
 * event handler bind to viewModel method according to the DOM attribute
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 * @param {boolean} forceRender
 */
const hoverBinding = (cache: BindingCache, viewModel: ViewModel, bindingAttrs: BindingAttrs, forceRender: boolean): void => {
    const handlerName = cache.dataKey;
    let paramList = cache.parameters;
    const inHandlerName = bindingDataReference.mouseEnterHandlerName;
    const outHandlerName = bindingDataReference.mouseLeaveHandlerName;
    let viewModelContext: ViewModel;
    const APP = viewModel.APP || viewModel.$root?.APP;

    cache.elementData = cache.elementData || {};

    // TODO: check what is APP.$rootElement.contains(cache.el)
    const rootElement = APP?.$rootElement as HTMLElement | undefined;
    if (!handlerName || (!forceRender && rootElement && !rootElement.contains(cache.el))) {
        return;
    }

    const handlers = getViewModelValue(viewModel, handlerName) as PlainObject;

    if (handlers && typeof handlers[inHandlerName] === 'function' && typeof handlers[outHandlerName] === 'function') {
        viewModelContext = resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? resolveParamList(viewModel, paramList) : [];

        const onMouseEnterHandler = createMouseEnterHandler(cache, handlers as PlainObject, inHandlerName, viewModelContext, paramList);
        const onMouseLeaveHandler = createMouseLeaveHandler(cache, handlers as PlainObject, outHandlerName, viewModelContext, paramList);

        cache.el.removeEventListener('mouseenter', onMouseEnterHandler, false);
        cache.el.removeEventListener('mouseleave', onMouseLeaveHandler, false);

        cache.el.addEventListener('mouseenter', onMouseEnterHandler, false);
        cache.el.addEventListener('mouseleave', onMouseLeaveHandler, false);
    }
};

export default hoverBinding;
