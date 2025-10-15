import type { ElementCache, ViewModel, BindingAttrs } from './types';
/**
 * renderIteration
 * @param {object} opt
 * @description
 * render element's binding by supplied elementCache
 * This function is desidned for FoOf, If, switch bindings
 */
declare const renderIteration: ({ elementCache, iterationVm, bindingAttrs, isRegenerate, }: {
    elementCache: ElementCache;
    iterationVm: ViewModel;
    bindingAttrs: BindingAttrs;
    isRegenerate: boolean;
}) => void;
export default renderIteration;
//# sourceMappingURL=renderIteration.d.ts.map