(function() {
    // viewModel as Class for create multiple instance
    class FormComponentVewModel {
        constructor() {
            this.personalDetails = [
                {
                    show: true,
                    inputName: 'firstName',
                    label: 'First name',
                    value: 'adam',
                    updatedCss: 'updated',
                },
                {
                    show: true,
                    inputName: 'lastName',
                    label: 'Last name',
                    value: 'chow',
                    updatedCss: 'updated',
                },
                {
                    show: true,
                    inputName: 'phone',
                    label: 'Phone',
                    value: '987654321',
                    updatedCss: 'updated',
                },
                {
                    show: true,
                    inputName: 'age',
                    label: 'Age',
                    value: '3',
                    updatedCss: 'updated',
                },
                {
                    show: true,
                    inputName: 'gender',
                    label: 'Gender',
                    value: 'male',
                    updatedCss: 'updated',
                },
            ];
        }

        getInputIdName(index, oldAttrObj, $el) {
            const inputSetting = this.personalDetails[index];
            return {
                id: inputSetting.inputName,
                name: inputSetting.inputName,
            };
        }
        onInputChange(e, $el, newValue, oldValue, index) {
            console.log('onInputChange: ', this);
            this.personalDetails[index].show = false;
            this.updateView();
        }

        addRows(e) {
            e.preventDefault();
            this.personalDetails.push(
                {
                    show: true,
                    inputName: 'address',
                    label: 'Address',
                    value: '',
                    updatedCss: 'updated',
                },
                {
                    show: true,
                    inputName: 'country',
                    label: 'Country',
                    value: '',
                    updatedCss: 'updated',
                },
            );
            this.updateView();
        }
        removeRows(e) {
            e.preventDefault();
            this.personalDetails.splice(this.personalDetails.length - 2, 2);
            this.updateView();
        }
        afterTemplateRender() {
            console.log('template rendered');
        }
        updateView(opt) {
            this.APP.render(opt);
        }
    }

    // formComponentC viewModel
    forOfComponentViewModel = new FormComponentVewModel();

    // start binding on DOM ready

    // formComponentC - test for-of binding
    const forOfComponent = dataBind.init(document.querySelector('[data-bind-comp="forOfComponent"]'), forOfComponentViewModel);
    forOfComponent.render().then(function() {
        // for debug
        window.forOfComponent = forOfComponent;
    });
})();
