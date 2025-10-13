import type { BindingCache, ViewModel, BindingAttrs } from './types';
interface ChangeBindingParams {
    cache: BindingCache;
    viewModel: ViewModel;
    bindingAttrs: BindingAttrs;
    forceRender: boolean;
    type?: string;
}
/**
 * changeBinding
 * @description input element on change event binding. DOM -> viewModel update
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 * @param {boolean} forceRender
 */
declare const changeBinding: ({ cache, viewModel, bindingAttrs, forceRender, type, }: ChangeBindingParams) => void;
export default changeBinding;
//# sourceMappingURL=changeBinding.d.ts.map