describe('Given form-component initised', () => {
    const getElementAttributesObj = function($el) {
        const obj = {};
        $.each($el[0].attributes, function() {
            if (this.specified) {
                obj[this.name] = this.value;
            }
        });
        return obj;
    };

    const formComponentVM = {
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
    const namespace = {};

    jasmine.getFixtures().fixturesPath = 'test';

    beforeEach(() => {
        loadFixtures('./fixtures/formBindings.html');
        namespace.formComponentApp = dataBind.init(document.querySelector('[data-bind-comp="form-component"]'), formComponentVM);
        namespace.formComponentApp.render();
    });

    afterEach(() => {
        // clean up app
        delete namespace.formComponentApp;
    });

    it('Then each bond input element should updated according to viewModel', (done) => {
        // check on next tick because dataBind.render is aysn
        setTimeout(() => {
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

    it('When change #new-todo input value then viewModel should have updated', (done) => {
        const task1 = 'new test task';
        setTimeout(function() {
            const $newTodo = document.getElementById('new-todo');
            const evt = document.createEvent('HTMLEvents');

            evt.initEvent('change', true, true);
            $newTodo.value = task1;
            $newTodo.dispatchEvent(evt);

            // defer to check after asyn render
            setTimeout(function() {
                expect(formComponentVM.taskName).toBe(task1);
                expect($('#taskName').val()).toBe(formComponentVM.taskName);
                done();
            }, 100);
        }, 100);
    });

    it('When #toggle-all checked then viewModel should have updated', (done) => {
        setTimeout(() => {
            const $toggleAll = document.getElementById('toggle-all');
            const evt = document.createEvent('HTMLEvents');

            evt.initEvent('change', true, true);
            $toggleAll.checked = true;
            $toggleAll.dispatchEvent(evt);

            // defer to check after asyn render
            setTimeout(() => {
                expect(formComponentVM.markAllCompleted).toBe(true);
                done();
            }, 100);
        }, 100);
    });

    it('When #carName dropdwon changed then viewModel should have updated', (done) => {
        const newCarName = 'audi';

        setTimeout(() => {
            const $carName = document.getElementById('carName');
            const evt = document.createEvent('HTMLEvents');

            evt.initEvent('change', true, true);
            $carName.value = newCarName;
            $carName.dispatchEvent(evt);

            // defer to check after asyn render
            setTimeout(() => {
                expect(formComponentVM.carName).toBe(newCarName);
                done();
            }, 100);
        }, 100);
    });

    it('When #radioMale changed then viewModel should have updated', (done) => {
        const newGender = 'male';

        setTimeout(() => {
            const radioMale = document.getElementById('radioMale');
            const evt = document.createEvent('HTMLEvents');

            evt.initEvent('change', true, true);
            radioMale.checked = true;
            radioMale.dispatchEvent(evt);

            // defer to check after asyn render
            setTimeout(() => {
                expect(formComponentVM.gender).toBe(newGender);
                done();
            }, 100);
        }, 100);
    });

    it('When #testDate date input changed then viewModel should have updated', (done) => {
        const newTestDate = '2018-01-01';

        setTimeout(() => {
            const $testDate = document.getElementById('testDate');
            const evt = document.createEvent('HTMLEvents');

            evt.initEvent('change', true, true);
            $testDate.value = newTestDate;
            $testDate.dispatchEvent(evt);

            // defer to check after asyn render
            setTimeout(() => {
                expect(formComponentVM.testDate).toBe(newTestDate);
                done();
            }, 100);
        }, 100);
    });

    it('When #testRange range input changed then viewModel should have updated', (done) => {
        const newTestRange = '3';

        setTimeout(() => {
            const $testRange = document.getElementById('testRange');
            const evt = document.createEvent('HTMLEvents');

            evt.initEvent('change', true, true);
            $testRange.value = newTestRange;
            $testRange.dispatchEvent(evt);

            // defer to check after asyn render
            setTimeout(() => {
                expect(formComponentVM.testRange).toBe(newTestRange);
                expect($('#testRangeLabel').text()).toBe(newTestRange);
                done();
            }, 100);
        }, 100);
    });

    it('When #message range input changed with xss html then viewModel data should have escaped value and updated', (done) => {
        const newMessage = 'This is a new message for test <script>alert(xss)</script>';

        const escapedMessage = 'This is a new message for test &lt;script&gt;alert(xss)&lt;/script&gt;';

        setTimeout(() => {
            const $message = document.getElementById('message');
            const evt = document.createEvent('HTMLEvents');

            evt.initEvent('change', true, true);
            $message.value = newMessage;
            $message.dispatchEvent(evt);

            // defer to check after asyn render
            setTimeout(() => {
                expect(formComponentVM.message).toBe(escapedMessage);
                done();
            }, 100);
        }, 100);
    });

    it('When #labelTaskeName label double clicked then viewModel should have updated and #taskName should show', (done) => {
        const $labelTaskeName = document.getElementById('labelTaskeName');
        const evtDblclick = document.createEvent('MouseEvents');
        const evtChange = document.createEvent('HTMLEvents');

        evtDblclick.initEvent('dblclick', true, true);
        evtChange.initEvent('change', true, true);

        $labelTaskeName.dispatchEvent(evtDblclick);
        $labelTaskeName.dispatchEvent(evtChange);

        // defer to check after asyn render
        setTimeout(() => {
            const $taskName = document.getElementById('taskName');

            expect($('#taskName').is(':visible')).toBe(formComponentVM.showTaskNameInput);

            $taskName.focus();
            $taskName.blur();
            done();
        }, 100);
    });

    describe('Element with attribute binding', () => {
        it('should display attribute from viewModel', (done) => {
            const $el = $('[data-bind-attr="testAttr"]');
            let attrObj = {};
            setTimeout(() => {
                attrObj = getElementAttributesObj($el);
                $.each(formComponentVM.testAttr, function(k, v) {
                    expect(attrObj[k]).toBe(v);
                });
                done();
            }, 100);
        });

        it('should update attribute according to viewModel', (done) => {
            const $el = $('[data-bind-attr="testAttr"]');
            let attrObj = {};
            formComponentVM.testAttr = {
                id: '8888',
                class: 'hidden',
            };
            formComponentVM.updateView();
            setTimeout(() => {
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
