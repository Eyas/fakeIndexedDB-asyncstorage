/**
 * Created by Kristof on 10/03/2015.
 */

import * as assert from "assert";
import {
    dbName,
    indexProperty,
    initionalSituationIndex,
    initionalSituationObjectStore,
    objectStoreName,
} from "./helpers.js";

describe("Index", () => {
    it("Creating Index", (done) => {
        initionalSituationObjectStore(
            () => {
                const request = indexedDB.open(dbName, 2);
                request.onsuccess = (openEvt) => {
                    try {
                        const transaction = (
                            openEvt.target as IDBOpenDBRequest
                        ).result.transaction([objectStoreName]);
                        const objectstore =
                            transaction.objectStore(objectStoreName);

                        for (const store of Array.from(
                            objectstore.indexNames
                        )) {
                            if (store === indexProperty) {
                                assert.ok(true, "Index present");
                            }
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
                request.onupgradeneeded = (e) => {
                    if (e.type === "upgradeneeded") {
                        try {
                            const objectStore = (
                                e.target as IDBRequest
                            ).transaction!.objectStore(objectStoreName);
                            const index = objectStore.createIndex(
                                indexProperty,
                                indexProperty
                            );
                            assert.ok(true, "Index created");
                            assert.equal(
                                index.name,
                                indexProperty,
                                "index name"
                            );
                            assert.equal(
                                index.keyPath,
                                indexProperty,
                                "index keyPath"
                            );
                        } catch (ex) {
                            assert.fail("Creating index failed");
                        }
                    }
                };
            },
            done,
            assert
        );
    });
    it("Creating Index with options", (done) => {
        const unique = true;
        const multiEntry = true;
        initionalSituationObjectStore(
            () => {
                const request = indexedDB.open(dbName, 2);
                request.onsuccess = (openEvt) => {
                    try {
                        const transaction = (
                            openEvt.target as IDBOpenDBRequest
                        ).result.transaction([objectStoreName]);
                        const objectstore =
                            transaction.objectStore(objectStoreName);

                        for (const store of Array.from(
                            objectstore.indexNames
                        )) {
                            if (store === indexProperty) {
                                assert.ok(true, "Index present");
                            }
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
                request.onupgradeneeded = (e) => {
                    if (e.type === "upgradeneeded") {
                        try {
                            const objectStore = (
                                e.target as IDBRequest
                            ).transaction!.objectStore(objectStoreName);
                            const index = objectStore.createIndex(
                                indexProperty,
                                indexProperty,
                                {
                                    unique,
                                    multiEntry,
                                }
                            );
                            assert.ok(true, "Index created");
                            assert.equal(
                                index.name,
                                indexProperty,
                                "index name"
                            );
                            assert.equal(
                                index.keyPath,
                                indexProperty,
                                "index keyPath"
                            );
                            assert.equal(
                                index.unique,
                                unique,
                                "index unique attribute"
                            );
                            if (index.multiEntry) {
                                assert.equal(
                                    index.multiEntry,
                                    multiEntry,
                                    "index multiEntry attribute"
                                );
                            } else {
                                assert.ok(
                                    true,
                                    "IE doesn't implement multiEntry yet."
                                );
                            }
                        } catch (ex) {
                            assert.fail("Creating index failed");
                        }
                    }
                };
            },
            done,
            assert
        );
    });
    it("Opening Index", (done) => {
        initionalSituationIndex(
            () => {
                const request = indexedDB.open(dbName, 2);
                request.onsuccess = (openEvt) => {
                    try {
                        const transaction = (
                            openEvt.target as IDBOpenDBRequest
                        ).result.transaction([objectStoreName]);
                        const objectstore =
                            transaction.objectStore(objectStoreName);
                        const index = objectstore.index(indexProperty);

                        if (index) {
                            assert.ok(true, "Index open");
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
    it("Opening Index - non existing index", (done) => {
        const anotherIndex = "anotherIndex";
        initionalSituationIndex(
            () => {
                const request = indexedDB.open(dbName, 2);
                request.onsuccess = (e) => {
                    try {
                        const transaction = (
                            e.target as IDBOpenDBRequest
                        ).result.transaction([objectStoreName]);
                        const objectstore =
                            transaction.objectStore(objectStoreName);

                        try {
                            const index = objectstore.index(anotherIndex);
                            assert.fail("Index open");
                        } catch (ex) {
                            assert.ok(true, "Index error");
                        }

                        transaction.oncomplete = (txn) => {
                            (txn.target as IDBTransaction).db.close();
                            done();
                        };
                        transaction.onabort = () => {
                            (e.target as IDBTransaction).db.close();
                            done();
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
    it("Deleting Index", (done) => {
        initionalSituationIndex(
            () => {
                const request = indexedDB.open(dbName, 2);
                request.onsuccess = (openEvt) => {
                    try {
                        const transaction = (
                            openEvt.target as IDBOpenDBRequest
                        ).result.transaction([objectStoreName]);
                        const objectstore =
                            transaction.objectStore(objectStoreName);

                        for (const store of Array.from(
                            objectstore.indexNames
                        )) {
                            if (store === indexProperty) {
                                assert.fail("Index present");
                            }
                        }

                        transaction.oncomplete = (txn) => {
                            (txn.target as IDBTransaction).db.close();
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
                    done();
                };
                request.onupgradeneeded = (upgradeEvt) => {
                    if (upgradeEvt.type === "upgradeneeded") {
                        try {
                            const objectStore = (
                                upgradeEvt.target as IDBRequest
                            ).transaction!.objectStore(objectStoreName);
                            objectStore.deleteIndex(indexProperty);
                            assert.ok(true, "Index deleted");
                        } catch (ex) {
                            assert.fail("Creating index failed");
                        }
                    }
                };
            },
            done,
            assert
        );
    });
});
