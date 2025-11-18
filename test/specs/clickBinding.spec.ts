import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {waitFor} from '@testing-library/dom';

describe('Click Binding - Event Handler Deduplication', () => {
    let namespace: any;

    const loadFixture = (fixturePath: string) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', fixturePath, false);
        xhr.send();
        document.body.innerHTML = xhr.responseText;
    };

    beforeEach(() => {
        namespace = (window as any).namespace || {};
        (window as any).namespace = namespace;
    });

    afterEach(() => {
        document.body.innerHTML = '';
        delete (window as any).namespace;
    });

    it('should only call click handler once per click, even after re-render', async () => {
        // Create a simple fixture
        document.body.innerHTML = `
            <div data-bind-comp="test-component">
                <button id="testButton" data-bind-click="handleClick">Click Me</button>
                <span id="counter" data-bind-text="count"></span>
            </div>
        `;

        const clickSpy = vi.fn();
        const viewModel = {
            count: 0,
            handleClick() {
                clickSpy();
                this.count++;
            },
        };

        const component = (window as any).dataBind.init(
            document.querySelector('[data-bind-comp="test-component"]'),
            viewModel,
        );

        await component.render();

        const button = document.getElementById('testButton') as HTMLButtonElement;

        // First click
        button.click();

        await waitFor(() => {
            expect(clickSpy).toHaveBeenCalledTimes(1);
            expect(component.viewModel.count).toBe(1);
        });

        // Wait for reactive render to complete
        await new Promise(resolve => setTimeout(resolve, 100));

        // Second click - should still only call once
        clickSpy.mockClear();
        button.click();

        await waitFor(() => {
            expect(clickSpy).toHaveBeenCalledTimes(1);
            expect(component.viewModel.count).toBe(2);
        });
    });

    it('should properly remove old handlers when re-rendering with template binding', async () => {
        document.body.innerHTML = `
            <div data-bind-comp="test-component">
                <div data-bind-for="item in items">
                    <button class="item-button" data-bind-click="$root.handleItemClick($index)">
                        Item <span data-bind-text="$index"></span>
                    </button>
                </div>
            </div>
        `;

        const clickSpy = vi.fn();
        const viewModel = {
            items: [1, 2, 3],
            handleItemClick(e: Event, el: HTMLElement, index: number) {
                clickSpy(index);
            },
        };

        const component = (window as any).dataBind.init(
            document.querySelector('[data-bind-comp="test-component"]'),
            viewModel,
        );

        await component.render();

        const buttons = document.querySelectorAll('.item-button') as NodeListOf<HTMLButtonElement>;
        expect(buttons.length).toBe(3);

        // Click first button
        buttons[0].click();

        await waitFor(() => {
            expect(clickSpy).toHaveBeenCalledTimes(1);
            expect(clickSpy).toHaveBeenCalledWith(0);
        });

        // Wait for any reactive updates
        await new Promise(resolve => setTimeout(resolve, 100));

        // Update items to trigger re-render
        clickSpy.mockClear();
        component.viewModel.items = [1, 2, 3, 4];

        await waitFor(() => {
            const newButtons = document.querySelectorAll('.item-button') as NodeListOf<HTMLButtonElement>;
            expect(newButtons.length).toBe(4);
        });

        // Click first button again - should only fire once
        const newButtons = document.querySelectorAll('.item-button') as NodeListOf<HTMLButtonElement>;
        newButtons[0].click();

        await waitFor(() => {
            expect(clickSpy).toHaveBeenCalledTimes(1);
            expect(clickSpy).toHaveBeenCalledWith(0);
        });
    });

    it('should handle multiple event types without conflicts', async () => {
        document.body.innerHTML = `
            <div data-bind-comp="test-component">
                <button
                    id="multiEventButton"
                    data-bind-click="handleClick"
                    data-bind-dblclick="handleDblClick"
                >Multi Event Button</button>
                <span id="clickCount" data-bind-text="clickCount"></span>
                <span id="dblClickCount" data-bind-text="dblClickCount"></span>
            </div>
        `;

        const viewModel = {
            clickCount: 0,
            dblClickCount: 0,
            handleClick() {
                this.clickCount++;
            },
            handleDblClick() {
                this.dblClickCount++;
            },
        };

        const component = (window as any).dataBind.init(
            document.querySelector('[data-bind-comp="test-component"]'),
            viewModel,
        );

        await component.render();

        const button = document.getElementById('multiEventButton') as HTMLButtonElement;

        // Single click
        button.click();

        await waitFor(() => {
            expect(component.viewModel.clickCount).toBe(1);
            expect(component.viewModel.dblClickCount).toBe(0);
        });

        // Wait for reactive render
        await new Promise(resolve => setTimeout(resolve, 100));

        // Double click
        button.dispatchEvent(new MouseEvent('dblclick', {bubbles: true}));

        await waitFor(() => {
            expect(component.viewModel.clickCount).toBe(1);
            expect(component.viewModel.dblClickCount).toBe(1);
        });

        // Wait for reactive render
        await new Promise(resolve => setTimeout(resolve, 100));

        // Another click - should still only increment by 1
        button.click();

        await waitFor(() => {
            expect(component.viewModel.clickCount).toBe(2);
            expect(component.viewModel.dblClickCount).toBe(1);
        });
    });
});
