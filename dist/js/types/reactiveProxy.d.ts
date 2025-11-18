import type { ViewModel } from './types';
interface ReactiveOptions {
    onChange: () => void;
    deep?: boolean;
    trackChanges?: boolean;
}
interface ChangeTracker {
    changedPaths: Set<string>;
}
/**
 * Create a reactive proxy that automatically triggers onChange when properties are modified
 * Supports deep proxying for nested objects and arrays
 */
export declare function createReactiveProxy<T extends ViewModel>(target: T, options: ReactiveOptions, path?: string, tracker?: ChangeTracker): T;
/**
 * Special handling for arrays to intercept mutating methods
 */
export declare function createReactiveArray<T extends unknown[]>(target: T, onChange: () => void, options: ReactiveOptions, path?: string, tracker?: ChangeTracker): T;
/**
 * Utility to get the original object from a reactive proxy
 */
export declare function toRaw<T>(obj: T): T;
/**
 * Check if Proxy is supported
 */
export declare function isProxySupported(): boolean;
export {};
//# sourceMappingURL=reactiveProxy.d.ts.map