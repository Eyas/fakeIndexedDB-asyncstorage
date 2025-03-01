// META: title=IDBObjectStore.get() - key is a number
// META: script=resources/support.js
// @author Microsoft <https://www.microsoft.com>

"use strict";

let db;
const t = async_test();
const record = { key: 3.14159265, property: "data" };

const open_rq = createdb(t);
open_rq.onupgradeneeded = (event) => {
    db = event.target.result;
    db.createObjectStore("store", { keyPath: "key" }).add(record);
};

open_rq.onsuccess = (event) => {
    const rq = db
        .transaction("store", "readonly", { durability: "relaxed" })
        .objectStore("store")
        .get(record.key);

    rq.onsuccess = t.step_func((event) => {
        assert_equals(event.target.result.key, record.key);
        assert_equals(event.target.result.property, record.property);
        t.done();
    });
};
