import type { BindingCache, ViewModel, BindingAttrs } from './types';
/**
 * showBinding
 * @description
 * DOM decleartive show binding. Make binding show/hide according to viewModel data (boolean)
 * viewModel data can function but must return boolean
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
declare const showBinding: (cache: BindingCache, viewModel: ViewModel, _bindingAttrs: BindingAttrs, _forceRender?: boolean) => void;
export default showBinding;
//# sourceMappingURL=showBinding.d.ts.map