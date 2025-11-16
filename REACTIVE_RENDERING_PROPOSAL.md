# Reactive Rendering Proposal

## Current Implementation Analysis

### How Rendering Currently Works

1. **Manual Render Pattern** (from [examples/js/forOfDemo.js](examples/js/forOfDemo.js)):
   ```javascript
   onInputChange(e, $el, newValue, oldValue, index) {
       this.personalDetails[index].show = false;
       this.updateView();  // Manual call required
   }

   addRows(e) {
       this.personalDetails.push(...newItems);
       this.updateView();  // Manual call required
   }
   ```

2. **Binder Architecture** ([src/binder.ts](src/binder.ts)):
   - Constructor injects `APP` reference into viewModel: `this.viewModel.APP = this`
   - `render()` method is debounced using `requestAnimationFrame` (line 43)
   - `_render()` performs the actual DOM updates:
     - Renders template bindings first via `renderTemplatesBinding()`
     - Applies bindings to rest of DOM via `applyBinding()`
     - Handles post-processing callbacks
   - Render is debounced to batch multiple updates into single RAF cycle

3. **Current Problems**:
   - Developers must manually call `this.updateView()` or `this.APP.render()` after every data change
   - Easy to forget to call render, leading to out-of-sync UI
   - Verbose code with render calls scattered throughout
   - No automatic batching of multiple property changes

---

## Proposed Solution: Automatic Reactive Rendering

### High-Level Approach

Use JavaScript **Proxies** to wrap the viewModel and automatically detect changes, then trigger renders automatically. This is similar to how Vue 3, MobX, and modern reactive frameworks work.

### Key Design Decisions

1. **Opt-in vs Opt-out**: Make it opt-in with a configuration option
2. **Proxy Strategy**: Deep proxies for nested objects and arrays
3. **Batching**: Leverage existing `debounceRaf` to batch multiple changes
4. **Performance**: Track which properties changed to enable smart re-rendering in future
5. **Compatibility**: Preserve existing manual render API for backward compatibility

---

## Implementation Plan

### 1. Create Reactive Proxy System

Create a new file: `src/reactiveProxy.ts`

```typescript
import type {ViewModel} from './types';

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
export function createReactiveProxy<T extends ViewModel>(
    target: T,
    options: ReactiveOptions,
    path: string = '',
    tracker?: ChangeTracker
): T {
    const {onChange, deep = true, trackChanges = false} = options;

    // Don't proxy non-objects or already proxied objects
    if (target === null || typeof target !== 'object') {
        return target;
    }

    // Skip proxying APP reference to avoid circular issues
    if (path === 'APP' || path === '$root') {
        return target;
    }

    // Track changes if enabled
    const changeTracker = tracker || (trackChanges ? {changedPaths: new Set<string>()} : undefined);

    const handler: ProxyHandler<T> = {
        set(obj, prop, value) {
            const oldValue = obj[prop as keyof T];

            // Only trigger if value actually changed
            if (oldValue === value) {
                return true;
            }

            // Set the new value
            obj[prop as keyof T] = value;

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
            const value = obj[prop as keyof T];

            // If deep proxying is enabled and value is an object, wrap it in proxy
            if (deep && value !== null && typeof value === 'object') {
                const fullPath = path ? `${path}.${String(prop)}` : String(prop);
                return createReactiveProxy(value as ViewModel, options, fullPath, changeTracker);
            }

            return value;
        },

        deleteProperty(obj, prop) {
            delete obj[prop as keyof T];

            // Track deletion
            if (changeTracker) {
                const fullPath = path ? `${path}.${String(prop)}` : String(prop);
                changeTracker.changedPaths.add(fullPath);
            }

            onChange();
            return true;
        }
    };

    return new Proxy(target, handler);
}

/**
 * Special handling for arrays to intercept mutating methods
 */
export function createReactiveArray<T extends unknown[]>(
    target: T,
    onChange: () => void
): T {
    const handler: ProxyHandler<T> = {
        set(obj, prop, value) {
            obj[prop as keyof T] = value;
            onChange();
            return true;
        },

        get(obj, prop) {
            const value = obj[prop as keyof T];

            // Intercept array mutating methods
            if (typeof value === 'function') {
                const mutatingMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
                if (mutatingMethods.includes(String(prop))) {
                    return function(this: T, ...args: unknown[]) {
                        const result = (value as Function).apply(this, args);
                        onChange();
                        return result;
                    };
                }
            }

            return value;
        }
    };

    return new Proxy(target, handler);
}
```

