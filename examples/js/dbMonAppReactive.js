const performanceEnv = window.ENV;
const performanceMonitoring = window.Monitoring;

const viewModel = {
    databases: performanceEnv.generateData().toArray(),
};

// Reactive mode is enabled by default (no need to specify {reactive: true})
// This demo uses automatic reactive rendering for all updates
const dbMonApp = dataBind.init(document.getElementById('app'), viewModel);

function refreshApp() {
    // Update via component.viewModel to trigger reactive updates
    dbMonApp.viewModel.databases = performanceEnv.generateData().toArray();

    // In reactive mode, render is triggered automatically
    // No need to call render() manually!

    performanceMonitoring.renderRate.ping();
    setTimeout(refreshApp, performanceEnv.timeout);
}

// render().then() works with both reactive and manual modes
// The callback runs after the initial render completes
dbMonApp.render().then(() => {
    console.log('dbMonApp (Reactive) inited');
    refreshApp();
});
