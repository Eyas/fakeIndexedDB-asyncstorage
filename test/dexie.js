import { inject } from "../build/esm/inject.js";
import Dexie from "dexie";

const m = new Map();
const storage = {
    getItem: function (key) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const v = m.get(key);
                const vv = v === undefined ? null : v;
                resolve(vv);
            }, 2);
        });
    },
    setItem: function (key, value) {
        return new Promise((resolve, rjeect) => {
            setTimeout(() => {
                m.set(key, value);
                resolve();
            }, 2);
        });
    },
    removeItem: function (key) {
        return new Promise((resolve) => {
            setTimeout(() => {
                m.delete(key);
                resolve();
            }, 2);
        });
    },
};
inject(storage);
Dexie.dependencies.IDBKeyRange = IDBKeyRange;
Dexie.dependencies.indexedDB = indexedDB;

(async () => {
    try {
        const db = new Dexie("MyDatabase");

        db.version(1).stores({
            friends: "++id, name, age",
        });

        await db.friends.add({
            name: "Alice",
            age: 25,
            street: "East 13:th Street",
        });

        await db.friends.add({
            name: "Bob",
            age: 80,
            street: "East 13:th Street",
        });

        const oldFriends = await db.friends.where("age").above(75).toArray();
    } catch (e) {
        console.warn(e);
        throw e;
    }

    process.exit(0);
})();
