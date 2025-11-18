const performanceEnv = window.ENV;
const performanceMonitoring = window.Monitoring;

const viewModel = {
    databases: performanceEnv.generateData().toArray(),
};

// Manual mode for performance benchmark
const dbMonApp = dataBind.init(document.getElementById('app'), viewModel, {reactive: false});

function refreshApp() {
    viewModel.databases = performanceEnv.generateData().toArray();
    dbMonApp.render();

    performanceMonitoring.renderRate.ping();
    setTimeout(refreshApp, performanceEnv.timeout);
}

// render().then() works with both reactive and manual modes
// The callback runs after the initial render completes
dbMonApp.render().then(() => {
    console.log('dbMonApp (Manual) inited');
    refreshApp();
});
