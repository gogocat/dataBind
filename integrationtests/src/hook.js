// hook
module.exports = function hook({ After, AfterAll }) {
    this.After(function() {
        //return this.driver.quit();
        console.log('cucumber After hook');
        return;
    });

    // Asynchronous Promise
    this.AfterAll(function() {
        // perform some shared teardown
        console.log('cucumber After all hook');
        return Promise.resolve();
    });
};