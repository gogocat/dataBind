import {getViewModelValue} from './util';
import type {BindingCache, ViewModel, BindingAttrs} from './types';

/**
 * modelBinding
 * @description input element data binding. viewModel -> DOM update
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 * @param {boolean} forceRender
 */
const modelBinding = (cache: BindingCache, viewModel: ViewModel, bindingAttrs: BindingAttrs, forceRender: boolean): void => {
    const dataKey = cache.dataKey;
    let newValue: unknown = '';
    const APP = viewModel.APP || viewModel.$root?.APP;

    if (!dataKey || (!forceRender && !(APP?.$rootElement as HTMLElement)?.contains(cache.el))) {
        return;
    }

    newValue = getViewModelValue(viewModel, dataKey);

    if (typeof newValue !== 'undefined' && newValue !== null) {
        const $element = cache.el as HTMLInputElement;
        const isCheckbox = $element.type === 'checkbox';
        const isRadio = $element.type === 'radio';
        const inputName = $element.name;
        const $radioGroup = isRadio ? (APP?.$rootElement as HTMLElement).querySelectorAll(`input[name="${inputName}"]`) : [];
        const oldValue = isCheckbox ? $element.checked : $element.value;

        // update element value
        if (newValue !== oldValue) {
            if (isCheckbox) {
                $element.checked = Boolean(newValue);
            } else if (isRadio) {
                let i = 0;
                const radioGroupLength = $radioGroup.length;

                for (i = 0; i < radioGroupLength; i += 1) {
                    const radioInput = $radioGroup[i] as HTMLInputElement;
                    if (radioInput.value === newValue) {
                        radioInput.checked = true;
                        break;
                    }
                }
            } else {
                $element.value = String(newValue);
            }
        }
    }
};

export default modelBinding;
