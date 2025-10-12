
import {bindingDataReference} from './config';
import {
    getViewModelValue,
    resolveViewModelContext,
    resolveParamList,
} from './util';

/**
 * blurBinding
 * DOM decleartive on blur event binding
 * event handler bind to viewModel method according to the DOM attribute
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 * @param {boolean} forceRender
 */
const hoverBinding = (cache: any, viewModel: any, bindingAttrs: any, forceRender: any): void => {
    const handlerName = cache.dataKey;
    let paramList = cache.parameters;
    const inHandlerName = bindingDataReference.mouseEnterHandlerName;
    const outHandlerName = bindingDataReference.mouseLeaveHandlerName;
    let viewModelContext: any;
    const APP = viewModel.APP || viewModel.$root.APP;

    cache.elementData = cache.elementData || {};

    // TODO: check what is APP.$rootElement.contains(cache.el)
    if (!handlerName || (!forceRender && !APP.$rootElement.contains(cache.el))) {
        return;
    }

    const handlers = getViewModelValue(viewModel, handlerName);

    if (handlers && typeof handlers[inHandlerName] === 'function' && typeof handlers[outHandlerName] === 'function') {
        viewModelContext = resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? resolveParamList(viewModel, paramList) : [];

        function onMouseEnterHandler(e: any) {
            const args = [e, cache.el].concat(paramList);
            handlers[inHandlerName].apply(viewModelContext, args);
        }

        function onMouseLeaveHandler(e: any) {
            const args = [e, cache.el].concat(paramList);
            handlers[outHandlerName].apply(viewModelContext, args);
        }

        cache.el.removeEventListener('mouseenter', onMouseEnterHandler, false);
        cache.el.removeEventListener('mouseleave', onMouseLeaveHandler, false);

        cache.el.addEventListener('mouseenter', onMouseEnterHandler, false);
        cache.el.addEventListener('mouseleave', onMouseLeaveHandler, false);
    }
};

export default hoverBinding;
