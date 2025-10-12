import {
    getFormData,
    getViewModelValue,
    resolveViewModelContext,
    resolveParamList,
} from './util';

const createEventBinding = ({
    cache = {} as any,
    forceRender = false,
    type = '',
    viewModel = {} as any,
}): void => {
    const handlerName = cache.dataKey;
    let paramList = cache.parameters;
    let viewModelContext: any;
    const APP = viewModel.APP || viewModel.$root.APP;

    if (!type || !handlerName || (!forceRender && !APP.$rootElement.contains(cache.el))) {
        return;
    }

    const handlerFn = getViewModelValue(viewModel, handlerName);

    if (typeof handlerFn === 'function') {
        viewModelContext = resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? resolveParamList(viewModel, paramList) : [];

        const handlerWrap = (e: any): void => {
            let formData: any;
            let args: any[] = [];
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
