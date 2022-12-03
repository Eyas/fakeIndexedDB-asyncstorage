import FDBFactory from "../FDBFactory.js";

export function fake(): FDBFactory {
    const m = new Map();
    return new FDBFactory({
        getItem(key) {
            return new Promise((resolve, reject) => {
                setImmediate(() => {
                    const v = m.get(key);
                    const vv = v === undefined ? null : v;
                    resolve(vv);
                });
            });
        },
        setItem(key, value) {
            return new Promise((resolve, rjeect) => {
                setImmediate(() => {
                    m.set(key, value);
                    resolve();
                });
            });
        },
        removeItem(key) {
            return new Promise((resolve) => {
                setImmediate(() => {
                    m.delete(key);
                    resolve();
                });
            });
        },
    });
}
