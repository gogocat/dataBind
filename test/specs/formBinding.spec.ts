import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import {waitFor} from '@testing-library/dom';

describe('Given form-component initised', () => {
    const getElementAttributesObj = function ($el: Element) {
        const obj: any = {};
        Array.from($el.attributes).forEach((attr) => {
            if (attr.specified) {
                obj[attr.name] = attr.value;
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
        onAddTask(_e: Event, _$element: any, newValue: any, _oldValue: any) {
            this.taskName = newValue;
            this.updateView();
        },
        onMarkAllCompleted(_e: Event, _$element: any, _newValue: any, _oldValue: any) {
            this.markAllCompleted = true;
            this.updateView();
        },
        onSelected(e: Event, $element: any, newValue: any, oldValue: any) {
            expect(newValue).not.toBe(oldValue);
        },
        onGenderChanged(e: Event, $element: any, newValue: any, oldValue: any) {
            expect(newValue).not.toBe(oldValue);
        },
        onTestDateChanged(e: Event, $element: any, newValue: any, oldValue: any) {
            expect(newValue).not.toBe(oldValue);
        },
        onTestRangeChanged(e: Event, $element: any, newValue: any, oldValue: any) {
            expect(newValue).not.toBe(oldValue);
            this.updateView();
        },
        onTestRangeInputChange(e: Event, $element: any, newValue: any, oldValue: any) {
            expect(newValue).not.toBe(oldValue);
            this.updateView();
        },
        onMessageChanged(e: Event, $element: any, newValue: any, oldValue: any) {
            expect(newValue).not.toBe(oldValue);
            this.updateView();
        },
        onEditTask(_e: Event, _$element: any) {
            this.showTaskNameInput = true;
            this.updateView();
        },
        onFocusEditTask(e: Event, $element: any) {
            expect($element.id).toBe('taskName');
        },
        onBlurEditTask(e: Event, $element: any) {
            expect($element.id).toBe('taskName');
        },
        onTestFormSubmit(e: Event, _$element: any, _formData: any) {
            e.preventDefault();
        },
        updateView() {
            namespace.formComponentApp.render();
        },
    };
    const namespace: any = {};

    beforeEach(async () => {
        loadFixture('test/fixtures/formBindings.html');
        namespace.formComponentApp = dataBind.init(document.querySelector('[data-bind-comp="form-component"]'), formComponentVM);
        await namespace.formComponentApp.render();
    });

    afterEach(() => {
        // clean up app
        delete namespace.formComponentApp;
    });

    it('Then each bond input element should updated according to viewModel', async () => {
        await waitFor(() => {
            expect(document.querySelector('#test-form-title')!.textContent).toBe(formComponentVM.title);
            expect(document.querySelector('#test-form-description')!.textContent).toBe(formComponentVM.description);
            expect((document.querySelector('#test-form-description') as HTMLElement)!.style.display !== 'none').toBe(formComponentVM.showContent);
            expect((document.querySelector('#toggle-all') as HTMLInputElement).checked).toBe(formComponentVM.markAllCompleted);
            expect((document.querySelector('input[name="gender"]:checked') as HTMLInputElement).value).toBe(formComponentVM.gender);
            expect((document.querySelector('#carName') as HTMLSelectElement).value).toBe(formComponentVM.carName);
            expect((document.querySelector('#testDate') as HTMLInputElement).value).toBe(formComponentVM.testDate);
            expect((document.querySelector('#testRange') as HTMLInputElement).value).toBe(formComponentVM.testRange);
            expect(document.querySelector('#testRangeLabel')!.textContent).toBe((document.querySelector('#testRange') as HTMLInputElement).value);
            expect((document.querySelector('#taskName') as HTMLInputElement).value).toBe(formComponentVM.taskName);
            expect((document.querySelector('#taskName') as HTMLElement)!.style.display !== 'none').toBe(formComponentVM.showTaskNameInput);
        }, {timeout: 500});
    });


    it('When change #new-todo input value then viewModel should have updated', async () => {
        const task1 = 'new test task';

        // Wait for element to be ready
        await waitFor(() => {
            const $newTodo = document.getElementById('new-todo');
            expect($newTodo).not.toBeNull();
        }, {timeout: 500});

        const $newTodo = document.getElementById('new-todo') as HTMLInputElement;
        const evt = document.createEvent('HTMLEvents');

        evt.initEvent('change', true, true);
        $newTodo.value = task1;
        $newTodo.dispatchEvent(evt);

        // defer to check after async render
        await waitFor(() => {
            expect(formComponentVM.taskName).toBe(task1);
            expect((document.querySelector('#taskName') as HTMLInputElement).value).toBe(formComponentVM.taskName);
        }, {timeout: 500});
    });

    it('When #toggle-all checked then viewModel should have updated', async () => {
        const $toggleAll = document.getElementById('toggle-all') as HTMLInputElement;
        const evt = document.createEvent('HTMLEvents');

        evt.initEvent('change', true, true);
        $toggleAll.checked = true;
        $toggleAll.dispatchEvent(evt);

        // defer to check after async render
        await waitFor(() => {
            expect(formComponentVM.markAllCompleted).toBe(true);
        }, {timeout: 500});
    });

    it('When #carName dropdwon changed then viewModel should have updated', async () => {
        const newCarName = 'volvo';
        const $carName = document.getElementById('carName') as HTMLSelectElement;
        const evt = document.createEvent('HTMLEvents');

        evt.initEvent('change', true, true);
        $carName.value = newCarName;
        $carName.dispatchEvent(evt);

        await waitFor(() => {
            expect(formComponentVM.carName).toBe(newCarName);
        }, {timeout: 500});
    });

    it('When #radioMale changed then viewModel should have updated', async () => {
        const newGender = 'male';
        const radioMale = document.getElementById('radioMale') as HTMLInputElement;
        const evt = document.createEvent('HTMLEvents');

        evt.initEvent('change', true, true);
        radioMale.checked = true;
        radioMale.dispatchEvent(evt);

        await waitFor(() => {
            expect(formComponentVM.gender).toBe(newGender);
        }, {timeout: 500});
    });

    it('When #testDate date input changed then viewModel should have updated', async () => {
        const newTestDate = '2017-12-31';
        const $testDate = document.getElementById('testDate') as HTMLInputElement;
        const evt = document.createEvent('HTMLEvents');

        evt.initEvent('change', true, true);
        $testDate.value = newTestDate;
        $testDate.dispatchEvent(evt);

        await waitFor(() => {
            expect(formComponentVM.testDate).toBe(newTestDate);
        }, {timeout: 500});
    });

    it('When #testRange range input changed then viewModel should have updated', async () => {
        const newTestRange = '3';
        const $testRange = document.getElementById('testRange') as HTMLInputElement;
        const evt = document.createEvent('HTMLEvents');

        evt.initEvent('change', true, true);
        $testRange.value = newTestRange;
        $testRange.dispatchEvent(evt);

        await waitFor(() => {
            expect(formComponentVM.testRange).toBe(newTestRange);
            expect(document.querySelector('#testRangeLabel')!.textContent).toBe(newTestRange);
        }, {timeout: 500});
    });

    it('When #testRange range input trigger onInput changed then viewModel should have updated', async () => {
        const newTestRange = '4';
        const $testRange = document.getElementById('testRange') as HTMLInputElement;
        const evt = document.createEvent('HTMLEvents');

        evt.initEvent('input', true, true);
        $testRange.value = newTestRange;
        $testRange.dispatchEvent(evt);

        await waitFor(() => {
            expect(formComponentVM.testRange).toBe(newTestRange);
            expect(document.querySelector('#testRangeLabel')!.textContent).toBe(newTestRange);
        }, {timeout: 500});
    });

    it('When #message range input changed with xss html then viewModel data should have escaped value and updated', async () => {
        const newMessage = '<img src=x onerror=alert(1)>';
        const escapedMessage = '&lt;img src=x onerror=alert(1)&gt;';
        const $message = document.getElementById('message') as HTMLTextAreaElement;
        const evt = document.createEvent('HTMLEvents');

        evt.initEvent('change', true, true);
        $message.value = newMessage;
        $message.dispatchEvent(evt);

        await waitFor(() => {
            expect(formComponentVM.message).toBe(escapedMessage);
        }, {timeout: 500});
    });

    it('When #labelTaskeName label double clicked then viewModel should have updated and #taskName should show', async () => {
        const $taskName = document.getElementById('taskName') as HTMLInputElement;

        await waitFor(() => {
            expect((document.querySelector('#taskName') as HTMLElement)!.style.display !== 'none').toBe(formComponentVM.showTaskNameInput);
        }, {timeout: 500});

        $taskName.focus();
        $taskName.blur();
    });

    describe('Element with attribute binding', () => {
        it('should display attribute from viewModel', async () => {
            const $el = document.querySelector('[data-bind-attr="testAttr"]')!;
            await waitFor(() => {
                const attrObj = getElementAttributesObj($el);
                Object.keys(formComponentVM.testAttr).forEach(k => {
                    expect(attrObj[k]).toBe((formComponentVM.testAttr as any)[k]);
                });
            }, {timeout: 500});
        });

        it('should update attribute according to viewModel', async () => {
            const $el = document.querySelector('[data-bind-attr="testAttr"]')!;
            // Use component.viewModel for reactive updates (reactive mode is default)
            namespace.formComponentApp.viewModel.testAttr = {
                id: '8888',
                class: 'hidden',
            } as any;
            // No need to call updateView() - reactive mode triggers automatic render

            await waitFor(() => {
                const attrObj = getElementAttributesObj($el);
                Object.keys(namespace.formComponentApp.viewModel.testAttr).forEach(k => {
                    expect(attrObj[k]).toBe((namespace.formComponentApp.viewModel.testAttr as any)[k]);
                });
                expect(attrObj.rel).toBeUndefined();
            }, {timeout: 500});
        });
    });
});
