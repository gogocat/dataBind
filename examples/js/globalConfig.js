(function () {
    console.log('=== Global Configuration Demo ===');

    // Example 1: Default configuration (reactive: true is built-in default)
    console.log('\n1. Creating component with default config (reactive: true)');
    const defaultExample = dataBind.init(
        document.querySelector('[data-bind-comp="default-example"]'),
        {
            counter: 0,
            increment() {
                this.counter++;
                // Reactive mode - automatic render!
            },
            reset() {
                this.counter = 0;
                // Reactive mode - automatic render!
            },
        },
    );

    defaultExample.render().then(() => {
        console.log('Example 1 initialized - Mode:', defaultExample.isReactive ? 'REACTIVE' : 'MANUAL');
        document.getElementById('mode1').textContent = defaultExample.isReactive ? 'REACTIVE ✅' : 'MANUAL';
    });

    // Change global configuration to manual mode
    console.log('\n2. Calling dataBind.use({ reactive: false })');
    dataBind.use({
        reactive: false,
    });
    console.log('Global default is now: reactive = false');

    // Example 2: Component created after use() call - uses manual mode
    console.log('\n3. Creating component after use() call (should use manual mode)');
    const globalManualExample = dataBind.init(
        document.querySelector('[data-bind-comp="global-manual"]'),
        {
            counter: 0,
            increment() {
                this.counter++;
                // Manual mode - need to call render()
                globalManualExample.render();
            },
            reset() {
                this.counter = 0;
                // Manual mode - need to call render()
                globalManualExample.render();
            },
        },
    );

    globalManualExample.render().then(() => {
        console.log('Example 2 initialized - Mode:', globalManualExample.isReactive ? 'REACTIVE' : 'MANUAL');
        document.getElementById('mode2').textContent = globalManualExample.isReactive ? 'REACTIVE' : 'MANUAL ✅';
    });

    // Example 3: Chainable API
    console.log('\n4. Creating component with chainable API: dataBind.use({reactive: false}).init(...)');
    const chainableExample = dataBind.use({reactive: false}).init(
        document.querySelector('[data-bind-comp="chainable"]'),
        {
            counter: 0,
            increment() {
                this.counter++;
                // Manual mode - need to call render()
                chainableExample.render();
            },
            reset() {
                this.counter = 0;
                // Manual mode - need to call render()
                chainableExample.render();
            },
        },
    );

    chainableExample.render().then(() => {
        console.log('Example 3 initialized - Mode:', chainableExample.isReactive ? 'REACTIVE' : 'MANUAL');
        document.getElementById('mode3').textContent = chainableExample.isReactive ? 'REACTIVE' : 'MANUAL ✅ (chained)';
    });

    // Example 4: Override global setting with instance option
    console.log('\n5. Creating component with instance override { reactive: true }');
    const instanceOverride = dataBind.init(
        document.querySelector('[data-bind-comp="instance-override"]'),
        {
            counter: 0,
            increment() {
                this.counter++;
                // Reactive mode - automatic render! (overridden)
            },
            reset() {
                this.counter = 0;
                // Reactive mode - automatic render! (overridden)
            },
        },
        {reactive: true}, // Instance override
    );

    instanceOverride.render().then(() => {
        console.log('Example 4 initialized - Mode:', instanceOverride.isReactive ? 'REACTIVE' : 'MANUAL');
        document.getElementById('mode4').textContent = instanceOverride.isReactive ? 'REACTIVE ✅ (overridden)' : 'MANUAL';
    });

    console.log('\n=== Summary ===');
    console.log('Example 1: Created before use() call → REACTIVE (built-in default)');
    console.log('Example 2: Created after use({reactive: false}) → MANUAL (global default)');
    console.log('Example 3: Created with chainable API → MANUAL (chained use)');
    console.log('Example 4: Created with {reactive: true} → REACTIVE (instance override)');

    // Debug access
    window.configExamples = {
        default: defaultExample,
        globalManual: globalManualExample,
        chainable: chainableExample,
        instanceOverride: instanceOverride,
    };
})();
