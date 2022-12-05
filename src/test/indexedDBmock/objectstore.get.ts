/**
 * Created by Kristof on 29/03/2015.
 */

import * as assert from "assert";
import {
    initionalSituationObjectStoreNoAutoIncrement,
    dbName,
    objectStoreName,
    initionalSituationObjectStoreNoAutoIncrementWithData,
    addData,
    initionalSituationObjectStoreWithKeyPathAndData,
    initionalSituationObjectStoreWithKeyPathAndMultipleDataNoAutoIncrement,
    addData5,
    addData6,
} from "./helpers.js";

describe("ObjectStore.get", () => {
    it("Retrieving data - no data present for key", (done) => {
        const key = 1;

        initionalSituationObjectStoreNoAutoIncrement(
            () => {
                const request = indexedDB.open(dbName);
                request.onsuccess = (openEvt) => {
                    try {
                        const transaction = (
                            openEvt.target as IDBOpenDBRequest
                        ).result.transaction([objectStoreName], "readwrite");
                        const objectstore =
                            transaction.objectStore(objectStoreName);

                        try {
                            const getRequest = objectstore.get(key);
                            getRequest.onsuccess = (get) => {
                                assert.equal(
                                    (get.target as IDBRequest).result,
                                    undefined,
                                    "Data undefined"
                                );
                            };
                            getRequest.onerror = () => {
                                assert.fail("Get error");
                            };
                        } catch (ex) {
                            assert.fail("Get error");
                        }

                        transaction.oncomplete = (e) => {
                            (e.target as IDBTransaction).db.close();
                            done();
                        };
                        transaction.onabort = (err) => {
                            assert.equal(
                                (err as ErrorEvent).error.name,
                                "AbortError",
                                "AbortError"
                            );
                            (openEvt.target as IDBTransaction).db.close();
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
    it("Retrieving data - external key", (done) => {
        initionalSituationObjectStoreNoAutoIncrementWithData(
            () => {
                const request = indexedDB.open(dbName);
                request.onsuccess = (openEvt) => {
                    try {
                        const transaction = (
                            openEvt.target as IDBOpenDBRequest
                        ).result.transaction([objectStoreName], "readwrite");
                        const objectstore =
                            transaction.objectStore(objectStoreName);

                        try {
                            const getRequest = objectstore.get(addData.id);
                            getRequest.onsuccess = (e) => {
                                assert.deepEqual(
                                    (e.target as IDBRequest).result,
                                    addData,
                                    "Data undefined"
                                );
                            };
                            getRequest.onerror = (e) => {
                                assert.fail("Get error");
                            };
                        } catch (ex) {
                            assert.fail("Get error");
                        }

                        transaction.oncomplete = (e) => {
                            (e.target as IDBTransaction).db.close();
                            done();
                        };
                        transaction.onabort = (err) => {
                            assert.equal(
                                (err as ErrorEvent).error.name,
                                "AbortError",
                                "AbortError"
                            );
                            (openEvt.target as IDBTransaction).db.close();
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
    it("Retrieving data - internal key", (done) => {
        initionalSituationObjectStoreWithKeyPathAndData(
            () => {
                const request = indexedDB.open(dbName);
                request.onsuccess = (openEvt) => {
                    try {
                        const transaction = (
                            openEvt.target as IDBOpenDBRequest
                        ).result.transaction([objectStoreName], "readwrite");
                        const objectstore =
                            transaction.objectStore(objectStoreName);

                        try {
                            const getRequest = objectstore.get(addData.id);
                            getRequest.onsuccess = (e) => {
                                assert.deepEqual(
                                    (e.target as IDBRequest).result,
                                    addData,
                                    "Data undefined"
                                );
                            };
                            getRequest.onerror = (e) => {
                                assert.fail("Get error");
                            };
                        } catch (ex) {
                            assert.fail("Get error");
                        }

                        transaction.oncomplete = (e) => {
                            (e.target as IDBTransaction).db.close();
                            done();
                        };
                        transaction.onabort = (err) => {
                            assert.equal(
                                (err as ErrorEvent).error.name,
                                "AbortError",
                                "AbortError"
                            );
                            (openEvt.target as IDBTransaction).db.close();
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
    it("Retrieving data - key range lowerBound exclusieve", (done) => {
        initionalSituationObjectStoreWithKeyPathAndMultipleDataNoAutoIncrement(
            () => {
                const request = indexedDB.open(dbName);
                request.onsuccess = (openEvt) => {
                    try {
                        const transaction = (
                            openEvt.target as IDBOpenDBRequest
                        ).result.transaction([objectStoreName], "readwrite");
                        const objectstore =
                            transaction.objectStore(objectStoreName);

                        try {
                            const getRequest = objectstore.get(
                                IDBKeyRange.lowerBound(5, true)
                            );
                            getRequest.onsuccess = (e) => {
                                assert.deepEqual(
                                    (e.target as IDBRequest).result,
                                    addData6,
                                    "Data"
                                );
                            };
                            getRequest.onerror = (e) => {
                                assert.fail("Get error");
                            };
                        } catch (ex) {
                            assert.fail("Get error");
                        }

                        transaction.oncomplete = (e) => {
                            (e.target as IDBTransaction).db.close();
                            done();
                        };
                        transaction.onabort = (err) => {
                            assert.equal(
                                (err as ErrorEvent).error.name,
                                "AbortError",
                                "AbortError"
                            );
                            (openEvt.target as IDBTransaction).db.close();
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
    it("Retrieving data - key range lowerBound inclusieve", (done) => {
        initionalSituationObjectStoreWithKeyPathAndMultipleDataNoAutoIncrement(
            () => {
                const request = indexedDB.open(dbName);
                request.onsuccess = (openEvt) => {
                    try {
                        const transaction = (
                            openEvt.target as IDBOpenDBRequest
                        ).result.transaction([objectStoreName], "readwrite");
                        const objectstore =
                            transaction.objectStore(objectStoreName);

                        try {
                            const getRequest = objectstore.get(
                                IDBKeyRange.lowerBound(5)
                            );
                            getRequest.onsuccess = (e) => {
                                assert.deepEqual(
                                    (e.target as IDBRequest).result,
                                    addData5,
                                    "Data"
                                );
                            };
                            getRequest.onerror = (e) => {
                                assert.fail("Get error");
                            };
                        } catch (ex) {
                            assert.fail("Get error");
                        }

                        transaction.oncomplete = (e) => {
                            (e.target as IDBTransaction).db.close();
                            done();
                        };
                        transaction.onabort = (err) => {
                            assert.equal(
                                (err as ErrorEvent).error.name,
                                "AbortError",
                                "AbortError"
                            );
                            (openEvt.target as IDBTransaction).db.close();
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
    it("Retrieving data - key range upperBound", (done) => {
        initionalSituationObjectStoreWithKeyPathAndMultipleDataNoAutoIncrement(
            () => {
                const request = indexedDB.open(dbName);
                request.onsuccess = (openEvt) => {
                    try {
                        const transaction = (
                            openEvt.target as IDBOpenDBRequest
                        ).result.transaction([objectStoreName], "readwrite");
                        const objectstore =
                            transaction.objectStore(objectStoreName);

                        try {
                            const getRequest = objectstore.get(
                                IDBKeyRange.upperBound(5)
                            );
                            getRequest.onsuccess = (e) => {
                                assert.deepEqual(
                                    (e.target as IDBRequest).result,
                                    addData,
                                    "No data Data"
                                );
                            };
                            getRequest.onerror = () => {
                                assert.fail("Get error");
                            };
                        } catch (ex) {
                            assert.fail("Get error");
                        }

                        transaction.oncomplete = (e) => {
                            (e.target as IDBTransaction).db.close();
                            done();
                        };
                        transaction.onabort = (err) => {
                            assert.equal(
                                (err as ErrorEvent).error.name,
                                "AbortError",
                                "AbortError"
                            );
                            (openEvt.target as IDBTransaction).db.close();
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
    it("Retrieving data - key range upperBound exclusieve", (done) => {
        initionalSituationObjectStoreWithKeyPathAndMultipleDataNoAutoIncrement(
            () => {
                const request = indexedDB.open(dbName);
                request.onsuccess = (openEvt) => {
                    try {
                        const transaction = (
                            openEvt.target as IDBOpenDBRequest
                        ).result.transaction([objectStoreName], "readwrite");
                        const objectstore =
                            transaction.objectStore(objectStoreName);

                        try {
                            const getRequest = objectstore.get(
                                IDBKeyRange.upperBound(1, true)
                            );
                            getRequest.onsuccess = (e) => {
                                assert.deepEqual(
                                    (e.target as IDBRequest).result,
                                    undefined,
                                    "No data Data"
                                );
                            };
                            getRequest.onerror = () => {
                                assert.fail("Get error");
                            };
                        } catch (ex) {
                            assert.fail("Get error");
                        }

                        transaction.oncomplete = (e) => {
                            (e.target as IDBTransaction).db.close();
                            done();
                        };
                        transaction.onabort = (err) => {
                            assert.equal(
                                (err as ErrorEvent).error.name,
                                "AbortError",
                                "AbortError"
                            );
                            (openEvt.target as IDBTransaction).db.close();
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
    it("Retrieving data - key range upperBound inclusieve", (done) => {
        initionalSituationObjectStoreWithKeyPathAndMultipleDataNoAutoIncrement(
            () => {
                const request = indexedDB.open(dbName);
                request.onsuccess = (openEvt) => {
                    try {
                        const transaction = (
                            openEvt.target as IDBOpenDBRequest
                        ).result.transaction([objectStoreName], "readwrite");
                        const objectstore =
                            transaction.objectStore(objectStoreName);

                        try {
                            const getRequest = objectstore.get(
                                IDBKeyRange.upperBound(1, false)
                            );
                            getRequest.onsuccess = (get) => {
                                assert.deepEqual(
                                    (get.target as IDBRequest).result,
                                    addData,
                                    "No data Data"
                                );
                            };
                            getRequest.onerror = () => {
                                assert.fail("Get error");
                            };
                        } catch (ex) {
                            assert.fail("Get error");
                        }

                        transaction.oncomplete = (txn) => {
                            (txn.target as IDBTransaction).db.close();
                            done();
                        };
                        transaction.onabort = (err) => {
                            assert.equal(
                                (err as ErrorEvent).error.name,
                                "AbortError",
                                "AbortError"
                            );
                            (openEvt.target as IDBTransaction).db.close();
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
});