### 2. Update Binder Constructor

Modify [src/binder.ts](src/binder.ts) to support reactive mode:

```typescript
// Add to constructor parameters
interface BinderOptions {
    reactive?: boolean;
    trackChanges?: boolean;
}

class Binder {
    public isReactive: boolean;
    private originalViewModel: ViewModel;

    constructor(
        $rootElement: HTMLElement,
        viewModel: ViewModel,
        bindingAttrs: BindingAttrs,
        options: BinderOptions = {}
    ) {
        // ... existing code ...

        this.isReactive = options.reactive ?? false;

        // Store original viewModel reference
        this.originalViewModel = viewModel;

        // If reactive mode is enabled, wrap viewModel in proxy
        if (this.isReactive) {
            this.viewModel = createReactiveProxy(viewModel, {
                onChange: () => this.render(),
                deep: true,
                trackChanges: options.trackChanges
            });
        } else {
            this.viewModel = viewModel;
        }

        // inject instance into viewModel
        this.viewModel.APP = this;

        // add $root pointer to viewModel
        this.viewModel.$root = this.viewModel;

        // ... rest of existing code ...
    }
}
```

### 3. Update Main Init Function

Modify [src/index.ts](src/index.ts) to accept reactive option:

```typescript
export const init = (
    $rootElement: HTMLElement,
    viewModel: ViewModel,
    options?: {reactive?: boolean; trackChanges?: boolean}
): Binder => {
    return new Binder(
        $rootElement,
        viewModel,
        BINDING_ATTRS,
        options
    );
};
```

---

## Usage Examples

### Current Manual Approach

```javascript
class FormViewModel {
    constructor() {
        this.personalDetails = [...];
    }

    onInputChange(e, $el, newValue, oldValue, index) {
        this.personalDetails[index].show = false;
        this.updateView();  // Manual call
    }

    addRows(e) {
        this.personalDetails.push(...newItems);
        this.updateView();  // Manual call
    }
}

const component = dataBind.init(element, new FormViewModel());
```

### New Reactive Approach

```javascript
class FormViewModel {
    constructor() {
        this.personalDetails = [...];
    }

    onInputChange(e, $el, newValue, oldValue, index) {
        this.personalDetails[index].show = false;
        // No manual render call needed!
    }

    addRows(e) {
        this.personalDetails.push(...newItems);
        // No manual render call needed!
    }
}

// Enable reactive mode
const component = dataBind.init(element, new FormViewModel(), {
    reactive: true
});
```

### Automatic Batching

```javascript
// Multiple changes are batched into single render via debounceRaf
viewModel.name = 'John';
viewModel.age = 30;
viewModel.email = 'john@example.com';
// Only 1 render happens in next RAF cycle!
```

---

## Benefits

1. **Developer Experience**
   - No need to remember to call `render()` or `updateView()`
   - Cleaner, more readable code
   - Less error-prone

2. **Performance**
   - Automatic batching via existing `debounceRaf`
   - Single render per RAF cycle regardless of how many properties changed
   - Future optimization: track changed paths for smart re-rendering

3. **Backward Compatibility**
   - Opt-in via configuration
   - Existing code continues to work
   - Can gradually migrate to reactive mode

4. **Modern Framework Feel**
   - Similar to Vue 3, MobX, Solid.js
   - Familiar pattern for modern developers

---

## Considerations & Limitations

### 1. Proxy Support
- **Issue**: IE11 doesn't support Proxies
- **Solution**: Provide polyfill or fallback to manual mode with warning

