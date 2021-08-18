import {
    getFormData,
    getViewModelValue,
    resolveViewModelContext,
    resolveParamList,
} from './util';

const createEventBinding = ({
    cache = {},
    forceRender = false,
    type = '',
    viewModel = {},
}) => {
    const handlerName = cache.dataKey;
    let paramList = cache.parameters;
    let viewModelContext;
    const APP = viewModel.APP || viewModel.$root.APP;

    if (!type || !handlerName || (!forceRender && !APP.$rootElement.contains(cache.el))) {
        return;
    }

    const handlerFn = getViewModelValue(viewModel, handlerName);

    if (typeof handlerFn === 'function') {
        viewModelContext = resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? resolveParamList(viewModel, paramList) : [];

        const handlerWrap = (e) => {
            let formData;
            let args = [];
            if (type === 'submit') {
                formData = getFormData(e.currentTarget);
                args = [e, e.currentTarget, formData].concat(paramList);
            } else {
                args = [e, e.currentTarget].concat(paramList);
            }
            handlerFn.apply(viewModelContext, args);
        };

        cache.el.removeEventListener(type, handlerWrap, false);
        cache.el.addEventListener(type, handlerWrap, false);
    }
};

export default createEventBinding;
