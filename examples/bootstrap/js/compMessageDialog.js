// databing message-dialog-component

(function (window) {
    let compMessageDialog;
    const el = {
        messageModal: null,
        messageTextArea: null,
    };
    const viewModel = {
        numSelectedProviders: '',
        selectedAdData: [],
        adIds: [],
        selectedProviders: '',
        defaultMessageText: 'Hi,\nCould you please provide a quote for the following work:\n',
        sendingMessage: false,
        onMessageSubmit(e, formEl, formData) {
            e.preventDefault();
            formData.ids = this.adIds;
            this.sendingMessage = true;
            this.updateStatus();
            console.log('post data: ', formData);
        },
        onTriggerSelectedAds(selectedAdData) {
            this.selectedAdData = selectedAdData;
            this.numSelectedProviders = selectedAdData.length > 1 ? selectedAdData.length : '';
            this.selectedProviders = selectedAdData.length > 1 ? 'advertisers ID: ' : 'advertiser ID:';
            this.adIds = selectedAdData.map((item, index) => {
                return item.id;
            });
            this.selectedProviders += this.adIds.toString();
            this.updateStatus();
        },
        updateStatus() {
            compMessageDialog.render();
        },
    };

    document.addEventListener('DOMContentLoaded', () => {
        el.messageModal = document.getElementById('message-modal');
        el.messageTextArea = document.getElementById('message');

        const messageDialogElement = document.querySelector('[data-bind-comp="message-dialog-component"]');
        compMessageDialog = dataBind.init(messageDialogElement, viewModel);
        compMessageDialog.render().then((comp) => {
            const self = comp;
            compMessageDialog.subscribe('TRIGGER-MESSAGE-DIALOG', self.viewModel.onTriggerSelectedAds);

            // Bootstrap 5 modal events
            el.messageModal.addEventListener('shown.bs.modal', () => {
                el.messageTextArea.defaultValue = self.viewModel.defaultMessageText;
                el.messageTextArea.focus();
            });

            el.messageModal.addEventListener('hidden.bs.modal', () => {
                el.messageTextArea.defaultValue = self.viewModel.defaultMessageText;
                self.viewModel.sendingMessage = false;
            });
            // for debug only
            window.compMessageDialogViewModel = self.viewModel;
            window.compMessageDialog = compMessageDialog;
            console.log('compMessageDialog rendered', window.compMessageDialog);
        });
    });
})(window);
