# dataBind.js Configuration Guide

This guide explains how to configure dataBind.js globally and per-instance.

## Global Configuration with `use()`

The `use()` function allows you to set global defaults that apply to all components created with `init()`. The `use()` function is **chainable**, allowing you to call `init()` directly after it.

### Setting Global Reactive Mode

```javascript
// Traditional style: separate calls
dataBind.use({ reactive: false });
const app = dataBind.init(rootElement, viewModel);
// This component is in manual mode

// Chainable style: one line
const app = dataBind.use({ reactive: false }).init(rootElement, viewModel);
// This component is in manual mode
```

### Setting Global Track Changes

```javascript
// Enable change tracking globally
dataBind.use({
    reactive: true,
    trackChanges: true
});

// All components will now have reactive mode with change tracking
const app = dataBind.init(rootElement, viewModel);
```

### Custom Binding Attributes

```javascript
// Use custom data attributes for bindings
dataBind.use({
    bindingAttrs: {
        text: 'data-my-text',
        click: 'data-my-click',
        // ... other custom attributes
    }
});
```

### Combined Configuration

```javascript
dataBind.use({
    reactive: true,
    trackChanges: false,
    bindingAttrs: {
        // Custom attributes
    }
});
```

## Per-Instance Options

Instance-specific options passed to `init()` will **override** global defaults.

### Override Global Reactive Setting

```javascript
// Global default is reactive: true
dataBind.use({ reactive: true });

// But this specific component uses manual mode
const manualApp = dataBind.init(rootElement, viewModel, {
    reactive: false
});

// This component uses reactive mode (global default)
const reactiveApp = dataBind.init(rootElement2, viewModel2);
```

### Per-Instance Track Changes

```javascript
dataBind.use({ reactive: true });

// Enable change tracking for this component only
const app = dataBind.init(rootElement, viewModel, {
    trackChanges: true
});
```

## Default Configuration

By default (without calling `use()`), dataBind.js uses:

```javascript
{
    reactive: true,  // Reactive mode enabled
    trackChanges: false
}
```

## Configuration Precedence

The configuration follows this precedence (highest to lowest):

1. **Instance options** - Options passed to `init()`
2. **Global defaults** - Options set via `use()`
3. **Built-in defaults** - `{ reactive: true }`

### Example

```javascript
// Step 1: Built-in default
// reactive: true (built-in)

// Step 2: Set global default
dataBind.use({ reactive: false });
// reactive: false (global override)

// Step 3: Create components
const app1 = dataBind.init(el1, vm1);
// reactive: false (uses global default)

const app2 = dataBind.init(el2, vm2, { reactive: true });
// reactive: true (instance override)

const app3 = dataBind.init(el3, vm3, {});
// reactive: false (uses global default)
```

## Use Cases

### Scenario 1: Default Reactive Mode (Recommended)

Most applications should use reactive mode for better developer experience:

```javascript
// No configuration needed - reactive mode is default
const app = dataBind.init(document.getElementById('app'), viewModel);

// Update data - automatic rendering
app.viewModel.name = 'Jane';
app.viewModel.items.push(newItem);
```

### Scenario 2: Opt-in Manual Mode for Performance

For performance-critical applications (like benchmarks):

```javascript
const app = dataBind.init(document.getElementById('app'), viewModel, {
    reactive: false
});

// Update data manually
viewModel.name = 'Jane';
app.render(); // Manual render call
```

### Scenario 3: Mixed Mode Application

Some components reactive, others manual:

```javascript
// Set global default to reactive
dataBind.use({ reactive: true });

// Most components use reactive mode
const mainApp = dataBind.init(document.getElementById('main'), mainVM);

// Performance-critical component uses manual mode
const perfApp = dataBind.init(
    document.getElementById('perf'),
    perfVM,
    { reactive: false }
);
```

### Scenario 4: Disable Reactive Globally (Legacy Mode)

For backward compatibility with existing codebases:

```javascript
// Disable reactive mode for all components
dataBind.use({ reactive: false });

// All components now use manual mode by default
const app1 = dataBind.init(el1, vm1);
const app2 = dataBind.init(el2, vm2);

// Both require manual render() calls
app1.render();
app2.render();
```

## Migration Guide

### From Manual to Reactive Mode

**Before (Manual Mode):**
```javascript
const app = dataBind.init(rootElement, viewModel);

function updateData() {
    viewModel.name = 'New Name';
    viewModel.items.push(newItem);
    app.render(); // Manual render
}
```

**After (Reactive Mode):**
```javascript
const app = dataBind.init(rootElement, viewModel);
// Reactive mode is default

function updateData() {
    // IMPORTANT: Use component.viewModel for reactive updates
    app.viewModel.name = 'New Name';
    app.viewModel.items.push(newItem);
    // Automatic render!
}
```

### Common Migration Issues

**Issue**: Updates don't trigger renders

```javascript
// ❌ Wrong - updating original viewModel
viewModel.name = 'Jane';

// ✅ Correct - updating reactive proxy
app.viewModel.name = 'Jane';
```

**Issue**: Need manual render control

```javascript
// Use manual mode for specific components
const app = dataBind.init(rootElement, viewModel, {
    reactive: false
});
```

## Best Practices

1. **Use reactive mode by default** - Better DX, less boilerplate
2. **Set global config early** - Call `use()` before creating any components
3. **Use manual mode for benchmarks** - Precise control for performance testing
4. **Update via component.viewModel** - Always use the reactive proxy in reactive mode
5. **Document mode in complex apps** - Make it clear which components are reactive/manual

## API Reference

### `dataBind.use(settings)`

Set global configuration for all components.

**Parameters:**
- `settings` (Object)
  - `reactive` (Boolean) - Enable/disable reactive mode globally
  - `trackChanges` (Boolean) - Enable/disable change tracking globally
  - `bindingAttrs` (Object) - Custom binding attribute names

**Returns:** void

**Example:**
```javascript
dataBind.use({
    reactive: true,
    trackChanges: false
});
```

### `dataBind.init(element, viewModel, options)`

Create a new component instance.

**Parameters:**
- `element` (HTMLElement) - Root element for the component
- `viewModel` (Object) - Data model for the component
- `options` (Object, optional)
  - `reactive` (Boolean) - Override global reactive setting
  - `trackChanges` (Boolean) - Override global trackChanges setting

**Returns:** Binder instance

**Example:**
```javascript
const app = dataBind.init(
    document.getElementById('app'),
    { name: 'John', age: 30 },
    { reactive: false }
);
```
