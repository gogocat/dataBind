import type { ElementCache, ViewModel, BindingAttrs } from './types';
import type { BindingOption } from './createBindingOption';
interface BinderContext {
    updateElementCache: (opt: {
        allCache?: boolean;
        templateCache?: boolean;
        elementCache?: ElementCache;
        isRenderedTemplates?: boolean;
    }) => void;
}
declare const renderTemplatesBinding: ({ ctx, elementCache, updateOption, bindingAttrs, viewModel, }: {
    ctx: BinderContext;
    elementCache: ElementCache;
    updateOption: BindingOption;
    bindingAttrs: BindingAttrs;
    viewModel: ViewModel;
}) => boolean;
export default renderTemplatesBinding;
//# sourceMappingURL=renderTemplatesBinding.d.ts.map