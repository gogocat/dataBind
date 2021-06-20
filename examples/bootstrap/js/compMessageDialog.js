// databing message-dialog-component

(function($, window) {
    let compMessageDialog;
    const el = {
        messageModal: '#message-modal',
        messageTextArea: '#message',
    };
    const viewModel = {
        numSelectedProviders: '',
        selectedAdData: [],
        adIds: [],
        selectedProviders: '',
        defaultMessageText: 'Hi,\nCould you please provide a quote for the following work:\n',
        sendingMessage: false,
        onMessageSubmit: function(e, $el, formData) {
            e.preventDefault();
            formData.ids = this.adIds;
            this.sendingMessage = true;
            this.updateStatus();
            console.log('post data: ', formData);
        },
        onTriggerSelectedAds: function(selectedAdData) {
            this.selectedAdData = selectedAdData;
            this.numSelectedProviders = selectedAdData.length > 1 ? selectedAdData.length : '';
            this.selectedProviders = selectedAdData.length > 1 ? 'advertisers ID: ' : 'advertiser ID:';
            this.adIds = selectedAdData.map(function(item, index) {
                return item.id;
            });
            this.selectedProviders += this.adIds.toString();
            this.updateStatus();
        },
        updateStatus: function() {
            compMessageDialog.render();
        },
    };

    $(document).ready(function() {
        $.each(el, function(k, v) {
            el[k] = $(v);
        });

        compMessageDialog = dataBind.init($('[data-jq-comp="message-dialog-component"]')[0], viewModel);
        compMessageDialog.render().then(function(comp) {
            const self = comp;
            compMessageDialog.subscribe('TRIGGER-MESSAGE-DIALOG', self.viewModel.onTriggerSelectedAds);

            el.messageModal.on('shown.bs.modal', function() {
                el.messageTextArea[0].defaultValue = self.viewModel.defaultMessageText;
                el.messageTextArea.focus();
            });

            el.messageModal.on('hidden.bs.modal', function() {
                el.messageTextArea[0].defaultValue = self.viewModel.defaultMessageText;
                self.viewModel.sendingMessage = false;
            });
            // for debug only
            window.compMessageDialogViewModel = self.viewModel;
            window.compMessageDialog = compMessageDialog;
            console.log('compMessageDialog rendered', window.compMessageDialog);
        });
    });
})(jQuery, window);
