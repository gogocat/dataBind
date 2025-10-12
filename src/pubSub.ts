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

interface Subscriber {
    [compId: string]: Function | boolean | undefined;
    isOnce?: boolean;
}

interface Events {
    [eventName: string]: Subscriber[];
}

const EVENTS: Events = {};

export const subscribeEvent = (instance: any = null, eventName: string = '', fn: Function, isOnce: boolean = false): void => {
    if (!instance || !instance.compId || !eventName || typeof fn !== 'function') {
        return;
    }

    let subscriber: Subscriber;
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
        return false;
    });
    // push if not yet subscribe
    if (!isSubscribed) {
        subscriber = {};
        subscriber[instance.compId] = fn.bind(instance.viewModel);
        subscriber.isOnce = isOnce;
        EVENTS[eventName].push(subscriber);
    }
};

export const subscribeEventOnce = (instance: any = null, eventName: string = '', fn: Function): void => {
    subscribeEvent(instance, eventName, fn, true);
};

export const unsubscribeEvent = (compId: string | number = '', eventName: string = ''): void => {
    if (!compId || !eventName) {
        return;
    }

    let i = 0;
    let subscribersLength = 0;
    let subscriber: Subscriber;

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
    if (EVENTS[eventName] && !EVENTS[eventName].length) {
        delete EVENTS[eventName];
    }
};

/**
 * unsubscribeAllEvent
 * @description unsubscribe all event by compId. eg when a component removed
 * @param {string} compId
 */
export const unsubscribeAllEvent = (compId: string | number = ''): void => {
    if (!compId) {
        return;
    }
    Object.keys(EVENTS).forEach((eventName) => {
        unsubscribeEvent(compId, eventName);
    });
};

export const publishEvent = (eventName: string = '', ...args: any[]): void => {
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
