import type { BindingAttrs, ElementCache } from './types';
declare const createBindingCache: ({ rootNode, bindingAttrs, skipCheck, isRenderedTemplate }: {
    rootNode?: HTMLElement | null;
    bindingAttrs?: BindingAttrs;
    skipCheck?: (node: HTMLElement) => boolean;
    isRenderedTemplate?: boolean;
}) => ElementCache;
export default createBindingCache;
//# sourceMappingURL=domWalker.d.ts.map