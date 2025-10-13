import type { ElementCache, UpdateOption, BindingAttrs, ViewModel } from './types';
interface ApplyBindingParams {
    ctx: unknown;
    elementCache: ElementCache;
    updateOption: UpdateOption;
    bindingAttrs: BindingAttrs;
    viewModel: ViewModel;
}
declare function applyBinding({ ctx: _ctx, elementCache, updateOption, bindingAttrs, viewModel }: ApplyBindingParams): void;
export default applyBinding;
//# sourceMappingURL=applyBinding.d.ts.map