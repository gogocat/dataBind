// https://yiochen.github.io/blog/post/weakmap-event-system/
// usage:
// attach listener to button
// eventSystem.on(button, 'click', clickHandler);
// eventSystem.trigger(button, 'click');

const eventSystem = {
    wm: new WeakMap(),
    on(target, event, listener) {
        let listeners = this.wm.get(target);
        if (listeners === undefined) {
            listeners = {};
        }
        let listenersForEvent = listeners[event];
        if (listenersForEvent === undefined) {
            listenersForEvent = new Set();
        }
        listenersForEvent.add(listener);
        listeners[event] = listenersForEvent;
        this.wm.add(target, listeners);
    },

    off(target, event, listener) {
        let listeners = this.wm.get(target);
        if (!listeners) return;
        let listenersForEvent = listeners[event];
        if (!listenersForEvent) return;
        listenersForEvent.delete(handler);
    },

    trigger(target, event) {
        let listeners = this.wm.get(target);
        if (!listeners) return;
        let listenersForEvent = listeners[event];
        if (!listenersForEvent) return;
        // TODO: check what is listenersForEvent
        // handlers should be  listeners or listenersForEvent
        for (let handler of handlers) {
            // we use a setTimeout here because we want event triggering to be asynchronous.
            // setTimeout(handler, 0, event, target);
            handler(event, target);
        }
    },
};

export default eventSystem;
