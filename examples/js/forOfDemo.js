(function($, window) {
    let forOfComponent;

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

        getInputIdName(oldAttrObj, $el, index) {
            let inputSetting = this.personalDetails[index];
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
                }
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
    $(document).ready(function() {
        // formComponentC - test for-of binding
        forOfComponent = dataBind.init(
            $('[data-jq-comp="forOfComponent"]'),
            forOfComponentViewModel
        );
        forOfComponent.render().then(function() {
            // for debug
            console.log(forOfComponent);
            window.forOfComponent = forOfComponent;
        });
    });
})(jQuery, window);
