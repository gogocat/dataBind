(() =>{
    const formAppViewModel = {
        intro: {
            title: 'Form generator demo',
            description: `This is a dataBind example to auto generate form by data.
            This is demo also shows how to use mulitple instance of an viewModel and extend it.
            First name, last name inputs is one component, and email, address is another component.
            When first input changed, it will hide that row.
            All content is wrap in a template binding using transclusion.
            And finally a quick test of attribute binding 😎`,
            btnText: 'Fake button »',
        },
        attrTest: {
            class: 'show',
            name: 'abc',
        },
        onBtnClick: function(e, $el) {
            e.preventDefault();
            console.log('onBtnClick: ', $el);
        },
    };

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
            ];
        }
        onInputChange(e, $el, newValue, oldValue) {
            console.log('onInputChange: ', this);
            this.personalDetails[0].show = false;
            this.updateView();
        }
        afterTemplateRender() {
            console.log('template rendered');
        }
        updateView(opt) {
            this.APP.render(opt);
        }
    }

    // use new instance of FormComponentVewModel and overwrite personalDetails
    const formComponentBViewModel = new FormComponentVewModel();
    formComponentBViewModel.personalDetails = [
        {
            show: true,
            inputName: 'email',
            label: 'Email',
            value: '',
            updatedCss: 'updated',
        },
        {
            show: true,
            inputName: 'address',
            label: 'Address',
            value: '',
            updatedCss: 'updated',
        },
    ];

    // start binding on DOM ready

    // main formApp
    const formApp = dataBind.init(document.querySelector('[data-jq-comp="formApp"]'), formAppViewModel);
    formApp.render().then(function() {
        // for debug
        console.log(formApp);
        window.formApp = formApp;
    });

    // formComponentA
    const formComponentA = dataBind.init(document.querySelector('[data-jq-comp="formComponentA"]'), new FormComponentVewModel());

    formComponentA.render().then(function() {
        // for debug
        console.log(formComponentA);
        window.formComponentA = formComponentA;
    });

    // formComponentB
    const formComponentB = dataBind.init(document.querySelector('[data-jq-comp="formComponentB"]'), formComponentBViewModel);

    formComponentB.render().then(function() {
        // for debug
        console.log(formComponentB);
        window.formComponentB = formComponentB;
    });
})();
