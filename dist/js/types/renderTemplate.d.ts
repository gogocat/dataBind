import type { BindingCache, ViewModel, BindingAttrs, ElementCache } from './types';
/**
 * renderTemplate
 * @description
 * get template setting from DOM attribute then call compileTemplate
 * to render and append to target DOM
 * @param {object} cache
 * @param {object} viewModel
 * @param {object} bindingAttrs
 * @param {object} elementCache
 */
declare const renderTemplate: (cache: BindingCache, viewModel: ViewModel, bindingAttrs: BindingAttrs, elementCache: ElementCache) => void;
export default renderTemplate;
//# sourceMappingURL=renderTemplate.d.ts.map