import * as util from './util';

/**
 *  pubSub
 * @description use jQuery object as pubSub
 * @example EVENTS object strucure:
 *  EVENTS = {
        'EVENT-NAME': [{ 'comp-id': fn }],
        'EVENT-NAME2': [{ 'comp-id': fn }]
    };
 */

const EVENTS = {};

const subscribeEvent = (instance = null, eventName = '', fn, isOnce = false) => {
    if (!instance || !instance.compId || !eventName || typeof fn !== 'function') {
        return;
    }

    let subscriber;
    let isSubscribed = false;

    eventName = eventName.replace(util.REGEX.WHITE_SPACES, '');
    EVENTS[eventName] = EVENTS[eventName] || [];
    // check if already subscribed and update callback fn
    isSubscribed = EVENTS[eventName].some((subscriber) => {
        if (subscriber[instance.compId]) {
            subscriber[instance.compId] = fn.bind(instance.viewModel);
            subscriber.isOnce = isOnce;
            return true;
        }
    });
    // push if not yet subscribe
    if (!isSubscribed) {
        subscriber = {};
        subscriber[instance.compId] = fn.bind(instance.viewModel);
        subscriber.isOnce = isOnce;
        EVENTS[eventName].push(subscriber);
    }
};

const subscribeEventOnce = (instance = null, eventName = '', fn) => {
    subscribeEvent(instance, eventName, fn, true);
};

const unsubscribeEvent = (compId = '', eventName = '') => {
    if (!compId || !eventName) {
        return;
    }

    let i = 0;
    let subscribersLength = 0;
    let subscriber;

    eventName = eventName.replace(util.REGEX.WHITE_SPACES, '');

    if (EVENTS[eventName]) {
        subscribersLength = EVENTS[eventName].length;
        for (i = 0; i < subscribersLength; i += 1) {
            subscriber = EVENTS[eventName][i];
            if (subscriber[compId]) {
                EVENTS[eventName].splice(i, 1);
                break;
            }
        }
    }
    // delete the event if no more subscriber
    if (!EVENTS[eventName].length) {
        delete EVENTS[eventName];
    }
};

/**
 * unsubscribeAllEvent
 * @description unsubscribe all event by compId. eg when a component removed
 * @param {string} compId
 */
const unsubscribeAllEvent = (compId = '') => {
    if (!compId) {
        return;
    }
    Object.keys(EVENTS).forEach((eventName) => {
        unsubscribeEvent(compId, eventName);
    });
};

const publishEvent = (eventName = '', ...args) => {
    if (!eventName || !EVENTS[eventName]) {
        return;
    }

    eventName = eventName.replace(util.REGEX.WHITE_SPACES, '');

    EVENTS[eventName].forEach((subscriber) => {
        Object.keys(subscriber).forEach((compId) => {
            if (typeof subscriber[compId] === 'function') {
                const ret = subscriber[compId](...args);
                if (subscriber.isOnce) {
                    unsubscribeEvent(compId, eventName);
                }
                return ret;
            }
        });
    });
};

export {subscribeEvent, subscribeEventOnce, unsubscribeEvent, unsubscribeAllEvent, publishEvent};
