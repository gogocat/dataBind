describe('Given form-component initised', function() {
    var getElementAttributesObj = function($el) {
        var obj = {};
        $.each($el[0].attributes, function() {
            if (this.specified) {
                obj[this.name] = this.value;
            }
        });
        return obj;
    };

    var formComponentVM = {
        title: 'form component title',
        description: 'form component description',
        carName: 'saab',
        showContent: false,
        markAllCompleted: false,
        gender: 'female',
        testDate: '2017-12-25',
        testRange: '1',
        message: 'This is message from viewModel',
        taskName: '',
        showTaskNameInput: false,
        testAttr: {
            id: 'testId',
            rel: 'testRel',
            class: 'show',
        },
        onAddTask: function(e, $element, newValue, oldValue) {
            this.taskName = newValue;
            this.updateView();
        },
        onMarkAllCompleted: function(e, $element, newValue, oldValue) {
            this.markAllCompleted = true;
            this.updateView();
        },
        onSelected: function(e, $element, newValue, oldValue) {
            expect(newValue).not.toBe(oldValue);
        },
        onGenderChanged: function(e, $element, newValue, oldValue) {
            expect(newValue).not.toBe(oldValue);
        },
        onTestDateChanged: function(e, $element, newValue, oldValue) {
            expect(newValue).not.toBe(oldValue);
        },
        onTestRangeChanged: function(e, $element, newValue, oldValue) {
            expect(newValue).not.toBe(oldValue);
            this.updateView();
        },
        onMessageChanged: function(e, $element, newValue, oldValue) {
            expect(newValue).not.toBe(oldValue);
            this.updateView();
        },
        onEditTask: function(e, $element) {
            this.showTaskNameInput = true;
            this.updateView();
        },
        onFocusEditTask: function(e, $element) {
            expect($element[0].id).toBe('taskName');
        },
        onBlurEditTask: function(e, $element) {
            expect($element[0].id).toBe('taskName');
        },
        onTestFormSubmit: function(e, $element, formData) {
            e.preventDefault();
        },
        updateView: function() {
            namespace.formComponentApp.render();
        },
    };
    var namespace = {};

    jasmine.getFixtures().fixturesPath = 'test';

    beforeEach(function() {
        loadFixtures('./fixtures/formBindings.html');
        namespace.formComponentApp = dataBind.init(
            $('[data-jq-comp="form-component"]'),
            formComponentVM
        );
        namespace.formComponentApp.render();
    });

    afterEach(function() {
        // clean up app
        delete namespace.formComponentApp;
    });

    it('Then each bond input element should updated according to viewModel', function(done) {
        // check on next tick because dataBind.render is aysn
        setTimeout(function() {
            expect($('#test-form-title').text()).toBe(formComponentVM.title);
            expect($('#test-form-description').text()).toBe(formComponentVM.description);
            expect($('#test-form-description').is(':visible')).toBe(formComponentVM.showContent);
            expect($('#toggle-all').is(':checked')).toBe(formComponentVM.markAllCompleted);
            expect($('input[name="gender"]:checked').val()).toBe(formComponentVM.gender);
            expect($('#carName').val()).toBe(formComponentVM.carName);
            expect($('#testDate').val()).toBe(formComponentVM.testDate);
            expect($('#testRange').val()).toBe(formComponentVM.testRange);
            expect($('#testRangeLabel').text()).toBe($('#testRange').val());
            expect($('#taskName').val()).toBe(formComponentVM.taskName);
            expect($('#taskName').is(':visible')).toBe(formComponentVM.showTaskNameInput);
            done();
        }, 200);
    });

    it('When change #new-todo input value then viewModel should have updated', function(done) {
        var task1 = 'new test task';
        setTimeout(function() {
            $('#new-todo')
                .val(task1)
                .trigger('change');
            // defer to check after asyn render
            setTimeout(function() {
                expect(formComponentVM.taskName).toBe(task1);
                expect($('#taskName').val()).toBe(formComponentVM.taskName);
                done();
            }, 100);
        }, 100);
    });

    it('When #toggle-all checked then viewModel should have updated', function(done) {
        setTimeout(function() {
            $('#toggle-all')
                .prop('checked', true)
                .trigger('change');
            // defer to check after asyn render
            setTimeout(function() {
                expect(formComponentVM.markAllCompleted).toBe(true);
                done();
            }, 100);
        }, 100);
    });

    it('When #carName dropdwon changed then viewModel should have updated', function(done) {
        var newCarName = 'audi';

        setTimeout(function() {
            $('#carName')
                .val(newCarName)
                .trigger('change');
            // defer to check after asyn render
            setTimeout(function() {
                expect(formComponentVM.carName).toBe(newCarName);
                done();
            }, 100);
        }, 100);
    });

    it('When #radioMale changed then viewModel should have updated', function(done) {
        var newGender = 'male';

        setTimeout(function() {
            $('#radioMale')
                .prop('checked', true)
                .trigger('change');
            // defer to check after asyn render
            setTimeout(function() {
                expect(formComponentVM.gender).toBe(newGender);
                done();
            }, 100);
        }, 100);
    });

    it('When #testDate date input changed then viewModel should have updated', function(done) {
        var newTestDate = '2018-01-01';

        setTimeout(function() {
            $('#testDate')
                .val(newTestDate)
                .trigger('change');

            // defer to check after asyn render
            setTimeout(function() {
                expect(formComponentVM.testDate).toBe(newTestDate);
                done();
            }, 100);
        }, 100);
    });

    it('When #testRange range input changed then viewModel should have updated', function(done) {
        var newTestRange = '3';

        setTimeout(function() {
            $('#testRange')
                .val(newTestRange)
                .trigger('change');
            // defer to check after asyn render
            setTimeout(function() {
                expect(formComponentVM.testRange).toBe(newTestRange);
                expect($('#testRangeLabel').text()).toBe(newTestRange);
                done();
            }, 100);
        }, 100);
    });

    it('When #message range input changed with xss html then viewModel data should have escaped value and updated', function(done) {
        var newMessage = 'This is a new message for test <script>alert(xss)</script>',
            escapedMessage =
                'This is a new message for test &lt;script&gt;alert(xss)&lt;/script&gt;';

        setTimeout(function() {
            $('#message')
                .val(newMessage)
                .trigger('change');
            // defer to check after asyn render
            setTimeout(function() {
                expect(formComponentVM.message).toBe(escapedMessage);
                done();
            }, 100);
        }, 100);
    });

    it('When #labelTaskeName label double clicked then viewModel should have updated and #taskName should show', function(done) {
        $('#labelTaskeName')
            .trigger('dblclick')
            .trigger('change');
        // defer to check after asyn render
        setTimeout(function() {
            expect($('#taskName').is(':visible')).toBe(formComponentVM.showTaskNameInput);
            $('#taskName').trigger('focus');
            $('#taskName').trigger('blur');
            done();
        }, 100);
    });

    describe('Element with attribute binding', function() {
        it('should display attribute from viewModel', function(done) {
            var $el = $('[data-jq-attr="testAttr"]');
            var attrObj = {};
            setTimeout(function() {
                attrObj = getElementAttributesObj($el);
                $.each(formComponentVM.testAttr, function(k, v) {
                    expect(attrObj[k]).toBe(v);
                });
                done();
            }, 100);
        });

        it('should update attribute according to viewModel', function(done) {
            var $el = $('[data-jq-attr="testAttr"]');
            var attrObj = {};
            formComponentVM.testAttr = {
                id: '8888',
                class: 'hidden',
            };
            formComponentVM.updateView();
            setTimeout(function() {
                attrObj = getElementAttributesObj($el);
                $.each(formComponentVM.testAttr, function(k, v) {
                    expect(attrObj[k]).toBe(v);
                });
                expect(attrObj.rel).toBeUndefined();
                done();
            }, 100);
        });
    });
});
