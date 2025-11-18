![GitHub release](https://img.shields.io/github/release/gogocat/dataBind.svg)
![coverage](https://img.shields.io/badge/coverage-70%25-green.svg?cacheSeconds=2592000)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/e754785d29d946bf9a0ab7146869caec)](https://www.codacy.com/app/gogocat/dataBind?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=gogocat/dataBind&amp;utm_campaign=Badge_Grade)
![GitHub](https://img.shields.io/github/license/gogocat/dataBind.svg)

# dataBind.js

> Simple, fast, reactive data binding for modern browsers. No build tools required.

## Why dataBind?

**dataBind.js is not another front-end UI framework.** It's a lightweight, pragmatic solution for adding reactive data binding to your existing HTML, without the complexity of modern frameworks.

### Key Features

✨ **Simple** - Just HTML + JavaScript. No JSX, no virtual DOM, no build pipeline
⚡ **Fast** - Extremely small footprint (~15KB min+gzip) and high performance ([see benchmarks](https://gogocat.github.io/dataBind/examples/dbmonsterForOf.html))
🔄 **Reactive** - Automatic UI updates when data changes (like Vue 3, but simpler)
🎯 **Focused** - View + ViewModel pattern. No router, no state management, no opinions
🛠️ **Zero Setup** - Drop in a `<script>` tag and go. Works with any backend or framework
📦 **Tiny** - No dependencies, no build tools, no configuration

## Quick Start

### Installation

**Via CDN:**
```html
<script src="https://unpkg.com/@gogocat/data-bind/dist/js/dataBind.min.js"></script>
```

**Via NPM:**
```bash
npm install @gogocat/data-bind
```

```javascript
import dataBind from '@gogocat/data-bind';
```

### Basic Example

**HTML:**
```html
<div id="app">
    <h1 data-bind-text="greeting"></h1>
    <button data-bind-click="changeGreeting">Change</button>
</div>
```

**JavaScript:**
```javascript
const app = dataBind.init(document.getElementById('app'), {
    greeting: 'Hello, World!',
    changeGreeting() {
        this.greeting = 'Hello, dataBind!';
        // That's it! UI updates automatically in reactive mode
    }
});

app.render();
```

That's it! No JSX, no compilation, no complex setup.

## Reactive State (Default)

By default, dataBind uses **reactive mode** - changes to data automatically update the UI:

```javascript
const app = dataBind.init(element, {
    counter: 0,
    items: [],
    increment() {
        this.counter++;  // UI updates automatically!
    },
    addItem() {
        this.items.push({ text: 'New Item' });  // UI updates automatically!
    }
});

app.render();
```

### How It Works

dataBind uses JavaScript Proxies to detect data changes:

```javascript
// After init, use component.viewModel for reactive updates
app.viewModel.counter++;           // ✅ Triggers automatic render
app.viewModel.items.push({...});   // ✅ Triggers automatic render
app.viewModel.user.name = 'Jane';  // ✅ Deep reactivity works!
```

### Manual Mode (Optional)

For maximum performance control, disable reactive mode:

```javascript
const app = dataBind.use({ reactive: false }).init(element, viewModel);

// In manual mode, call render() explicitly
viewModel.counter++;
app.render();  // Manual render call
```

## Core Bindings

### Text Binding
```html
<h1 data-bind-text="title"></h1>
<p data-bind-text="user.name"></p>  <!-- Deep paths supported -->
```

### Event Binding
```html
<button data-bind-click="handleClick">Click Me</button>
<input data-bind-change="handleChange" data-bind-model="username">
<form data-bind-submit="handleSubmit">...</form>
```

```javascript
const viewModel = {
    handleClick(event, element) {
        console.log('Clicked!', event, element);
    },
    handleChange(event, element, newValue, oldValue) {
        console.log('Changed from', oldValue, 'to', newValue);
    }
};
```

### List Rendering
```html
<div data-bind-for="item in items">
    <p data-bind-text="item.name"></p>
    <button data-bind-click="$root.deleteItem($index)">Delete</button>
</div>
```

```javascript
const viewModel = {
    items: [
        { name: 'Item 1' },
        { name: 'Item 2' }
    ],
    deleteItem(index) {
        this.items.splice(index, 1);  // Reactive update!
    }
};
```

### Conditional Rendering
```html
<!-- Removes from DOM when false -->
<div data-bind-if="isLoggedIn">
    <p data-bind-text="user.name"></p>
</div>

<!-- Hides with CSS when false -->
<div data-bind-show="isVisible">
    <p>Visible content</p>
</div>

<!-- Switch statement for multiple conditions -->
<div data-bind-switch="currentState">
    <div data-bind-case="loading">Loading...</div>
    <div data-bind-case="error">An error occurred</div>
    <div data-bind-case="success">Data loaded successfully!</div>
    <div data-bind-default>Please wait...</div>
</div>
```

### CSS Binding
```html
<div data-bind-css="{ active: isActive, disabled: !isEnabled }"></div>
<div data-bind-css="dynamicClass"></div>
```

### Two-Way Data Binding
```html
<input
    type="text"
    data-bind-model="username"
    data-bind-change="onUsernameChange">
```

The `data-bind-model` populates the input value from viewModel, while `data-bind-change` updates the viewModel when the input changes.

## Advanced Features

### Templates
```html
<div data-bind-tmp="{id: 'userCard', data: 'user'}"></div>

<template id="userCard">
    <div class="card">
        <h2 data-bind-text="name"></h2>
        <p data-bind-text="email"></p>
    </div>
</template>
```

### Filters
```html
<p data-bind-text="price | toDiscount | addGst"></p>
```

```javascript
const viewModel = {
    price: 100,
    toDiscount(value) {
        return value * 0.9;  // 10% discount
    },
    addGst(value) {
        return value * 1.1;  // Add 10% GST
    }
};
```

### Component Communication (Pub/Sub)
```javascript
// Component A: Subscribe to events
componentA.subscribe('USER_UPDATED', (userData) => {
    console.log('User updated:', userData);
});

// Component B: Publish events
componentB.publish('USER_UPDATED', { name: 'John', email: 'john@example.com' });
```

### AfterRender Callback
```javascript
app.afterRender(() => {
    console.log('Render completed!');
    // Perform DOM operations, analytics, etc.
});
```

### Global Configuration
```javascript
// Set global defaults for all components
dataBind.use({
    reactive: true,      // Enable reactive mode globally
    trackChanges: false  // Track individual property changes
});

// Or use chainable API
const app = dataBind
    .use({ reactive: false })
    .init(element, viewModel);
```

## Performance

dataBind is **extremely fast**. Try our benchmarks:

- [**DBMonster - dataBind** (1000+ updates/sec)](https://gogocat.github.io/dataBind/examples/dbmonsterForOf.html)
- [**DBMonster - React** (comparison)](https://gogocat.github.io/dataBind/examples/dbmonsterReact.html)
- [**Fiber** (Complex nested updates)](https://gogocat.github.io/dataBind/examples/fiber-demo.html)

Compare with [other frameworks](http://mathieuancelin.github.io/js-repaint-perfs/).

### Why So Fast?

- **No Virtual DOM** - Direct DOM updates with minimal overhead
- **Efficient Diffing** - Only updates changed elements
- **Debounced Rendering** - Batches multiple changes via requestAnimationFrame
- **Tiny Size** - ~15KB min+gzip (vs React 40KB+, Vue 33KB+)

## Real-World Examples

- [**TodoMVC**](https://gogocat.github.io/dataBind/examples/todomvc.html) - Classic todo app
- [**Bootstrap Integration**](https://gogocat.github.io/dataBind/examples/bootstrap.html) - Multi-component app
- [**Complex Lists**](https://gogocat.github.io/dataBind/examples/forOfBindingComplex.html) - Nested templates
- [**Reactive Demo**](https://gogocat.github.io/dataBind/examples/reactiveDemo.html) - Reactive state examples

## Use Cases

**Perfect For:**

✅ Adding interactivity to server-rendered pages (PHP, .NET, Rails, etc.)
✅ Progressive enhancement of existing sites
✅ Rapid prototyping without build setup
✅ Small to medium web applications
✅ Projects where bundle size matters
✅ Teams that prefer vanilla JavaScript

**Not Ideal For:**

❌ Large single-page applications (consider Vue, React, Angular)
❌ Projects requiring full framework ecosystem (routing, state management, etc.)
❌ Micro-components smaller than a section/widget

## Philosophy

dataBind follows these principles:

1. **Simplicity** - HTML is the template, JavaScript is the logic. No new syntax to learn.
2. **Pragmatism** - Leverage existing infrastructure. Work with what you have.
3. **Performance** - Small, fast, and efficient. No bloat.
4. **Zero Dependencies** - No build tools, no framework lock-in.
5. **Progressive Enhancement** - Add reactivity where needed, keep it simple where possible.

## API Overview

### Initialization
```javascript
dataBind.init(element, viewModel, options?)
```
- `element`: Root DOM element
- `viewModel`: Plain JavaScript object
- `options`: `{ reactive: boolean, trackChanges: boolean }`

### Rendering
```javascript
app.render(options?)  // Returns Promise
```

### Reactive Updates
```javascript
app.viewModel.property = value;  // Automatic render in reactive mode
```

### Lifecycle Hooks
```javascript
app.afterRender(callback)       // Called after each render
app.removeAfterRender(callback) // Remove specific callback
app.clearAfterRender()          // Remove all callbacks
```

### Events
```javascript
app.subscribe(event, handler)
app.subscribeOnce(event, handler)
app.publish(event, data)
app.unsubscribe(event)
app.unsubscribeAll()
```

## Complete Binding Reference

| Binding | Purpose | Example |
|---------|---------|---------|
| `data-bind-text` | Display text content | `<p data-bind-text="message"></p>` |
| `data-bind-click` | Click event | `<button data-bind-click="handleClick"></button>` |
| `data-bind-change` | Change event (inputs) | `<input data-bind-change="onChange">` |
| `data-bind-model` | Two-way binding | `<input data-bind-model="username">` |
| `data-bind-if` | Conditional render | `<div data-bind-if="isVisible">` |
| `data-bind-show` | Conditional display | `<div data-bind-show="isVisible">` |
| `data-bind-for` | List rendering | `<li data-bind-for="item in items">` |
| `data-bind-css` | Dynamic classes | `<div data-bind-css="{ active: isActive }">` |
| `data-bind-attr` | Dynamic attributes | `<img data-bind-attr="getImageAttrs">` |
| `data-bind-tmp` | Template rendering | `<div data-bind-tmp="{id: 'tpl', data: 'user'}">` |
| `data-bind-switch` | Switch statement | `<div data-bind-switch="state">` |
| `data-bind-submit` | Form submit | `<form data-bind-submit="onSubmit">` |
| `data-bind-blur` | Blur event | `<input data-bind-blur="onBlur">` |
| `data-bind-focus` | Focus event | `<input data-bind-focus="onFocus">` |
| `data-bind-dblclick` | Double-click | `<div data-bind-dblclick="onDblClick">` |
| `data-bind-hover` | Hover in/out | `<div data-bind-hover="onHover">` |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Note:** Reactive mode requires Proxy support (IE11 not supported for reactive mode, but manual mode works).

## Documentation

- [Configuration Guide](./CONFIGURATION.md) - Global settings and options
- [Examples](./examples/) - Live examples and demos
- [API Reference](./docs/) - Complete API documentation

## Migration from Manual to Reactive Mode

**Before (Manual Mode):**
```javascript
viewModel.counter++;
app.render();  // Manual render call
```

**After (Reactive Mode - Default):**
```javascript
app.viewModel.counter++;  // Automatic render!
```

See [CONFIGURATION.md](./CONFIGURATION.md) for complete migration guide.

## Contributing

Contributions welcome! Please read our [contributing guidelines](./CONTRIBUTING.md) first.

## License

[MIT](./LICENSE.txt)

---

**Made with ❤️ by developers who love simplicity**
