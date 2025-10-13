import type { BindingCache, ViewModel, BindingAttrs } from './types';
interface RenderIfBindingParams {
    bindingData: BindingCache;
    viewModel: ViewModel;
    bindingAttrs: BindingAttrs;
}
/**
 * removeIfBinding
 * @description remove if binding DOM and clean up cache
 * @param {object} bindingData
 */
declare const removeIfBinding: (bindingData: BindingCache) => void;
/**
 * renderIfBinding
 * @description render if binding DOM
 * @param {object} bindingData
 * @param {object} viewModel
 * @param {object} bindingAttrs
 */
declare const renderIfBinding: ({ bindingData, viewModel, bindingAttrs }: RenderIfBindingParams) => void;
export { renderIfBinding, removeIfBinding, };
//# sourceMappingURL=renderIfBinding.d.ts.map