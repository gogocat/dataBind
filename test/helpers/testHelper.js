import {afterEach} from 'vitest';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import dataBind from '../../src/index';

/*
 * overwrite requestAnimationFrame to use setTimeout.
 * Otherwise sometimes unpredictable in async tests.
 * Since request animation frame callback runs when browser decides it is free (we don't know exactly when)
 */
global.requestAnimationFrame = (fn) => {
    return setTimeout(fn, 15);
};
global.cancelAnimationFrame = (id) => {
    return clearTimeout(id);
};

// Make dataBind globally available for tests (like it was in Jasmine)
global.dataBind = dataBind;

// Helper function to load HTML fixtures
global.loadFixture = (fixturePath) => {
    const fullPath = resolve(process.cwd(), fixturePath);
    const html = readFileSync(fullPath, 'utf-8');
    document.body.innerHTML = html;
};

// Helper functions for tests to replace jQuery
global.simulateInput = (element, value) => {
    element.value = value;
    element.dispatchEvent(new Event('input', {bubbles: true}));
    element.dispatchEvent(new Event('change', {bubbles: true}));
};

global.simulateClick = (element) => {
    element.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}));
};

global.simulateBlur = (element) => {
    element.dispatchEvent(new FocusEvent('blur', {bubbles: true}));
};

// Helper to clean up DOM after each test
afterEach(() => {
    document.body.innerHTML = '';
});
