describe('Given dataBind lib loaded', function() {
    it('Then dataBind object exists', function() {
        expect(typeof dataBind).toBe('object');
    });

    it('Then "dataBind.init" should be a functions', function() {
        expect(typeof dataBind.init).toBe('function');
    });

    it('Then "dataBind.use" should be a functions', function() {
        expect(typeof dataBind.use).toBe('function');
    });

    it('Should throw error if mounting root element does not exits', function() {
        let viewModel = {};

        expect(function() {
            dataBind.init($('#xyz'), viewModel);
        }).toThrowError();
    });

    it('Should throw error if viewModel does not exits', function() {
        expect(function() {
            testApp = dataBind.init($('#xyz'));
        }).toThrowError();
    });
});
