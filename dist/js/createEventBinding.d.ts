import type { BindingCache, ViewModel } from './types';
interface CreateEventBindingParams {
    cache?: BindingCache;
    forceRender?: boolean;
    type?: string;
    viewModel?: ViewModel;
}
declare const createEventBinding: ({ cache, forceRender, type, viewModel, }: CreateEventBindingParams) => void;
export default createEventBinding;
//# sourceMappingURL=createEventBinding.d.ts.map