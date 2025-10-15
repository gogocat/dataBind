// Global test helpers and dataBind types
declare global {
    // dataBind global
    const dataBind: {
        init: (element: Element | null, viewModel: any) => any;
        use: (plugin: any) => void;
    };

    // Test helper functions
    function loadFixture(fixturePath: string): void;
    function simulateInput(element: HTMLElement, value: string): void;
    function simulateClick(element: HTMLElement): void;
    function simulateBlur(element: HTMLElement): void;

    // jQuery (used in some test fixtures)
    const $: any;
}

export {};
