import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./test/helpers/testHelper.js'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            reportsDirectory: './coverage',
            include: ['src/**/*.js'],
            exclude: ['node_modules', 'test', 'dist'],
        },
        include: ['test/specs/**/*.spec.ts', 'test/specs/**/*.spec.js'],
        // Increase timeout for async operations
        testTimeout: 10000,
    },
    // Configure esbuild to handle modern JS syntax
    esbuild: {
        target: 'es2017',
    },
    // Optimize dependency pre-bundling to handle circular dependencies
    optimizeDeps: {
        force: true,
    },
});