### 2. Performance for Large Objects
- **Issue**: Deep proxying can have overhead for very large nested objects
- **Solution**: Make deep proxying optional, allow shallow mode

### 3. External Mutations
- **Issue**: If external code directly mutates the original viewModel reference
- **Solution**: Document that reactive mode requires using the proxied viewModel

### 4. Debugging
- **Issue**: Proxies can make debugging harder in dev tools
- **Solution**: Provide `originalViewModel` reference for debugging, add dev mode logging

### 5. Array Detection
- **Issue**: Array methods need special handling
- **Solution**: Enhanced proxy handler for arrays (already in proposal)

---

## Implementation Phases

### Phase 1: Core Reactive System (Week 1)
- [ ] Implement `reactiveProxy.ts` with basic object/array support
- [ ] Update `Binder` constructor to support reactive option
- [ ] Update `index.ts` init function
- [ ] Add TypeScript types

### Phase 2: Testing & Refinement (Week 2)
- [ ] Create comprehensive test suite
- [ ] Test with existing examples (forOfDemo, bootstrap, etc.)
- [ ] Performance benchmarking
- [ ] Browser compatibility testing

### Phase 3: Advanced Features (Week 3)
- [ ] Change tracking for smart re-rendering
- [ ] Performance optimizations
- [ ] Dev mode with logging
- [ ] Documentation

### Phase 4: Migration Guide (Week 4)
- [ ] Update all examples to show both modes
- [ ] Write migration guide
- [ ] Create video tutorial
- [ ] Update README

---

## Performance Comparison

### Expected Results

**Current Manual Mode:**
- 100 property changes = 100 render calls (debounced to 1 RAF)
- Developer must remember to batch changes

**Reactive Mode:**
- 100 property changes = 1 render call (automatic batching)
- Zero developer overhead

### Benchmark Plan

Test scenario: Update 1000 items in a list
1. Manual mode with individual render calls
2. Manual mode with batched render call
3. Reactive mode with automatic batching

Expected: Reactive mode should match or exceed manual batched performance.

---

## Alternative Approaches Considered

### 1. Object.defineProperty (Vue 2 style)
- ❌ More complex implementation
- ❌ Doesn't work well with arrays
- ❌ Can't detect property additions
- ✅ Better IE11 support

### 2. Dirty Checking (Angular 1 style)
- ❌ Performance overhead of constant checking
- ❌ Requires digest cycles
- ❌ Complex change detection logic
- ❌ Not suitable for modern apps

### 3. Immutable Data (Redux style)
- ❌ Requires completely different architecture
- ❌ Breaking change for existing code
- ❌ More verbose API
- ✅ Excellent for large apps

**Decision: Proxies are the best choice** for this use case - modern, performant, minimal API changes.

---

## Example Migration

### Before (Manual)
```javascript
// examples/js/forOfDemoComplex.js
const updateResults = () => {
    window.updateInterval = setInterval(() => {
        viewModel.searchResults = generateRamdomData();
        searchResultsComponent.render();  // Manual
    });
};
```

### After (Reactive)
```javascript
// examples/js/forOfDemoComplex.js
const updateResults = () => {
    window.updateInterval = setInterval(() => {
        viewModel.searchResults = generateRamdomData();
        // Automatic render!
    });
};

// In init
const searchResultsComponent = dataBind.init(
    document.querySelector('[data-bind-comp="search-results-component"]'),
    viewModel,
    {reactive: true}  // Enable reactive mode
);
```

---

## Conclusion

Implementing reactive rendering with Proxies will:

1. **Modernize the framework** - Align with Vue 3, MobX, Solid.js patterns
2. **Improve DX** - Less boilerplate, fewer bugs
3. **Maintain compatibility** - Opt-in feature, existing code works
4. **Enable future optimizations** - Foundation for smart re-rendering, memoization

The implementation is straightforward, leverages existing debouncing infrastructure, and provides immediate value to developers.

**Recommendation: Proceed with implementation starting with Phase 1.**
