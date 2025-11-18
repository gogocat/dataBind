(function () {
    // Helper function to log messages
    function log(logId, message, type = 'info') {
        const logEl = document.getElementById(logId);
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        logEl.appendChild(entry);
        logEl.scrollTop = logEl.scrollHeight;
    }

    // Example 1: Basic Usage
    const basicViewModel = {
        counter: 0,
        increment() {
            this.counter++;
            // Reactive mode - automatic render!
        },
        reset() {
            this.counter = 0;
            // Reactive mode - automatic render!
        },
    };

    const basicComponent = dataBind.init(
        document.querySelector('[data-bind-comp="basic-demo"]'),
        basicViewModel,
    );

    // Register afterRender callback
    basicComponent.afterRender(() => {
        log('basic-log', `Counter updated to: ${basicComponent.viewModel.counter}`);
    });

    basicComponent.render().then(() => {
        log('basic-log', 'Component initialized');
    });

    // Example 2: Performance Monitoring
    const perfViewModel = {
        items: [],
        addItems() {
            for (let i = 0; i < 10; i++) {
                this.items.push({
                    text: `Item ${this.items.length + 1}`,
                    id: Date.now() + i,
                });
            }
            // Reactive mode - automatic render!
        },
        clearItems() {
            this.items = [];
            // Reactive mode - automatic render!
        },
    };

    const perfComponent = dataBind.init(
        document.querySelector('[data-bind-comp="perf-demo"]'),
        perfViewModel,
    );

    // Track render performance
    let renderStartTime;
    perfComponent.afterRender(() => {
        if (renderStartTime) {
            const renderTime = performance.now() - renderStartTime;
            log('perf-log', `Render completed in ${renderTime.toFixed(2)}ms (${perfComponent.viewModel.items.length} items)`);
            renderStartTime = null;
        }
    });

    // Hook into viewModel changes to track start time
    const originalAddItems = perfViewModel.addItems;
    perfViewModel.addItems = function () {
        renderStartTime = performance.now();
        originalAddItems.call(this);
    };

    const originalClearItems = perfViewModel.clearItems;
    perfViewModel.clearItems = function () {
        renderStartTime = performance.now();
        originalClearItems.call(this);
    };

    perfComponent.render().then(() => {
        log('perf-log', 'Performance monitor ready');
    });

    // Example 3: DOM Manipulation
    const domViewModel = {
        items: [
            {text: 'Item 1', active: true},
            {text: 'Item 2', active: false},
        ],
        get activeCount() {
            return this.items.filter(item => item.active).length;
        },
        addItem() {
            this.items.push({
                text: `Item ${this.items.length + 1}`,
                active: false,
            });
            // Reactive mode - automatic render!
        },
        toggleFirst() {
            if (this.items.length > 0) {
                this.items[0].active = !this.items[0].active;
                // Reactive mode - automatic render!
            }
        },
    };

    const domComponent = dataBind.init(
        document.querySelector('[data-bind-comp="dom-demo"]'),
        domViewModel,
    );

    // DOM manipulation after render
    domComponent.afterRender(() => {
        const list = document.getElementById('dom-list');
        const activeItems = list.querySelectorAll('.highlight');
        log('dom-log', `Render complete: ${activeItems.length} active items highlighted`);

        // Example: Scroll to first active item
        if (activeItems.length > 0) {
            activeItems[0].scrollIntoView({behavior: 'smooth', block: 'nearest'});
        }
    });

    domComponent.render().then(() => {
        log('dom-log', 'DOM manipulation demo ready');
    });

    // Example 4: Add/Remove Callbacks
    const toggleViewModel = {
        value: 0,
        increment() {
            this.value++;
            // Reactive mode - automatic render!
        },
    };

    const toggleComponent = dataBind.init(
        document.querySelector('[data-bind-comp="toggle-demo"]'),
        toggleViewModel,
    );

    // Callback reference for add/remove
    let loggerCallback = null;

    document.getElementById('addCallback').addEventListener('click', () => {
        if (!loggerCallback) {
            loggerCallback = () => {
                log('toggle-log', `Value changed to: ${toggleComponent.viewModel.value}`);
            };
            toggleComponent.afterRender(loggerCallback);
            log('toggle-log', '✅ Logger callback added', 'success');
        } else {
            log('toggle-log', '⚠️ Logger already added', 'warning');
        }
    });

    document.getElementById('removeCallback').addEventListener('click', () => {
        if (loggerCallback) {
            toggleComponent.removeAfterRender(loggerCallback);
            log('toggle-log', '❌ Logger callback removed', 'info');
            loggerCallback = null;
        } else {
            log('toggle-log', '⚠️ No logger to remove', 'warning');
        }
    });

    document.getElementById('clearCallbacks').addEventListener('click', () => {
        toggleComponent.clearAfterRender();
        log('toggle-log', '🗑️ All callbacks cleared', 'info');
        loggerCallback = null;
    });

    toggleComponent.render().then(() => {
        log('toggle-log', 'Toggle demo ready');
    });

    // Debug access
    window.afterRenderDemos = {
        basic: basicComponent,
        perf: perfComponent,
        dom: domComponent,
        toggle: toggleComponent,
    };
})();
