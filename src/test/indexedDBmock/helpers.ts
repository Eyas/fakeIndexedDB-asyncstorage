/** Originally by by Kristof on 17/02/2015. */

import type * as _assert from "assert";
type Assert = typeof _assert;

type CB = () => void;

import { inject } from "../../inject.js";

const m = new Map<string, string>();
inject({
    getItem(key) {
        return new Promise((resolve) => {
            setImmediate(() => {
                const v = m.get(key);
                const vv = v === undefined ? null : v;
                resolve(vv);
            });
        });
    },
    setItem(key, value) {
        return new Promise((resolve) => {
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

const w = globalThis as unknown as {
    indexedDBmock: IDBFactory;
    IDBKeyRangemock: typeof IDBKeyRange;
};
w.indexedDBmock = indexedDB;
w.IDBKeyRangemock = IDBKeyRange;

export const dbName = "TestDatabase";
export const objectStoreName = "objectStore";
export const anOtherObjectStoreName = "anOtherObjectStoreName";
export const indexProperty = "name";
export const indexPropertyMultiEntry = "multiEntry";
export const addData = {
    test: "addData",
    name: "name",
    id: 1,
    multiEntry: [1, "test", new Date()],
};
const addData2 = { test: "addData2", name: "name2", id: 2 };
const addData3 = { test: "addData3", name: "name3", id: 3 };
const addData4 = { test: "addData4", name: "name4", id: 4 };
export const addData5 = { test: "addData5", name: "name5", id: 5 };
export const addData6 = { test: "addData6", name: "name6", id: 6 };
const addData7 = { test: "addData7", name: "name7", id: 7 };
const addData8 = { test: "addData8", name: "name8", id: 8 };
const addData9 = { test: "addData9", name: "name9", id: 9 };
const addData10 = { test: "addData10", name: "name10", id: 10 };
export const msgCreatingInitialSituationFailed =
    "Creating initial situation failed";

export function initionalSituation(callBack: CB, done: CB, assert: Assert) {
    const request = indexedDB.deleteDatabase(dbName);

    request.onsuccess = () => {
        callBack();
    };
    request.onerror = (e) => {
        assert.fail(msgCreatingInitialSituationFailed);
    };
}
export function initionalSituationDatabase(
    callBack: CB,
    done: CB,
    assert: Assert
) {
    initionalSituation(
        () => {
            const request = indexedDB.open(dbName);
            request.onsuccess = (e) => {
                (e.target as IDBRequest).result.close();
                callBack();
            };
            request.onerror = () => {
                assert.fail(msgCreatingInitialSituationFailed);
            };
        },
        done,
        assert
    );
}
export function initionalSituationDatabaseVersion(
    callBack: CB,
    done: CB,
    assert: Assert
) {
    initionalSituation(
        () => {
            const request = indexedDB.open(dbName, 2);
            request.onsuccess = (e) => {
                (e.target as IDBRequest).result.close();
                callBack();
            };
            request.onerror = () => {
                assert.fail(msgCreatingInitialSituationFailed);
            };
        },
        done,
        assert
    );
}
export function initionalSituationObjectStore(
    callBack: CB,
    done: CB,
    assert: Assert
) {
    initionalSituation(
        () => {
            const request = indexedDB.open(dbName, 1);
            request.onsuccess = (e) => {
                (e.target as IDBRequest).result.close();
                callBack();
            };
            request.onerror = () => {
                assert.fail(msgCreatingInitialSituationFailed);
            };
            request.onupgradeneeded = (e) => {
                if (e.type === "upgradeneeded") {
                    try {
                        (
                            e.target as IDBRequest
                        ).transaction!.db.createObjectStore(objectStoreName);
                    } catch (ex) {
                        assert.fail(msgCreatingInitialSituationFailed);
                    }
                }
            };
        },
        done,
        assert
    );
}
export function initionalSituation2ObjectStore(
    callBack: CB,
    done: CB,
    assert: Assert
) {
    initionalSituation(
        () => {
            const request = indexedDB.open(dbName, 1);
            request.onsuccess = (e) => {
                (e.target as IDBRequest).result.close();
                callBack();
            };
            request.onerror = () => {
                assert.fail(msgCreatingInitialSituationFailed);
            };
            request.onupgradeneeded = (e) => {
                if (e.type === "upgradeneeded") {
                    try {
                        (
                            e.target as IDBRequest
                        ).transaction!.db.createObjectStore(objectStoreName);
                        (
                            e.target as IDBRequest
                        ).transaction!.db.createObjectStore(
                            anOtherObjectStoreName
                        );
                    } catch (ex) {
                        assert.fail(msgCreatingInitialSituationFailed);
                    }
                }
            };
        },
        done,
        assert
    );
}
export function initionalSituationObjectStoreNoAutoIncrement(
    callBack: CB,
    done: CB,
    assert: Assert
) {
    initionalSituation(
        () => {
            const request = indexedDB.open(dbName, 1);
            request.onsuccess = (e) => {
                (e.target as IDBRequest).result.close();
                callBack();
            };
            request.onerror = () => {
                assert.fail(msgCreatingInitialSituationFailed);
            };
            request.onupgradeneeded = (e) => {
                if (e.type === "upgradeneeded") {
                    try {
                        (
                            e.target as IDBRequest
                        ).transaction!.db.createObjectStore(objectStoreName, {
                            autoIncrement: false,
                        });
                    } catch (ex) {
                        assert.fail(msgCreatingInitialSituationFailed);
                    }
                }
            };
        },
        done,
        assert
    );
}
export function initionalSituationObjectStoreWithAutoIncrement(
    callBack: CB,
    done: CB,
    assert: Assert
) {
    initionalSituation(
        () => {
            const request = indexedDB.open(dbName, 1);
            request.onsuccess = (e) => {
                (e.target as IDBRequest).result.close();
                callBack();
            };
            request.onerror = () => {
                assert.fail(msgCreatingInitialSituationFailed);
            };
            request.onupgradeneeded = (e) => {
                if (e.type === "upgradeneeded") {
                    try {
                        (
                            e.target as IDBRequest
                        ).transaction!.db.createObjectStore(objectStoreName, {
                            autoIncrement: true,
                        });
                    } catch (ex) {
                        assert.fail(msgCreatingInitialSituationFailed);
                    }
                }
            };
        },
        done,
        assert
    );
}
export function initionalSituationObjectStoreWithKeyPathNoAutoIncrement(
    callBack: CB,
    done: CB,
    assert: Assert
) {
    initionalSituation(
        () => {
            const request = indexedDB.open(dbName, 1);
            request.onsuccess = (e) => {
                (e.target as IDBRequest).result.close();
                callBack();
            };
            request.onerror = () => {
                assert.fail(msgCreatingInitialSituationFailed);
            };
            request.onupgradeneeded = (e) => {
                if (e.type === "upgradeneeded") {
                    try {
                        (
                            e.target as IDBRequest
                        ).transaction!.db.createObjectStore(objectStoreName, {
                            keyPath: "id",
                            autoIncrement: false,
                        });
                    } catch (ex) {
                        assert.fail(msgCreatingInitialSituationFailed);
                    }
                }
            };
        },
        done,
        assert
    );
}
export function initionalSituationObjectStoreWithKeyPathAndAutoIncrement(
    callBack: CB,
    done: CB,
    assert: Assert
) {
    initionalSituation(
        () => {
            const request = indexedDB.open(dbName, 1);
            request.onsuccess = (e) => {
                (e.target as IDBRequest).result.close();
                callBack();
            };
            request.onerror = () => {
                assert.fail(msgCreatingInitialSituationFailed);
            };
            request.onupgradeneeded = (e) => {
                if (e.type === "upgradeneeded") {
                    try {
                        (
                            e.target as IDBRequest
                        ).transaction!.db.createObjectStore(objectStoreName, {
                            keyPath: "id",
                            autoIncrement: true,
                        });
                    } catch (ex) {
                        assert.fail(msgCreatingInitialSituationFailed);
                    }
                }
            };
        },
        done,
        assert
    );
}
export function initionalSituationObjectStoreNoAutoIncrementWithData(
    callBack: CB,
    done: CB,
    assert: Assert
) {
    initionalSituation(
        () => {
            const request = indexedDB.open(dbName, 1);
            request.onsuccess = (e) => {
                (e.target as IDBRequest).result.close();
                callBack();
            };
            request.onerror = () => {
                assert.fail(msgCreatingInitialSituationFailed);
            };
            request.onupgradeneeded = (e) => {
                if (e.type === "upgradeneeded") {
                    try {
                        const objectstore = (
                            e.target as IDBRequest
                        ).transaction!.db.createObjectStore(objectStoreName, {
                            autoIncrement: false,
                        });
                        objectstore.add(addData, addData.id);
                    } catch (ex) {
                        assert.fail(msgCreatingInitialSituationFailed);
                    }
                }
            };
        },
        done,
        assert
    );
}
export function initionalSituationObjectStoreWithKeyPathAndData(
    callBack: CB,
    done: CB,
    assert: Assert
) {
    initionalSituation(
        () => {
            const request = indexedDB.open(dbName, 1);
            request.onsuccess = (e) => {
                (e.target as IDBRequest).result.close();
                callBack();
            };
            request.onerror = () => {
                assert.fail(msgCreatingInitialSituationFailed);
            };
            request.onupgradeneeded = (e) => {
                if (e.type === "upgradeneeded") {
                    try {
                        const objectstore = (
                            e.target as IDBRequest
                        ).transaction!.db.createObjectStore(objectStoreName, {
                            autoIncrement: false,
                            keyPath: "id",
                        });
                        objectstore.add(addData);
                    } catch (ex) {
                        assert.fail(msgCreatingInitialSituationFailed);
                    }
                }
            };
        },
        done,
        assert
    );
}
export function initionalSituationObjectStoreWithKeyPathAndDataNoAutoIncrement(
    callBack: CB,
    done: CB,
    assert: Assert
) {
    initionalSituation(
        () => {
            const request = indexedDB.open(dbName, 1);
            request.onsuccess = (e) => {
                (e.target as IDBRequest).result.close();
                callBack();
            };
            request.onerror = () => {
                assert.fail(msgCreatingInitialSituationFailed);
            };
            request.onupgradeneeded = (e) => {
                if (e.type === "upgradeneeded") {
                    try {
                        const objectstore = (
                            e.target as IDBRequest
                        ).transaction!.db.createObjectStore(objectStoreName, {
                            keyPath: "id",
                            autoIncrement: false,
                        });
                        objectstore.add(addData);
                    } catch (ex) {
                        assert.fail(msgCreatingInitialSituationFailed);
                    }
                }
            };
        },
        done,
        assert
    );
}
export function initionalSituationObjectStoreWithKeyPathAndMultipleDataNoAutoIncrement(
    callBack: CB,
    done: CB,
    assert: Assert
) {
    initionalSituation(
        () => {
            const request = indexedDB.open(dbName, 1);
            request.onsuccess = (e) => {
                (e.target as IDBRequest).result.close();
                callBack();
            };
            request.onerror = () => {
                assert.fail(msgCreatingInitialSituationFailed);
            };
            request.onupgradeneeded = (e) => {
                if (e.type === "upgradeneeded") {
                    try {
                        const objectstore = (
                            e.target as IDBRequest
                        ).transaction!.db.createObjectStore(objectStoreName, {
                            keyPath: "id",
                            autoIncrement: false,
                        });
                        objectstore.add(addData);
                        objectstore.add(addData2);
                        objectstore.add(addData3);
                        objectstore.add(addData4);
                        objectstore.add(addData5);
                        objectstore.add(addData6);
                        objectstore.add(addData7);
                        objectstore.add(addData8);
                        objectstore.add(addData9);
                        objectstore.add(addData10);
                    } catch (ex) {
                        assert.fail(msgCreatingInitialSituationFailed);
                    }
                }
            };
        },
        done,
        assert
    );
}
export function initionalSituationIndex(
    callBack: CB,
    done: CB,
    assert: Assert
) {
    initionalSituation(
        () => {
            const request = indexedDB.open(dbName, 1);
            request.onsuccess = (e) => {
                (e.target as IDBRequest).result.close();
                callBack();
            };
            request.onerror = () => {
                assert.fail(msgCreatingInitialSituationFailed);
            };
            request.onupgradeneeded = (e) => {
                if (e.type === "upgradeneeded") {
                    try {
                        const objectstore = (
                            e.target as IDBRequest
                        ).transaction!.db.createObjectStore(objectStoreName);
                        objectstore.createIndex(indexProperty, indexProperty);
                    } catch (ex) {
                        assert.fail(msgCreatingInitialSituationFailed);
                    }
                }
            };
        },
        done,
        assert
    );
}
export function initionalSituationIndexUniqueIndexWithData(
    callBack: CB,
    done: CB,
    assert: Assert
) {
    initionalSituation(
        () => {
            const request = indexedDB.open(dbName, 1);
            request.onsuccess = (e) => {
                (e.target as IDBRequest).result.close();
                callBack();
            };
            request.onerror = () => {
                assert.fail(msgCreatingInitialSituationFailed);
            };
            request.onupgradeneeded = (e) => {
                if (e.type === "upgradeneeded") {
                    try {
                        const objectstore = (
                            e.target as IDBRequest
                        ).transaction!.db.createObjectStore(objectStoreName);
                        objectstore.createIndex(indexProperty, indexProperty, {
                            unique: true,
                        });
                        objectstore.add(addData, addData.id);
                    } catch (ex) {
                        assert.fail(msgCreatingInitialSituationFailed);
                    }
                }
            };
        },
        done,
        assert
    );
}
export function initionalSituationIndexUniqueMultiEntryIndexWithData(
    callBack: CB,
    done: CB,
    assert: Assert
) {
    initionalSituation(
        () => {
            const request = indexedDB.open(dbName, 1);
            request.onsuccess = (e) => {
                (e.target as IDBOpenDBRequest).result.close();
                callBack();
            };
            request.onerror = () => {
                assert.fail(msgCreatingInitialSituationFailed);
            };
            request.onupgradeneeded = (e) => {
                if (e.type === "upgradeneeded") {
                    try {
                        const objectstore = (
                            e.target as IDBRequest
                        ).transaction!.db.createObjectStore(objectStoreName);
                        objectstore.createIndex(
                            indexPropertyMultiEntry,
                            indexPropertyMultiEntry,
                            { unique: true, multiEntry: true }
                        );
                        objectstore.add(addData, addData.id);
                    } catch (ex) {
                        assert.fail(msgCreatingInitialSituationFailed);
                    }
                }
            };
        },
        done,
        assert
    );
}

export function getParameterByName(name: string) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    const regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    const results = regex.exec(location.search);
    return results === null
        ? ""
        : decodeURIComponent(results[1].replace(/\+/g, " "));
}
