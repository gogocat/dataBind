(($) => {
    if (!$) {
        return;
    }
    if (!window['Promise']) {
        window['Promise'] = class {
            constructor(executor) {
                this.then = this.then.bind(this);
                this.catch = this.catch.bind(this);
                this.deferred = $.Deferred();
                executor(this.deferred.resolve, this.deferred.reject);
            }

            then(fulfilled, rejected) {
                return this.deferred.then(fulfilled, rejected);
            }

            catch(rejected) {
                return this.then(undefined, rejected);
            }

            static race(promises) {
                let promise;
                let settled = false;
                const winner = $.Deferred();

                const settle = function(settler, value) {
                    if (!settled) {
                        settled = true;
                        winner[settler](value);
                    }
                    return undefined;
                };

                const fulfilled = settle.apply(this, 'resolve');
                const rejected = settle.apply(this, 'reject');

                for (promise of Array.from(promises)) {
                    promise.then(fulfilled, rejected);
                }

                return winner.promise();
            }

            static all(promises) {
                // Pass an additional resolved deferred to $.when so $.when will
                // not return the given deferred if only one deferred is passed.
                return $.when(this.resolve(), ...Array.from(promises));
            }

            static reject(value) {
                const deferred = $.Deferred();
                deferred.reject(value);
                return deferred.promise();
            }

            static resolve(value) {
                const deferred = $.Deferred();
                deferred.resolve(value);
                return deferred.promise();
            }
        };
    }
})(window.jQuery);
