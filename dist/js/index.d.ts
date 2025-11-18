import Binder from './binder';
import type { PlainObject, ViewModel, BinderOptions } from './types';
interface DataBindAPI {
    use: (settings: PlainObject) => DataBindAPI;
    init: ($rootElement: HTMLElement, viewModel: ViewModel | null, options?: BinderOptions) => Binder | void;
    version: string;
}
declare const api: DataBindAPI;
export default api;
//# sourceMappingURL=index.d.ts.map