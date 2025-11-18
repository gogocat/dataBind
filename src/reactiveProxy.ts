import type {ViewModel} from './types';

interface ReactiveOptions {
    onChange: () => void;
    deep?: boolean;
    trackChanges?: boolean;
}

interface ChangeTracker {
    changedPaths: Set<string>;
}

// WeakMap to store proxy metadata
const PROXY_MARKER = Symbol('isReactiveProxy');
const ORIGINAL_TARGET = Symbol('originalTarget');

/**
 * Check if an object is already a reactive proxy
 */
function isReactiveProxy(obj: unknown): boolean {
    return obj !== null && typeof obj === 'object' && (obj as Record<symbol, unknown>)[PROXY_MARKER] === true;
}

/**
 * Get the original target from a proxy
 */
function getOriginalTarget<T>(obj: T): T {
    if (isReactiveProxy(obj)) {
        return (obj as Record<symbol, unknown>)[ORIGINAL_TARGET] as T;
    }
    return obj;
}

/**
 * Create a reactive proxy that automatically triggers onChange when properties are modified
 * Supports deep proxying for nested objects and arrays
 */
export function createReactiveProxy<T extends ViewModel>(
    target: T,
    options: ReactiveOptions,
    path: string = '',
    tracker?: ChangeTracker,
): T {
    const {onChange, deep = true, trackChanges = false} = options;

    // Don't proxy non-objects
    if (target === null || typeof target !== 'object') {
        return target;
    }

    // Don't re-proxy already proxied objects
    if (isReactiveProxy(target)) {
        return target;
    }

    // Skip proxying special properties to avoid circular issues
    const skipProps = ['APP', '$root', '__proto__', 'constructor'];
    if (skipProps.includes(path)) {
        return target;
    }

    // Track changes if enabled
    const changeTracker = tracker || (trackChanges ? {changedPaths: new Set<string>()} : undefined);

    // Store proxied nested objects to reuse same proxy
    const proxiedChildren = new Map<string | symbol, unknown>();

    const handler: ProxyHandler<T> = {
        set(obj, prop, value) {
            // Skip internal properties
            if (typeof prop === 'symbol') {
                (obj as Record<symbol, unknown>)[prop] = value;
                return true;
            }

            const oldValue = obj[prop as keyof T];

            // Only trigger if value actually changed
            if (oldValue === value) {
                return true;
            }

            // Set the new value
            obj[prop as keyof T] = value;

            // Clear cached proxy for this property since value changed
            proxiedChildren.delete(prop);

            // Track the changed path
            if (changeTracker) {
                const fullPath = path ? `${path}.${String(prop)}` : String(prop);
                changeTracker.changedPaths.add(fullPath);
            }

            // Trigger onChange callback (debounced render)
            onChange();

            return true;
        },

        get(obj, prop) {
            // Return proxy markers
            if (prop === PROXY_MARKER) {
                return true;
            }
            if (prop === ORIGINAL_TARGET) {
                return obj;
            }

            const value = obj[prop as keyof T];

            // Don't proxy functions, symbols, or special properties
            if (
                typeof value === 'function' ||
                typeof prop === 'symbol' ||
                skipProps.includes(String(prop))
            ) {
                return value;
            }

            // If deep proxying is enabled and value is an object, wrap it in proxy
            if (deep && value !== null && typeof value === 'object') {
                // Return cached proxy if exists
                if (proxiedChildren.has(prop)) {
                    return proxiedChildren.get(prop);
                }

                const fullPath = path ? `${path}.${String(prop)}` : String(prop);
                const proxied = Array.isArray(value)
                    ? createReactiveArray(value as unknown[], onChange, options, fullPath, changeTracker)
                    : createReactiveProxy(value as ViewModel, options, fullPath, changeTracker);

                // Cache the proxy
                proxiedChildren.set(prop, proxied);

                return proxied;
            }

            return value;
        },

        deleteProperty(obj, prop) {
            if (typeof prop === 'symbol') {
                delete (obj as Record<symbol, unknown>)[prop];
                return true;
            }

            delete obj[prop as keyof T];

            // Clear cached proxy
            proxiedChildren.delete(prop);

            // Track deletion
            if (changeTracker) {
                const fullPath = path ? `${path}.${String(prop)}` : String(prop);
                changeTracker.changedPaths.add(fullPath);
            }

            onChange();
            return true;
        },
    };

    return new Proxy(target, handler);
}

/**
 * Special handling for arrays to intercept mutating methods
 */
export function createReactiveArray<T extends unknown[]>(
    target: T,
    onChange: () => void,
    options: ReactiveOptions,
    path: string = '',
    tracker?: ChangeTracker,
): T {
    const {deep = true} = options;

    // Don't re-proxy already proxied arrays
    if (isReactiveProxy(target)) {
        return target;
    }

    const handler: ProxyHandler<T> = {
        set(obj, prop, value) {
            // Handle symbol properties
            if (typeof prop === 'symbol') {
                (obj as Record<symbol, unknown>)[prop] = value;
                return true;
            }

            const oldValue = obj[prop as keyof T];

            // Only trigger if value actually changed
            if (oldValue === value) {
                return true;
            }

            obj[prop as keyof T] = value;

            // Track changes
            if (tracker) {
                const fullPath = path ? `${path}[${String(prop)}]` : `[${String(prop)}]`;
                tracker.changedPaths.add(fullPath);
            }

            onChange();
            return true;
        },

        get(obj, prop) {
            // Return proxy markers
            if (prop === PROXY_MARKER) {
                return true;
            }
            if (prop === ORIGINAL_TARGET) {
                return obj;
            }

            const value = obj[prop as keyof T];

            // Intercept array mutating methods
            if (typeof value === 'function') {
                const mutatingMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill'];
                if (mutatingMethods.includes(String(prop))) {
                    return function (this: T, ...args: unknown[]) {
                        const result = (value as Function).apply(this, args);

                        // Track change
                        if (tracker) {
                            tracker.changedPaths.add(path || 'array');
                        }

                        onChange();
                        return result;
                    };
                }
            }

            // Deep proxy array elements if they are objects
            if (deep && value !== null && typeof value === 'object' && typeof prop !== 'symbol') {
                const fullPath = path ? `${path}[${String(prop)}]` : `[${String(prop)}]`;
                if (Array.isArray(value)) {
                    return createReactiveArray(value as unknown[], onChange, options, fullPath, tracker);
                }
                return createReactiveProxy(value as ViewModel, options, fullPath, tracker);
            }

            return value;
        },

        deleteProperty(obj, prop) {
            if (typeof prop === 'symbol') {
                delete (obj as Record<symbol, unknown>)[prop];
                return true;
            }

            delete obj[prop as keyof T];

            if (tracker) {
                const fullPath = path ? `${path}[${String(prop)}]` : `[${String(prop)}]`;
                tracker.changedPaths.add(fullPath);
            }

            onChange();
            return true;
        },
    };

    return new Proxy(target, handler);
}

/**
 * Utility to get the original object from a reactive proxy
 */
export function toRaw<T>(obj: T): T {
    return getOriginalTarget(obj);
}

/**
 * Check if Proxy is supported
 */
export function isProxySupported(): boolean {
    return typeof Proxy !== 'undefined';
}
