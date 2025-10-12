
import {
    getViewModelValue,
    setViewModelValue,
    resolveViewModelContext,
    resolveParamList,
} from './util';
import _escape from './_escape';

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
}: any): void => {
    const handlerName = cache.dataKey;
    let paramList = cache.parameters;
    const modelDataKey = cache.el.getAttribute(bindingAttrs.model);
    let newValue: any = '';
    let oldValue: any = '';
    let viewModelContext: any;
    const APP = viewModel.APP || viewModel.$root.APP;

    if (!handlerName || (!forceRender && !APP.$rootElement.contains(cache.el))) {
        return;
    }

    const handlerFn = getViewModelValue(viewModel, handlerName);

    if (typeof handlerFn === 'function') {
        viewModelContext = resolveViewModelContext(viewModel, handlerName);
        paramList = paramList ? resolveParamList(viewModel, paramList) : [];

        function changeHandler(e: any) {
            const $this = this as any;
            const isCheckbox = $this.type === 'checkbox';
            newValue = isCheckbox ? $this.checked : _escape($this.value);
            // set data to viewModel
            if (modelDataKey) {
                oldValue = getViewModelValue(viewModel, modelDataKey);
                setViewModelValue(viewModel, modelDataKey, newValue);
            }
            const args = [e, e.currentTarget, newValue, oldValue].concat(paramList);
            handlerFn.apply(viewModelContext, args);
            oldValue = newValue;
        }

        // assing on change event
        cache.el.removeEventListener(type, changeHandler, false);
        cache.el.addEventListener(type, changeHandler, false);
    }
};

export default changeBinding;
