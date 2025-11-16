const viewModel = {
    databases: ENV.generateData().toArray(),
};
let oldDbLength = viewModel.databases.length;
let newDbLength = 0;

function refreshApp() {
    let shouldUpdateTemplate = true;

    viewModel.databases = ENV.generateData().toArray();
    newDbLength = viewModel.databases.length;
    shouldUpdateTemplate = oldDbLength !== newDbLength;
    // only re-render template binding if database size different
    dbMonApp.render({templateBinding: shouldUpdateTemplate});
    oldDbLength = newDbLength;

    Monitoring.renderRate.ping();
    setTimeout(refreshApp, ENV.timeout);
}


const dbMonApp = dataBind.init(document.getElementById('app'), viewModel);
dbMonApp.render().then(() => {
    console.log('dbMonApp inited');
    refreshApp();
});
