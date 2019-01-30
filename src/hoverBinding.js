/* eslint-disable no-invalid-this */
import {bindingDataReference} from './config';
import {getViewModelValue, resolveViewModelContext, resolveParamList} from './util';

/**
 * blurBinding
 * DOM decleartive on blur event binding
 * event handler bind to viewModel method according to the DOM attribute
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 * @param {boolean} forceRender
 */
const hoverBinding = (cache, viewModel, bindingAttrs, forceRender) => {
    const handlerName = cache.dataKey;
    let paramList = cache.parameters;
    const inHandlerName = bindingDataReference.mouseEnterHandlerName;
    const outHandlerName = bindingDataReference.mouseLeaveHandlerName;
    let viewModelContext;
    const APP = viewModel.APP || viewModel.$root.APP;

    cache.elementData = cache.elementData || {};

    if (!handlerName || (!forceRender && !APP.$rootElement.contains(cache.el))) {
        return;
    }

    const handlers = getViewModelValue(viewModel, handlerName);

    if (handlers && typeof handlers[inHandlerName] === 'function' && typeof handlers[outHandlerName] === 'function') {
        viewModelContext = resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? resolveParamList(viewModel, paramList) : [];

        $(cache.el)
            .off('mouseenter.databind mouseleave.databind')
            .hover(
                function enter(e) {
                    const args = [e, cache.el].concat(paramList);
                    handlers[inHandlerName].apply(viewModelContext, args);
                },
                function leave(e) {
                    const args = [e, cache.el].concat(paramList);
                    handlers[outHandlerName].apply(viewModelContext, args);
                }
            );
    }
};

export default hoverBinding;
