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
        const $element = cache.el;
        const isCheckbox = $element.type === 'checkbox';
        const isRadio = $element.type === 'radio';
        const inputName = $element.name;
        const $radioGroup = isRadio ? APP.$rootElement.querySelectorAll(`input[name="${inputName}"]`) : [];
        const oldValue = isCheckbox ? $element.checked : $element.value;

        // update element value
        if (newValue !== oldValue) {
            if (isCheckbox) {
                $element.checked = Boolean(newValue);
            } else if (isRadio) {
                let i = 0;
                const radioGroupLength = $radioGroup.length;

                for (i = 0; i < radioGroupLength; i += 1) {
                    if ($radioGroup[i].value === newValue) {
                        $radioGroup[i].checked = true;
                        break;
                    }
                }
            } else {
                $element.value = newValue;
            }
        }
    }
};

export default modelBinding;
