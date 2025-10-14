import type { BindingCache, ViewModel, BindingAttrs } from './types';
/**
 * cssBinding
 * @description
 * DOM decleartive css binding. update classlist.
 * viewModel data can function but must return JSOL.
 * added css class if value is true
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 * @param {boolean} forceRender
 */
declare const cssBinding: (cache: BindingCache, viewModel: ViewModel, bindingAttrs: BindingAttrs, forceRender: boolean) => void;
export default cssBinding;
//# sourceMappingURL=cssBinding.d.ts.map