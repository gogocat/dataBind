import {describe, it, expect, beforeEach, vi} from 'vitest';
import {createReactiveProxy, createReactiveArray, toRaw, isProxySupported} from '../../src/reactiveProxy';

describe('Reactive Proxy', () => {
    describe('isProxySupported', () => {
        it('should return true in modern browsers', () => {
            expect(isProxySupported()).toBe(true);
        });
    });

    describe('createReactiveProxy', () => {
        it('should trigger onChange when property is set', () => {
            const onChange = vi.fn();
            const target = {name: 'John', age: 30};
            const proxy = createReactiveProxy(target, {onChange});

            proxy.name = 'Jane';

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(proxy.name).toBe('Jane');
        });

        it('should not trigger onChange when property value is unchanged', () => {
            const onChange = vi.fn();
            const target = {name: 'John'};
            const proxy = createReactiveProxy(target, {onChange});

            proxy.name = 'John'; // Same value

            expect(onChange).not.toHaveBeenCalled();
        });

        it('should trigger onChange when nested object property is set', () => {
            const onChange = vi.fn();
            const target = {
                user: {
                    profile: {
                        name: 'John',
                    },
                },
            };
            const proxy = createReactiveProxy(target, {onChange, deep: true});

            proxy.user.profile.name = 'Jane';

            expect(onChange).toHaveBeenCalled();
            expect(proxy.user.profile.name).toBe('Jane');
        });

        it('should trigger onChange when property is deleted', () => {
            const onChange = vi.fn();
            const target = {name: 'John', age: 30};
            const proxy = createReactiveProxy(target, {onChange}) as any;

            delete proxy.age;

            expect(onChange).toHaveBeenCalled();
            expect(proxy.age).toBeUndefined();
        });

        it('should not re-proxy already proxied objects', () => {
            const onChange = vi.fn();
            const target = {name: 'John'};
            const proxy1 = createReactiveProxy(target, {onChange});
            const proxy2 = createReactiveProxy(proxy1, {onChange});

            expect(proxy1).toBe(proxy2);
        });

        it('should skip proxying special properties', () => {
            const onChange = vi.fn();
            const target = {
                name: 'John',
                APP: {test: 'data'},
                $root: {test: 'data'},
            };
            const proxy = createReactiveProxy(target, {onChange, deep: true});

            // These should not trigger onChange
            proxy.APP = {test: 'new'};
            proxy.$root = {test: 'new'};

            expect(onChange).toHaveBeenCalledTimes(2);
        });

        it('should work with trackChanges option', () => {
            const onChange = vi.fn();
            const target = {name: 'John', age: 30};
            const proxy = createReactiveProxy(target, {onChange, trackChanges: true});

            proxy.name = 'Jane';
            proxy.age = 25;

            expect(onChange).toHaveBeenCalledTimes(2);
        });

        it('should not proxy non-objects', () => {
            const onChange = vi.fn();
            const target = null as any;
            const proxy = createReactiveProxy(target, {onChange});

            expect(proxy).toBe(null);
        });

        it('should cache nested proxies', () => {
            const onChange = vi.fn();
            const target = {
                nested: {value: 1},
            };
            const proxy = createReactiveProxy(target, {onChange, deep: true});

            const nested1 = proxy.nested;
            const nested2 = proxy.nested;

            expect(nested1).toBe(nested2); // Same proxy instance
        });

        it('should clear cached proxy when property changes', () => {
            const onChange = vi.fn();
            const target = {
                nested: {value: 1},
            };
            const proxy = createReactiveProxy(target, {onChange, deep: true});

            const nested1 = proxy.nested;
            proxy.nested = {value: 2};
            const nested2 = proxy.nested;

            expect(nested1).not.toBe(nested2); // Different proxy instance
        });
    });

    describe('createReactiveArray', () => {
        it('should trigger onChange when array element is set', () => {
            const onChange = vi.fn();
            const target = [1, 2, 3];
            const proxy = createReactiveArray(target, onChange, {onChange});

            proxy[0] = 99;

            expect(onChange).toHaveBeenCalled();
            expect(proxy[0]).toBe(99);
        });

        it('should not trigger onChange when element value is unchanged', () => {
            const onChange = vi.fn();
            const target = [1, 2, 3];
            const proxy = createReactiveArray(target, onChange, {onChange});

            proxy[0] = 1; // Same value

            expect(onChange).not.toHaveBeenCalled();
        });

        it('should trigger onChange on push', () => {
            const onChange = vi.fn();
            const target = [1, 2, 3];
            const proxy = createReactiveArray(target, onChange, {onChange});

            proxy.push(4);

            expect(onChange).toHaveBeenCalled();
            expect(proxy.length).toBe(4);
            expect(proxy[3]).toBe(4);
        });

        it('should trigger onChange on pop', () => {
            const onChange = vi.fn();
            const target = [1, 2, 3];
            const proxy = createReactiveArray(target, onChange, {onChange});

            const popped = proxy.pop();

            expect(onChange).toHaveBeenCalled();
            expect(popped).toBe(3);
            expect(proxy.length).toBe(2);
        });

        it('should trigger onChange on shift', () => {
            const onChange = vi.fn();
            const target = [1, 2, 3];
            const proxy = createReactiveArray(target, onChange, {onChange});

            const shifted = proxy.shift();

            expect(onChange).toHaveBeenCalled();
            expect(shifted).toBe(1);
            expect(proxy.length).toBe(2);
        });

        it('should trigger onChange on unshift', () => {
            const onChange = vi.fn();
            const target = [1, 2, 3];
            const proxy = createReactiveArray(target, onChange, {onChange});

            proxy.unshift(0);

            expect(onChange).toHaveBeenCalled();
            expect(proxy.length).toBe(4);
            expect(proxy[0]).toBe(0);
        });

        it('should trigger onChange on splice', () => {
            const onChange = vi.fn();
            const target = [1, 2, 3];
            const proxy = createReactiveArray(target, onChange, {onChange});

            proxy.splice(1, 1, 99);

            expect(onChange).toHaveBeenCalled();
            expect(proxy.length).toBe(3);
            expect(proxy[1]).toBe(99);
        });

        it('should trigger onChange on sort', () => {
            const onChange = vi.fn();
            const target = [3, 1, 2];
            const proxy = createReactiveArray(target, onChange, {onChange});

            proxy.sort();

            expect(onChange).toHaveBeenCalled();
            expect(proxy[0]).toBe(1);
        });

        it('should trigger onChange on reverse', () => {
            const onChange = vi.fn();
            const target = [1, 2, 3];
            const proxy = createReactiveArray(target, onChange, {onChange});

            proxy.reverse();

            expect(onChange).toHaveBeenCalled();
            expect(proxy[0]).toBe(3);
        });

        it('should trigger onChange on fill', () => {
            const onChange = vi.fn();
            const target = [1, 2, 3];
            const proxy = createReactiveArray(target, onChange, {onChange});

            proxy.fill(0);

            expect(onChange).toHaveBeenCalled();
            expect(proxy[0]).toBe(0);
        });

        it('should work with array of objects', () => {
            const onChange = vi.fn();
            const target = [{text: 'Task 1', done: false}];
            const proxy = createReactiveArray(target, onChange, {onChange, deep: true});

            proxy[0].done = true;

            expect(onChange).toHaveBeenCalled();
            expect(proxy[0].done).toBe(true);
        });

        it('should work with nested arrays', () => {
            const onChange = vi.fn();
            const target = [[1, 2], [3, 4]];
            const proxy = createReactiveArray(target, onChange, {onChange, deep: true});

            (proxy[0] as number[]).push(99);

            expect(onChange).toHaveBeenCalled();
            expect((proxy[0] as number[]).length).toBe(3);
        });

        it('should not re-proxy already proxied arrays', () => {
            const onChange = vi.fn();
            const target = [1, 2, 3];
            const proxy1 = createReactiveArray(target, onChange, {onChange});
            const proxy2 = createReactiveArray(proxy1, onChange, {onChange});

            expect(proxy1).toBe(proxy2);
        });

        it('should trigger onChange when array element is deleted', () => {
            const onChange = vi.fn();
            const target = [1, 2, 3];
            const proxy = createReactiveArray(target, onChange, {onChange}) as any;

            delete proxy[1];

            expect(onChange).toHaveBeenCalled();
            expect(proxy[1]).toBeUndefined();
        });
    });

    describe('toRaw', () => {
        it('should return original object from proxy', () => {
            const onChange = vi.fn();
            const target = {name: 'John'};
            const proxy = createReactiveProxy(target, {onChange});

            const raw = toRaw(proxy);

            expect(raw).toBe(target);
        });

        it('should return same object if not a proxy', () => {
            const target = {name: 'John'};
            const raw = toRaw(target);

            expect(raw).toBe(target);
        });

        it('should return original array from array proxy', () => {
            const onChange = vi.fn();
            const target = [1, 2, 3];
            const proxy = createReactiveArray(target, onChange, {onChange});

            const raw = toRaw(proxy);

            expect(raw).toBe(target);
        });
    });

    describe('Deep reactivity integration', () => {
        it('should handle complex nested structure', () => {
            const onChange = vi.fn();
            const target = {
                user: {
                    profile: {
                        name: 'John',
                        address: {
                            city: 'New York',
                        },
                    },
                    todos: [
                        {text: 'Task 1', done: false},
                        {text: 'Task 2', done: false},
                    ],
                },
            };
            const proxy = createReactiveProxy(target, {onChange, deep: true});

            // Test deep object modification
            proxy.user.profile.address.city = 'London';
            expect(onChange).toHaveBeenCalled();
            expect(proxy.user.profile.address.city).toBe('London');

            onChange.mockClear();

            // Test array modification
            proxy.user.todos.push({text: 'Task 3', done: false});
            expect(onChange).toHaveBeenCalled();
            expect(proxy.user.todos.length).toBe(3);

            onChange.mockClear();

            // Test array element property modification
            proxy.user.todos[0].done = true;
            expect(onChange).toHaveBeenCalled();
            expect(proxy.user.todos[0].done).toBe(true);
        });

        it('should work with multiple changes in sequence', () => {
            const onChange = vi.fn();
            const target = {
                name: 'John',
                age: 30,
                items: [1, 2, 3],
            };
            const proxy = createReactiveProxy(target, {onChange, deep: true});

            // Test each change individually
            onChange.mockClear();
            proxy.name = 'Jane';
            expect(onChange).toHaveBeenCalled();
            expect(proxy.name).toBe('Jane');

            onChange.mockClear();
            proxy.age = 25;
            expect(onChange).toHaveBeenCalled();
            expect(proxy.age).toBe(25);

            onChange.mockClear();
            proxy.items.push(4);
            expect(onChange).toHaveBeenCalled();
            expect(proxy.items.length).toBe(4);

            onChange.mockClear();
            proxy.items[0] = 99;
            expect(onChange).toHaveBeenCalled();
            expect(proxy.items[0]).toBe(99);
        });

        it('should handle circular references gracefully', () => {
            const onChange = vi.fn();
            const target: any = {
                name: 'John',
            };
            target.self = target; // Circular reference

            // Should not throw
            expect(() => {
                createReactiveProxy(target, {onChange, deep: true});
            }).not.toThrow();
        });
    });

    describe('Edge cases', () => {
        it('should handle functions in viewModel', () => {
            const onChange = vi.fn();
            const target = {
                name: 'John',
                greet() {
                    return `Hello, ${this.name}`;
                },
            };
            const proxy = createReactiveProxy(target, {onChange});

            expect(proxy.greet()).toBe('Hello, John');
            expect(onChange).not.toHaveBeenCalled(); // Function access shouldn't trigger onChange
        });

        it('should handle getters in viewModel', () => {
            const onChange = vi.fn();
            const target = {
                firstName: 'John',
                lastName: 'Doe',
                get fullName() {
                    return `${this.firstName} ${this.lastName}`;
                },
            };
            const proxy = createReactiveProxy(target, {onChange});

            expect(proxy.fullName).toBe('John Doe');

            proxy.firstName = 'Jane';
            expect(onChange).toHaveBeenCalled();
            expect(proxy.fullName).toBe('Jane Doe');
        });

        it('should handle symbols', () => {
            const onChange = vi.fn();
            const sym = Symbol('test');
            const target = {
                name: 'John',
                [sym]: 'symbol value',
            };
            const proxy = createReactiveProxy(target, {onChange}) as any;

            expect(proxy[sym]).toBe('symbol value');
            expect(onChange).not.toHaveBeenCalled();
        });

        it('should handle null and undefined values', () => {
            const onChange = vi.fn();
            const target = {
                nullValue: null as any,
                undefinedValue: undefined as any,
            };
            const proxy = createReactiveProxy(target, {onChange});

            proxy.nullValue = null;
            expect(onChange).not.toHaveBeenCalled(); // Same value

            proxy.undefinedValue = 'value';
            expect(onChange).toHaveBeenCalled();
        });
    });
});
