import FDBFactory from "../FDBFactory.js";

export function fake(): FDBFactory {
    const m = new Map();
    return new FDBFactory({
        getItem(key) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const v = m.get(key);
                    const vv = v === undefined ? null : v;
                    resolve(vv);
                }, 2);
            });
        },
        setItem(key, value) {
            return new Promise((resolve, rjeect) => {
                setTimeout(() => {
                    m.set(key, value);
                    resolve();
                }, 2);
            });
        },
        removeItem(key) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    m.delete(key);
                    resolve();
                }, 2);
            });
        },
    });
}
