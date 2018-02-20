var dbMonApp,
    viewModel = {
        databases: ENV.generateData().toArray()
    },
    oldDbLength = viewModel.databases.length,
    newDbLength = 0;

function refreshApp() {
    var shouldUpdateTemplate = true;

    viewModel.databases = ENV.generateData().toArray();
    newDbLength = viewModel.databases.length;
    oldDbLength = newDbLength;
    shouldUpdateTemplate = (oldDbLength !== newDbLength);
    // only re-render template binding if database size different
    dbMonApp.render({ templateBinding: shouldUpdateTemplate });
    oldDbLength = newDbLength;

    Monitoring.renderRate.ping();
    setTimeout(refreshApp, ENV.timeout);
}

$(document).ready(function() {

    dbMonApp = dataBind.init($('#app'), viewModel);
    dbMonApp
        .render()
        .then(function() {
            console.log('dbMonApp inited');
            refreshApp();
        });
});