export declare const subscribeEvent: (instance: unknown, eventName: string, fn: Function, isOnce?: boolean) => void;
export declare const subscribeEventOnce: (instance: unknown, eventName: string, fn: Function) => void;
export declare const unsubscribeEvent: (compId?: string | number, eventName?: string) => void;
/**
 * unsubscribeAllEvent
 * @description unsubscribe all event by compId. eg when a component removed
 * @param {string} compId
 */
export declare const unsubscribeAllEvent: (compId?: string | number) => void;
export declare const publishEvent: (eventName?: string, ...args: unknown[]) => void;
//# sourceMappingURL=pubSub.d.ts.map