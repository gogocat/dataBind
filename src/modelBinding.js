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
    let dataKey = cache.dataKey;
    let newValue = '';
    let APP = viewModel.APP || viewModel.$root.APP;

    if (!dataKey || (!forceRender && !APP.$rootElement.contains(cache.el))) {
        return;
    }

    newValue = getViewModelValue(viewModel, dataKey);

    if (typeof newValue !== 'undefined' && newValue !== null) {
        let $element = $(cache.el);
        let isCheckbox = $element.is(':checkbox');
        let isRadio = $element.is(':radio');
        let inputName = $element[0].name;
        let $radioGroup = isRadio ? $('input[name="' + inputName + '"]') : null;
        let oldValue = isCheckbox ? $element.prop('checked') : $element.val();

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
