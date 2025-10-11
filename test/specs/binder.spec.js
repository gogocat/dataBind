import { describe, it, expect } from 'vitest';

describe('Given dataBind lib loaded', () => {
    it('Then dataBind object exists', () => {
        expect(typeof dataBind).toBe('object');
    });

    it('Then "dataBind.init" should be a functions', () => {
        expect(typeof dataBind.init).toBe('function');
    });

    it('Then "dataBind.use" should be a functions', () => {
        expect(typeof dataBind.use).toBe('function');
    });

    it('Should throw error if mounting root element does not exits', () => {
        const viewModel = {};

        expect(() => {
            dataBind.init(document.getElementById('#xyz'), viewModel);
        }).toThrow();
    });

    it('Should throw error if viewModel does not exits', () => {
        expect(() => {
            dataBind.init(document.getElementById('#xyz'));
        }).toThrow();
    });
});
