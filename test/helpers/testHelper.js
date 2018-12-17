/*
 * overwrite requestAnimationFrame to use setTimout.
 * Otherewise sometime unpredictable in jasmine asyn test.
 * Since request animation frame callback run when browser decide it is free (we don't know exactly when)
 */
window.requestAnimationFrame = function(fn) {
    return window.setTimeout(fn, 15);
};
window.cancelAnimationFrame = function(id) {
    return window.clearTimeout(id);
};
