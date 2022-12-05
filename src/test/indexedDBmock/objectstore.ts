/**
 * Created by Kristof on 10/03/2015.
 */

import * as assert from "assert";
import {
    initionalSituation,
    dbName,
    objectStoreName,
    initionalSituationObjectStore,
    initionalSituation2ObjectStore,
    anOtherObjectStoreName,
} from "./helpers.js";

describe("ObjectStores", () => {
    it("Creating ObjectStore", (done) => {
        initionalSituation(
            () => {
                const request = indexedDB.open(dbName, 1);
                request.onsuccess = (e) => {
                    assert.equal(
                        Array.from(
                            (e.target as IDBOpenDBRequest).result
                                .objectStoreNames
                        ).includes(objectStoreName),
                        true,
                        "Object store should be present"
                    );
                    (e.target as IDBOpenDBRequest).result.close();
                    done();
                };
                request.onerror = () => {
                    assert.fail("Database error");
                };
                request.onupgradeneeded = (e) => {
                    if (e.type === "upgradeneeded") {
                        try {
                            const objectStore = (
                                e.target as IDBOpenDBRequest
                            ).transaction!.db.createObjectStore(
                                objectStoreName
                            );
                            assert.ok(true, "Object store created");
                            assert.equal(
                                objectStore.name,
                                objectStoreName,
                                objectStoreName
                            );
                        } catch (ex) {
                            assert.fail("Creating object store failed");
                        }
                    }
                };
            },
            done,
            assert
        );
    });
    it("Creating ObjectStore with options", (done) => {
        const keyPath = "Id";
        const autoIncrement = true;
        initionalSituation(
            () => {
                const request = indexedDB.open(dbName, 1);
                request.onsuccess = (e) => {
                    assert.equal(
                        Array.from(
                            (e.target as IDBOpenDBRequest).result
                                .objectStoreNames
                        ).includes(objectStoreName),
                        true,
                        "Object store should be present"
                    );
                    (e.target as IDBOpenDBRequest).result.close();
                    done();
                };
                request.onerror = () => {
                    assert.fail("Database error");
                };
                request.onupgradeneeded = (e) => {
                    if (e.type === "upgradeneeded") {
                        try {
                            const objectStore = (
                                e.target as IDBOpenDBRequest
                            ).transaction!.db.createObjectStore(
                                objectStoreName,
                                {
                                    keyPath,
                                    autoIncrement,
                                }
                            );
                            assert.ok(true, "Object store created");
                            assert.equal(
                                objectStore.name,
                                objectStoreName,
                                "Object store name"
                            );
                            assert.equal(
                                objectStore.keyPath,
                                keyPath,
                                "Object store keyPath"
                            );
                            if (objectStore.autoIncrement) {
                                assert.equal(
                                    objectStore.autoIncrement,
                                    autoIncrement,
                                    "Object store autoIncrement"
                                );
                            } else {
                                assert.ok(
                                    true,
                                    "IE implementation doesn't expose the autoIncrement field yet"
                                );
                            }
                        } catch (ex) {
                            assert.fail("Creating object store failed");
                        }
                    }
                };
            },
            done,
            assert
        );
    });
    it("Creating ObjectStore in readwrite transaction", (done) => {
        initionalSituationObjectStore(
            () => {
                const request = indexedDB.open(dbName, 1);
                request.onsuccess = (e) => {
                    try {
                        const transaction = (
                            e.target as IDBOpenDBRequest
                        ).result.transaction([objectStoreName], "readwrite");
                        try {
                            transaction.db.createObjectStore(objectStoreName);
                            assert.fail("Object store created");
                        } catch (ex) {
                            assert.equal(
                                ex.name,
                                "InvalidStateError",
                                "InvalidStateError"
                            );
                            (e.target as IDBOpenDBRequest).result.close();
                            done();
                        }

                        transaction.onabort = () => {
                            assert.fail("Transaction aborted");
                        };
                        transaction.onerror = () => {
                            assert.fail("Transaction error");
                        };
                    } catch (ex) {
                        assert.fail("Transaction error");
                    }
                };
                request.onerror = () => {
                    assert.fail("Database error");
                };
            },
            done,
            assert
        );
    });
    it("Creating ObjectStore with autoIncrement and array with empty string as keyPath", (done) => {
        initionalSituation(
            () => {
                const request = indexedDB.open(dbName, 1);
                request.onsuccess = (e) => {
                    assert.equal(
                        Array.from(
                            (e.target as IDBOpenDBRequest).result
                                .objectStoreNames
                        ).includes(objectStoreName),
                        false,
                        "Object store should not be present"
                    );
                    (e.target as IDBOpenDBRequest).result.close();
                    done();
                };
                request.onerror = () => {
                    done();
                };
                request.onupgradeneeded = (e) => {
                    if (e.type === "upgradeneeded") {
                        try {
                            (
                                e.target as IDBOpenDBRequest
                            ).transaction!.db.createObjectStore(
                                objectStoreName,
                                { keyPath: [""], autoIncrement: true }
                            );
                            assert.fail("Object store created");
                        } catch (ex) {
                            assert.equal(
                                ex.name,
                                "InvalidAccessError",
                                "InvalidAccessError"
                            );
                        }
                    }
                };
            },
            done,
            assert
        );
    });
    it("Opening ObjectStore", (done) => {
        initionalSituationObjectStore(
            () => {
                const request = indexedDB.open(dbName);
                request.onsuccess = (openEvt) => {
                    try {
                        const transaction = (
                            openEvt.target as IDBOpenDBRequest
                        ).result.transaction([objectStoreName]);
                        const objectstore =
                            transaction.objectStore(objectStoreName);

                        if (objectstore) {
                            assert.ok(true, "Object store open");
                        }

                        transaction.oncomplete = (e) => {
                            (e.target as IDBTransaction).db.close();
                            done();
                        };
                        transaction.onabort = () => {
                            assert.fail("Transaction aborted");
                        };
                        transaction.onerror = () => {
                            assert.fail("Transaction error");
                        };
                    } catch (ex) {
                        assert.fail("Transaction error");
                    }
                };
                request.onerror = () => {
                    assert.fail("Database error");
                };
            },
            done,
            assert
        );
    });
    it("Opening non existing ObjectStore", (done) => {
        initionalSituationObjectStore(
            () => {
                const request = indexedDB.open(dbName);
                request.onsuccess = (openEvt) => {
                    try {
                        const transaction = (
                            openEvt.target as IDBOpenDBRequest
                        ).result.transaction([objectStoreName]);
                        try {
                            const objectstore =
                                transaction.objectStore("anOtherObjectStore");

                            if (objectstore) {
                                assert.fail("Object store open");
                            }
                        } catch (ex) {
                            assert.equal(
                                ex.name,
                                "NotFoundError",
                                "NotFoundError"
                            );
                        }

                        transaction.oncomplete = (e) => {
                            (e.target as IDBTransaction).db.close();
                            done();
                        };
                        transaction.onabort = () => {
                            assert.fail("Transaction aborted");
                            (openEvt.target as IDBOpenDBRequest).result.close();
                            done();
                        };
                        transaction.onerror = () => {
                            assert.fail("Transaction error");
                            (openEvt.target as IDBOpenDBRequest).result.close();
                            done();
                        };
                    } catch (ex) {
                        assert.fail("Transaction error");
                        (openEvt.target as IDBOpenDBRequest).result.close();
                        done();
                    }
                };
                request.onerror = () => {
                    assert.fail("Database error");
                    done();
                };
            },
            done,
            assert
        );
    });
    it("Opening ObjectStore not in transaction scope", (done) => {
        initionalSituation2ObjectStore(
            () => {
                const request = indexedDB.open(dbName);
                request.onsuccess = (openEvt) => {
                    try {
                        const transaction = (
                            openEvt.target as IDBOpenDBRequest
                        ).result.transaction([objectStoreName]);
                        try {
                            const objectstore = transaction.objectStore(
                                anOtherObjectStoreName
                            );

                            if (objectstore) {
                                assert.fail("Object store open");
                            }
                        } catch (ex) {
                            assert.equal(
                                ex.name,
                                "NotFoundError",
                                "NotFoundError"
                            );
                        }

                        transaction.oncomplete = (e) => {
                            (e.target as IDBTransaction).db.close();
                            done();
                        };
                        transaction.onabort = () => {
                            assert.fail("Transaction aborted");
                            (openEvt.target as IDBOpenDBRequest).result.close();
                            done();
                        };
                        transaction.onerror = () => {
                            assert.fail("Transaction error");
                            (openEvt.target as IDBOpenDBRequest).result.close();
                            done();
                        };
                    } catch (ex) {
                        assert.fail("Transaction error");
                        (openEvt.target as IDBOpenDBRequest).result.close();
                        done();
                    }
                };
                request.onerror = () => {
                    assert.fail("Database error");
                    done();
                };
            },
            done,
            assert
        );
    });
    it("Deleting ObjectStore", (done) => {
        initionalSituationObjectStore(
            () => {
                // Delete database if existing
                const request = indexedDB.open(dbName, 2);
                request.onsuccess = (e) => {
                    assert.equal(
                        Array.from(
                            (e.target as IDBOpenDBRequest).result
                                .objectStoreNames
                        ).includes(objectStoreName),
                        false,
                        "Object store should not be present"
                    );
                    (e.target as IDBOpenDBRequest).result.close();
                    done();
                };
                request.onerror = () => {
                    assert.fail("Database error");
                    done();
                };
                request.onupgradeneeded = (e) => {
                    if (e.type === "upgradeneeded") {
                        try {
                            const objectStore = (
                                e.target as IDBOpenDBRequest
                            ).transaction!.db.deleteObjectStore(
                                objectStoreName
                            );
                            assert.ok(true, "Object store deleted");
                        } catch (ex) {
                            assert.fail("Deleting object store failed");
                        }
                    }
                };
            },
            done,
            assert
        );
    });
    it("Deleting Non existing objectStore", (done) => {
        initionalSituation(
            () => {
                // Delete database if existing
                const request = indexedDB.open(dbName, 2);
                request.onsuccess = (e) => {
                    assert.equal(
                        Array.from(
                            (e.target as IDBOpenDBRequest).result
                                .objectStoreNames
                        ).includes(objectStoreName),
                        false,
                        "Object store should not be present"
                    );
                    (e.target as IDBOpenDBRequest).result.close();
                    done();
                };
                request.onerror = () => {
                    assert.fail("Database error");
                    done();
                };
                request.onupgradeneeded = (e) => {
                    if (e.type === "upgradeneeded") {
                        try {
                            const objectStore = (
                                e.target as IDBOpenDBRequest
                            ).transaction!.db.deleteObjectStore(
                                objectStoreName
                            );
                            assert.fail("Object store deleted");
                        } catch (ex) {
                            assert.equal(
                                ex.name,
                                "NotFoundError",
                                "NotFoundError"
                            );
                        }
                    }
                };
            },
            done,
            assert
        );
    });
    it("Deleting ObjectStore in readwrite transaction", (done) => {
        initionalSituationObjectStore(
            () => {
                const request = indexedDB.open(dbName, 1);
                request.onsuccess = (e) => {
                    try {
                        const transaction = (
                            e.target as IDBOpenDBRequest
                        ).result.transaction([objectStoreName], "readwrite");
                        try {
                            transaction.db.deleteObjectStore(objectStoreName);
                            assert.fail("Object store created");
                        } catch (ex) {
                            assert.equal(
                                ex.name,
                                "InvalidStateError",
                                "InvalidStateError"
                            );
                            (e.target as IDBOpenDBRequest).result.close();
                            done();
                        }

                        transaction.onabort = () => {
                            assert.fail("Transaction aborted");
                        };
                        transaction.onerror = () => {
                            assert.fail("Transaction error");
                        };
                    } catch (ex) {
                        assert.fail("Transaction error");
                        (e.target as IDBOpenDBRequest).result.close();
                        done();
                    }
                };
                request.onerror = () => {
                    assert.fail("Database error");
                    done();
                };
            },
            done,
            assert
        );
    });
});
