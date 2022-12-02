import { FDBCursor } from "./FDBCursor.js";
import FDBCursorWithValue from "./FDBCursorWithValue.js";
import FDBDatabase from "./FDBDatabase.js";
import FDBFactory from "./FDBFactory.js";
import FDBIndex from "./FDBIndex.js";
import FDBKeyRange from "./FDBKeyRange.js";
import FDBObjectStore from "./FDBObjectStore.js";
import FDBOpenDBRequest from "./FDBOpenDBRequest.js";
import FDBRequest from "./FDBRequest.js";
import FDBTransaction from "./FDBTransaction.js";
import FDBVersionChangeEvent from "./FDBVersionChangeEvent.js";

import { AsyncStorage } from "./lib/storage.js";

export function inject(storage: AsyncStorage) {
    // http://stackoverflow.com/a/33268326/786644 - works in browser, worker, and Node.js
    const globalVar =
        typeof window !== "undefined"
            ? window
            : typeof globalThis !== "undefined"
            ? globalThis
            : global;

    const fakeIndexedDB = new FDBFactory(storage);

    globalVar.indexedDB = fakeIndexedDB as any;
    globalVar.IDBCursor = FDBCursor as any;
    globalVar.IDBCursorWithValue = FDBCursorWithValue as any;
    globalVar.IDBDatabase = FDBDatabase as any;
    globalVar.IDBFactory = FDBFactory as any;
    globalVar.IDBIndex = FDBIndex as any;
    globalVar.IDBKeyRange = FDBKeyRange as any;
    globalVar.IDBObjectStore = FDBObjectStore as any;
    globalVar.IDBOpenDBRequest = FDBOpenDBRequest as any;
    globalVar.IDBRequest = FDBRequest as any;
    globalVar.IDBTransaction = FDBTransaction as any;
    globalVar.IDBVersionChangeEvent = FDBVersionChangeEvent as any;
}
