# DBMonster Performance Comparison

This directory contains two versions of the dbmonster benchmark to compare performance between manual and reactive rendering modes.

## Files

### Manual Mode
- **HTML**: `dbmonsterForOf.html`
- **JS**: `js/dbMonApp.js`
- **Mode**: `{reactive: false}` (manual mode)

### Reactive Mode
- **HTML**: `dbmonsterForOfReactive.html`
- **JS**: `js/dbMonAppReactive.js`
- **Mode**: Default (reactive mode enabled)

## Key Differences

### Manual Mode (`dbMonApp.js`)

```javascript
// Manual mode - explicit control
const dbMonApp = dataBind.init(document.getElementById('app'), viewModel, {reactive: false});

function refreshApp() {
    // Update original viewModel
    viewModel.databases = performanceEnv.generateData().toArray();

    // Manual render with selective template binding
    dbMonApp.render({templateBinding: shouldUpdateTemplate});

    // Manual tracking of template binding updates
    oldDbLength = newDbLength;
}
```

**Characteristics:**
- ✅ Full control over when renders happen
- ✅ Can selectively update template bindings (only when database count changes)
- ✅ Lower overhead (no Proxy wrapper)
- ❌ More code to write and maintain

### Reactive Mode (`dbMonAppReactive.js`)

```javascript
// Reactive mode - automatic updates
const dbMonApp = dataBind.init(document.getElementById('app'), viewModel);

function refreshApp() {
    // Update via component.viewModel to trigger automatic render
    dbMonApp.viewModel.databases = performanceEnv.generateData().toArray();

    // No render() call needed - automatic!
    // Template bindings always update
}
```

**Characteristics:**
- ✅ Less code - automatic rendering
- ✅ Modern reactive pattern (like Vue 3, MobX)
- ✅ No manual render() calls needed
- ⚠️ Slight Proxy overhead
- ⚠️ Always updates template bindings (can't selectively skip)

## Performance Testing

### How to Test

1. Open both HTML files in separate browser tabs
2. Watch the performance metrics displayed by the monitoring scripts
3. Compare:
   - **Render Rate** (renders/second)
   - **Memory Usage**
   - **Paint Time**

### Expected Results

**Manual Mode:**
- May have slightly better raw performance due to no Proxy overhead
- Can optimize by skipping template binding updates when database count unchanged
- More predictable render timing

**Reactive Mode:**
- Slightly more overhead from Proxy wrapper (~1-5%)
- Always updates template bindings (may be slower if database count doesn't change)
- Automatic batching via RAF debouncing

### When to Use Each Mode

**Use Manual Mode When:**
- Maximum performance is critical (high-frequency updates)
- You need fine-grained control over rendering
- Working with very large objects (>10000 properties)
- Building performance benchmarks

**Use Reactive Mode When:**
- Building typical web applications
- Developer experience and code maintainability are priorities
- Moderate update frequencies
- You want automatic, predictable rendering

## Technical Details

### RAF Debouncing

Both modes use `requestAnimationFrame` debouncing:
- Multiple changes within a single frame are batched into one render
- This ensures optimal performance in both modes

### Proxy Overhead

Reactive mode uses JavaScript Proxy to intercept property changes:
- Modern browsers have highly optimized Proxy implementations
- Overhead is typically negligible for most applications
- Only noticeable with extremely high-frequency updates (like dbmonster)

## Conclusion

The dbmonster benchmark is an extreme stress test with continuous high-frequency updates. In real-world applications, the performance difference between manual and reactive modes is typically negligible, while reactive mode provides significantly better developer experience.

Choose based on your use case:
- **Performance benchmarks / extreme cases**: Manual mode
- **Real-world applications**: Reactive mode
