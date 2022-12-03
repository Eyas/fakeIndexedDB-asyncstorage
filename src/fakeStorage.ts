import { AsyncStorage } from "./lib/storage";

const m = new Map();
export const storage: AsyncStorage = {
    getItem: function (key) {
        return new Promise((resolve, reject) => {
            setImmediate(() => {
                const v = m.get(key);
                const vv = v === undefined ? null : v;
                resolve(vv);
            });
        });
    },
    setItem: function (key, value) {
        return new Promise((resolve, reject) => {
            setImmediate(() => {
                m.set(key, value);
                resolve();
            });
        });
    },
    removeItem: function (key) {
        return new Promise((resolve) => {
            setImmediate(() => {
                m.delete(key);
                resolve();
            });
        });
    },
};
