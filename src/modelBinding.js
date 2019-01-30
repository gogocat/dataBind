import {getViewModelValue} from './util';

/**
 * modelBinding
 * @description input element data binding. viewModel -> DOM update
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 * @param {boolean} forceRender
 */
const modelBinding = (cache, viewModel, bindingAttrs, forceRender) => {
    const dataKey = cache.dataKey;
    let newValue = '';
    const APP = viewModel.APP || viewModel.$root.APP;

    if (!dataKey || (!forceRender && !APP.$rootElement.contains(cache.el))) {
        return;
    }

    newValue = getViewModelValue(viewModel, dataKey);

    if (typeof newValue !== 'undefined' && newValue !== null) {
        const $element = $(cache.el);
        const isCheckbox = $element.is(':checkbox');
        const isRadio = $element.is(':radio');
        const inputName = $element[0].name;
        const $radioGroup = isRadio ? $('input[name="' + inputName + '"]') : null;
        const oldValue = isCheckbox ? $element.prop('checked') : $element.val();

        // update element value
        if (newValue !== oldValue) {
            if (isCheckbox) {
                $element.prop('checked', Boolean(newValue));
            } else if (isRadio) {
                $radioGroup.val([newValue]);
            } else {
                $element.val(newValue);
            }
        }
    }
};

export default modelBinding;
