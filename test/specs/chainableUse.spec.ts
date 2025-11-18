import {describe, it, expect, beforeEach, afterEach} from 'vitest';

describe('Chainable use() API', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('should support chaining use() with init()', () => {
        document.body.innerHTML = `
            <div id="app" data-bind-comp="test">
                <span data-bind-text="value"></span>
            </div>
        `;

        const viewModel = {
            value: 'Hello',
        };

        // Chain use() with init()
        const app = (window as any).dataBind
            .use({reactive: false})
            .init(document.getElementById('app'), viewModel);

        expect(app).toBeDefined();
        expect(app.isReactive).toBe(false);
    });

    it('should support multiple use() calls in chain', () => {
        document.body.innerHTML = `
            <div id="app" data-bind-comp="test">
                <span data-bind-text="value"></span>
            </div>
        `;

        const viewModel = {
            value: 'Hello',
        };

        // Multiple chained use() calls (last one wins)
        const app = (window as any).dataBind
            .use({reactive: true})
            .use({trackChanges: true})
            .use({reactive: false})
            .init(document.getElementById('app'), viewModel);

        expect(app).toBeDefined();
        expect(app.isReactive).toBe(false);
    });

    it('should work with traditional use() then init() pattern', () => {
        document.body.innerHTML = `
            <div id="app" data-bind-comp="test">
                <span data-bind-text="value"></span>
            </div>
        `;

        const viewModel = {
            value: 'Hello',
        };

        // Traditional pattern (still works)
        (window as any).dataBind.use({reactive: false});
        const app = (window as any).dataBind.init(
            document.getElementById('app'),
            viewModel,
        );

        expect(app).toBeDefined();
        expect(app.isReactive).toBe(false);
    });

    it('should allow instance options to override chained use() settings', () => {
        document.body.innerHTML = `
            <div id="app" data-bind-comp="test">
                <span data-bind-text="value"></span>
            </div>
        `;

        const viewModel = {
            value: 'Hello',
        };

        // use() sets reactive: false, but instance option overrides to true
        const app = (window as any).dataBind
            .use({reactive: false})
            .init(document.getElementById('app'), viewModel, {reactive: true});

        expect(app).toBeDefined();
        expect(app.isReactive).toBe(true);
    });

    it('should reset to default after using chained use()', () => {
        document.body.innerHTML = `
            <div id="app1" data-bind-comp="test1">
                <span data-bind-text="value"></span>
            </div>
            <div id="app2" data-bind-comp="test2">
                <span data-bind-text="value"></span>
            </div>
        `;

        const viewModel = {value: 'Hello'};

        // First component with chained use
        const app1 = (window as any).dataBind
            .use({reactive: false})
            .init(document.getElementById('app1'), viewModel);

        // Second component should inherit the global setting from use()
        const app2 = (window as any).dataBind.init(
            document.getElementById('app2'),
            viewModel,
        );

        expect(app1.isReactive).toBe(false);
        expect(app2.isReactive).toBe(false); // Global setting persists

        // Reset to default
        (window as any).dataBind.use({reactive: true});
    });
});
