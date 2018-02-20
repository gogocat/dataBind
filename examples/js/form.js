(function($, window) {
    let formApp;
    let formComponentA;
    let formComponentB;
    let formComponentBViewModel;
    let formAppViewModel = {
        intro: {
            title: 'Hello, world!',
            description: `This is a template for a simple marketing or informational website. 
            It includes a large callout called a jumbotron and three supporting pieces of content. 
            Use it as a starting point to create something more unique.`,
            btnText: 'Learn more »',
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

    // use new FormComponentVewModel instance and overwrite personalDetails
    formComponentBViewModel = new FormComponentVewModel();
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
    $(document).ready(function() {
        // main formApp
        formApp = dataBind.init($('[data-jq-comp="formApp"]'), formAppViewModel);
        formApp.render().then(function() {
            // for debug
            console.log(formApp);
            window.formApp = formApp;
        });

        // formComponentA
        formComponentA = dataBind.init(
            $('[data-jq-comp="formComponentA"]'),
            new FormComponentVewModel()
        );
        formComponentA.render().then(function() {
            // for debug
            console.log(formComponentA);
            window.formComponentA = formComponentA;
        });

        // formComponentB
        formComponentB = dataBind.init(
            $('[data-jq-comp="formComponentB"]'),
            formComponentBViewModel
        );
        formComponentB.render().then(function() {
            // for debug
            console.log(formComponentB);
            window.formComponentB = formComponentB;
        });
    });
})(jQuery, window);
