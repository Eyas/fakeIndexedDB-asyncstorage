/**
 * Created by Kristof on 10/03/2015.
 */

import * as assert from "assert";
import {
    initionalSituationObjectStoreNoAutoIncrement,
    dbName,
    objectStoreName,
    initionalSituationObjectStoreWithAutoIncrement,
    initionalSituationObjectStoreWithKeyPathNoAutoIncrement,
    initionalSituationObjectStoreWithKeyPathAndAutoIncrement,
    initionalSituationObjectStoreNoAutoIncrementWithData,
    addData,
    initionalSituationObjectStoreWithKeyPathAndDataNoAutoIncrement,
    initionalSituationIndexUniqueIndexWithData,
    initionalSituationIndexUniqueMultiEntryIndexWithData,
} from "./helpers.js";

describe("Objectstore - Put", () => {
    it("Putting data", (done) => {
        const data = { test: "test" };

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
                            const putRequest = objectstore.put(data);

                            putRequest.onsuccess = () => {
                                assert.ok(false, "data putted");
                            };
                            putRequest.onerror = () => {
                                assert.fail("Put error");
                            };
                        } catch (ex) {
                            assert.equal(ex.name, "DataError", "DataError");
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
                    assert.fail("Database exception");
                };
            },
            done,
            assert
        );
    });
    it("Putting data with external key", (done) => {
        const data = { test: "test" };
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
                            const putRequest = objectstore.put(data, key);

                            putRequest.onsuccess = (e) => {
                                assert.ok(true, "data putted");
                                assert.equal(
                                    (e.target as IDBRequest<IDBValidKey>)
                                        .result,
                                    key,
                                    "Key ok"
                                );
                            };
                            putRequest.onerror = (e) => {
                                assert.ok(false, "put error");
                            };
                        } catch (ex) {
                            assert.ok(false, "put exception");
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
                        assert.fail("Transaction exception");
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
    it("Putting data - objectstore autoincrement", (done) => {
        const data = { test: "test" };
        initionalSituationObjectStoreWithAutoIncrement(
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
                            const putRequest = objectstore.put(data);

                            putRequest.onsuccess = (e) => {
                                assert.ok(true, "data putted");
                            };
                            putRequest.onerror = (e) => {
                                assert.ok(false, "put error");
                            };
                        } catch (ex) {
                            assert.ok(false, "put exception");
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
                        assert.fail("Transaction exception");
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
    it("Putting data with external key - objectstore autoincrement", (done) => {
        const data = { test: "test" };
        const key = 1;
        initionalSituationObjectStoreWithAutoIncrement(
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
                            const putRequest = objectstore.put(data, key);

                            putRequest.onsuccess = (e) => {
                                assert.ok(true, "data putted");
                                assert.equal(
                                    (e.target as IDBRequest<IDBValidKey>)
                                        .result,
                                    key,
                                    "Key ok"
                                );
                            };
                            putRequest.onerror = (e) => {
                                assert.ok(false, "put error");
                            };
                        } catch (ex) {
                            assert.ok(false, "put exception");
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
                        assert.fail("Transaction exception");
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
    it("Putting data with external key (increase autoincrement) - objectstore autoincrement", (done) => {
        const data = { test: "test" };
        initionalSituationObjectStoreWithAutoIncrement(
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
                            const putRequest = objectstore.put(data);

                            putRequest.onsuccess = (put1) => {
                                assert.ok(true, "data putted");
                                const key = (
                                    put1.target as IDBRequest<IDBValidKey>
                                ).result;

                                try {
                                    const putRequest2 = objectstore.put(
                                        data,
                                        (key as number) + 3
                                    );

                                    putRequest2.onsuccess = (put2) => {
                                        assert.equal(
                                            (
                                                put2.target as IDBRequest<IDBValidKey>
                                            ).result,
                                            (key as number) + 3,
                                            "Key same as provided"
                                        );
                                        try {
                                            const putRequest3 =
                                                objectstore.put(data);

                                            putRequest3.onsuccess = (put3) => {
                                                assert.equal(
                                                    (
                                                        put3.target as IDBRequest<IDBValidKey>
                                                    ).result,
                                                    (key as number) + 4,
                                                    "Key increased after put with provided key"
                                                );
                                            };
                                            putRequest3.onerror = () => {
                                                assert.ok(false, "put error");
                                            };
                                        } catch (ex) {
                                            assert.ok(false, "put exception");
                                        }
                                    };
                                    putRequest2.onerror = (e) => {
                                        assert.ok(false, "put error");
                                    };
                                } catch (ex) {
                                    assert.ok(false, "put exception");
                                }
                            };
                            putRequest.onerror = (e) => {
                                assert.ok(false, "put error");
                            };
                        } catch (ex) {
                            assert.ok(false, "put exception");
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
                        assert.fail("Transaction exception");
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
    it("Putting data - objectstore keyPath", (done) => {
        const data = { test: "test" };
        initionalSituationObjectStoreWithKeyPathNoAutoIncrement(
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
                            const putRequest = objectstore.put(data);

                            putRequest.onsuccess = (e) => {
                                assert.ok(false, "data putted");
                            };
                            putRequest.onerror = (e) => {
                                assert.fail("Put error");
                            };
                        } catch (ex) {
                            assert.equal(ex.name, "DataError", "DataError");
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
                        assert.fail("Transaction exception");
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
    it("Putting data with inline key - objectstore keyPath", (done) => {
        const data = { test: "test", id: 1 };
        initionalSituationObjectStoreWithKeyPathNoAutoIncrement(
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
                            const putRequest = objectstore.put(data);

                            putRequest.onsuccess = (e) => {
                                assert.ok(true, "data putted");
                                assert.equal(
                                    (e.target as IDBRequest<IDBValidKey>)
                                        .result,
                                    data.id,
                                    "Key same as provided"
                                );
                            };
                            putRequest.onerror = (e) => {
                                assert.fail("put error");
                            };
                        } catch (ex) {
                            assert.fail("put exception");
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
                        assert.fail("Transaction exception");
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
    it("Putting data with external key - objectstore keyPath", (done) => {
        const data = { test: "test" };
        const key = 1;
        initionalSituationObjectStoreWithKeyPathNoAutoIncrement(
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
                            const putRequest = objectstore.put(data, key);

                            putRequest.onsuccess = (e) => {
                                assert.ok(false, "data putted");
                            };
                            putRequest.onerror = (e) => {
                                assert.fail("Transaction exception");
                            };
                        } catch (ex) {
                            assert.equal(ex.name, "DataError", "DataError");
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
                        assert.fail("Transaction exception");
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
    it("Putting data - objectstore keyPath autoincrement", (done) => {
        const data = { test: "test" };
        initionalSituationObjectStoreWithKeyPathAndAutoIncrement(
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
                            const putRequest = objectstore.put(data);

                            putRequest.onsuccess = (e) => {
                                assert.ok(true, "data putted");
                                assert.equal(
                                    (e.target as IDBRequest<IDBValidKey>)
                                        .result,
                                    1,
                                    "Key same as provided"
                                );
                            };
                            putRequest.onerror = (e) => {
                                assert.fail("put error");
                            };
                        } catch (ex) {
                            assert.fail("put exception");
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
                        assert.fail("Transaction exception");
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
    it("Putting data with inline key - objectstore keyPath autoincrement", (done) => {
        const data = { test: "test", id: 2 };
        initionalSituationObjectStoreWithKeyPathAndAutoIncrement(
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
                            const putRequest = objectstore.put(data);

                            putRequest.onsuccess = (e) => {
                                assert.ok(true, "data putted");
                                assert.equal(
                                    (e.target as IDBRequest<IDBValidKey>)
                                        .result,
                                    data.id,
                                    "Key set by autoincrement"
                                );
                            };
                            putRequest.onerror = (e) => {
                                assert.fail("put error");
                            };
                        } catch (ex) {
                            assert.fail("put exception");
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
                        assert.fail("Transaction exception");
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
    it("Putting data with external key - objectstore keyPath autoincrement", (done) => {
        const data = { test: "test" };
        const key = 1;
        initionalSituationObjectStoreWithKeyPathAndAutoIncrement(
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
                            const putRequest = objectstore.put(data, key);

                            putRequest.onsuccess = (e) => {
                                assert.ok(false, "data putted");
                            };
                            putRequest.onerror = (e) => {
                                assert.fail("Put error");
                            };
                        } catch (ex) {
                            assert.equal(ex.name, "DataError", "DataError");
                        }

                        transaction.oncomplete = (e) => {
                            (e.target as IDBTransaction).db.close();
                            done();
                        };
                        transaction.onabort = (err) => {
                            assert.fail("Transaction abort");
                            (openEvt.target as IDBOpenDBRequest).result.close();
                            done();
                        };
                        transaction.onerror = () => {
                            assert.fail("Transaction error");
                            (openEvt.target as IDBOpenDBRequest).result.close();
                            done();
                        };
                    } catch (ex) {
                        assert.fail("Transaction exception");
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
    it("Putting data with existing external key", (done) => {
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
                            const putRequest = objectstore.put(
                                addData,
                                addData.id
                            );

                            putRequest.onsuccess = (e) => {
                                assert.ok(true, "data putted");
                                assert.equal(
                                    (e.target as IDBRequest<IDBValidKey>)
                                        .result,
                                    addData.id,
                                    "Key ok"
                                );
                            };
                            putRequest.onerror = (e) => {
                                assert.fail("Put error");
                            };
                        } catch (ex) {
                            assert.fail("Put exception");
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
                        assert.fail("Transaction exception");
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
    it("Putting data with existing internal key", (done) => {
        initionalSituationObjectStoreWithKeyPathAndDataNoAutoIncrement(
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
                            const putRequest = objectstore.put(addData);

                            putRequest.onsuccess = (e) => {
                                assert.ok(true, "data putted");
                                assert.equal(
                                    (e.target as IDBRequest<IDBValidKey>)
                                        .result,
                                    addData.id,
                                    "Key ok"
                                );
                            };
                            putRequest.onerror = (e) => {
                                assert.fail("Put error");
                            };
                        } catch (ex) {
                            assert.fail("Put exception");
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
                        assert.fail("Transaction exception");
                        (openEvt.target as IDBOpenDBRequest).result.close();
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
    it("Putting data with invalid key", (done) => {
        const data = { test: "test" };

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
                            const putRequest = objectstore.put(
                                data,
                                data as unknown as IDBValidKey
                            );

                            putRequest.onsuccess = (e) => {
                                assert.ok(false, "data putted");
                            };
                            putRequest.onerror = (e) => {
                                assert.fail("Put error");
                            };
                        } catch (ex) {
                            assert.equal(ex.name, "DataError", "DataError");
                        }

                        transaction.oncomplete = (e) => {
                            (e.target as IDBTransaction).db.close();
                            done();
                        };
                        transaction.onabort = (err) => {
                            assert.fail("Transaction abort");
                            (openEvt.target as IDBOpenDBRequest).result.close();
                            done();
                        };
                        transaction.onerror = () => {
                            assert.fail("Transaction error");
                            (openEvt.target as IDBOpenDBRequest).result.close();
                            done();
                        };
                    } catch (ex) {
                        assert.fail("Transaction exception");
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
    it("Putting data with external key - string", (done) => {
        const data = { test: "test" };
        const key = "key";

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
                            const putRequest = objectstore.put(data, key);

                            putRequest.onsuccess = (e) => {
                                assert.ok(true, "data putted");
                                assert.equal(
                                    (e.target as IDBRequest<IDBValidKey>)
                                        .result,
                                    key,
                                    "Key ok"
                                );
                            };
                            putRequest.onerror = (e) => {
                                assert.ok(false, "put error");
                            };
                        } catch (ex) {
                            assert.ok(false, "put exception");
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
                        assert.fail("Transaction exception");
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
    it("Putting data with external key - array", (done) => {
        const data = { test: "test" };
        const key = [1, 2, 3];

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
                            const putRequest = objectstore.put(data, key);

                            putRequest.onsuccess = (e) => {
                                assert.ok(true, "data putted");
                                assert.deepEqual(
                                    (e.target as IDBRequest<IDBValidKey>)
                                        .result,
                                    key,
                                    "Key ok"
                                );
                            };
                            putRequest.onerror = (e) => {
                                assert.ok(false, "put error");
                            };
                        } catch (ex) {
                            assert.ok(false, "put exception");
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
                        assert.fail("Transaction exception");
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
    it("Putting data with inline key - string", (done) => {
        const data = { test: "test", id: "key" };
        initionalSituationObjectStoreWithKeyPathNoAutoIncrement(
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
                            const putRequest = objectstore.put(data);

                            putRequest.onsuccess = (e) => {
                                assert.ok(true, "data putted");
                                assert.equal(
                                    (e.target as IDBRequest<IDBValidKey>)
                                        .result,
                                    data.id,
                                    "Key same as provided"
                                );
                            };
                            putRequest.onerror = (e) => {
                                assert.fail("put error");
                            };
                        } catch (ex) {
                            assert.fail("put exception");
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
                        assert.fail("Transaction exception");
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
    it("Putting data with inline key - date", (done) => {
        const data = { test: "test", id: new Date() };
        initionalSituationObjectStoreWithKeyPathNoAutoIncrement(
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
                            const putRequest = objectstore.put(data);

                            putRequest.onsuccess = (e) => {
                                assert.ok(true, "data putted");
                                assert.deepEqual(
                                    (e.target as IDBRequest<IDBValidKey>)
                                        .result,
                                    data.id,
                                    "Key same as provided"
                                );
                            };
                            putRequest.onerror = (e) => {
                                assert.fail("put error");
                            };
                        } catch (ex) {
                            assert.fail("put exception");
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
                        assert.fail("Transaction exception");
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
    it("Putting data with inline key - array", (done) => {
        const data = { test: "test", id: [1, 2, 3] };
        initionalSituationObjectStoreWithKeyPathNoAutoIncrement(
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
                            const putRequest = objectstore.put(data);

                            putRequest.onsuccess = (e) => {
                                assert.ok(true, "data putted");
                                assert.deepEqual(
                                    (e.target as IDBRequest<IDBValidKey>)
                                        .result,
                                    data.id,
                                    "Key same as provided"
                                );
                            };
                            putRequest.onerror = (e) => {
                                assert.fail("put error");
                            };
                        } catch (ex) {
                            assert.fail("put exception");
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
                        assert.fail("Transaction exception");
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
    it("Putting data - ReadOnly transaction", (done) => {
        const data = { test: "test" };
        const key = "key";

        initionalSituationObjectStoreNoAutoIncrement(
            () => {
                const request = indexedDB.open(dbName);
                request.onsuccess = (openEvt) => {
                    try {
                        const transaction = (
                            openEvt.target as IDBOpenDBRequest
                        ).result.transaction([objectStoreName], "readonly");
                        const objectstore =
                            transaction.objectStore(objectStoreName);

                        try {
                            const putRequest = objectstore.put(data, key);

                            putRequest.onsuccess = (e) => {
                                assert.ok(false, "data putted");
                            };
                            putRequest.onerror = (e) => {
                                assert.fail("Put error");
                            };
                        } catch (ex) {
                            assert.equal(
                                ex.name,
                                "ReadOnlyError",
                                "ReadOnlyError"
                            );
                        }

                        transaction.oncomplete = (e) => {
                            (e.target as IDBTransaction).db.close();
                            done();
                        };
                        transaction.onabort = (err) => {
                            assert.fail("Transaction abort");
                            (openEvt.target as IDBOpenDBRequest).result.close();
                            done();
                        };
                        transaction.onerror = () => {
                            assert.fail("Transaction error");
                            (openEvt.target as IDBOpenDBRequest).result.close();
                            done();
                        };
                    } catch (ex) {
                        assert.fail("Transaction exception");
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
    it("Putting data - DataCloneError", (done) => {
        const data = {
            test: "test",
            toString: () => {
                return true;
            },
        };
        const key = "key";

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
                            const putRequest = objectstore.put(data, key);

                            putRequest.onsuccess = (e) => {
                                assert.ok(false, "data putted");
                            };
                            putRequest.onerror = (e) => {
                                assert.fail("Put error");
                            };
                        } catch (ex) {
                            assert.equal(
                                ex.name,
                                "DataCloneError",
                                "DataCloneError"
                            );
                        }

                        transaction.oncomplete = (e) => {
                            (e.target as IDBTransaction).db.close();
                            done();
                        };
                        transaction.onabort = (err) => {
                            assert.fail("Transaction abort");
                            (openEvt.target as IDBOpenDBRequest).result.close();
                            done();
                        };
                        transaction.onerror = () => {
                            assert.fail("Transaction error");
                            (openEvt.target as IDBOpenDBRequest).result.close();
                            done();
                        };
                    } catch (ex) {
                        assert.fail("Transaction exception");
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
    it("Putting data with existing index key - unique index ", (done) => {
        initionalSituationIndexUniqueIndexWithData(
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
                            const putRequest = objectstore.put(
                                addData,
                                addData.id + 1
                            );

                            putRequest.onsuccess = (e) => {
                                assert.ok(false, "data putted");
                            };
                            putRequest.onerror = (e) => {
                                assert.equal(
                                    (e.target as IDBRequest).error?.name,
                                    "ConstraintError",
                                    "ConstraintError"
                                );
                            };
                        } catch (ex) {
                            assert.fail("Put exception");
                        }

                        transaction.oncomplete = (e) => {
                            (e.target as IDBTransaction).db.close();
                            done();
                        };
                        transaction.onabort = (err) => {
                            assert.equal(
                                (err.target as IDBRequest).error?.name,
                                "ConstraintError",
                                "ConstraintError"
                            );
                            (openEvt.target as IDBOpenDBRequest).result.close();
                            done();
                        };
                        transaction.onerror = (err) => {
                            assert.equal(
                                (err.target as IDBRequest).error?.name,
                                "ConstraintError",
                                "ConstraintError"
                            );
                        };
                    } catch (ex) {
                        assert.fail("Transaction exception");
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
    it("Putting data with existing index key - unique multientry index ", (done) => {
        initionalSituationIndexUniqueMultiEntryIndexWithData(
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
                            const putRequest = objectstore.put(
                                addData,
                                addData.id + 1
                            );

                            putRequest.onsuccess = (e) => {
                                assert.ok(false, "data putted");
                            };
                            putRequest.onerror = (e) => {
                                assert.equal(
                                    (e.target as IDBRequest).error?.name,
                                    "ConstraintError",
                                    "ConstraintError"
                                );
                            };
                        } catch (ex) {
                            assert.equal(
                                ex.name,
                                "ConstraintError",
                                "ConstraintError"
                            );
                        }

                        transaction.oncomplete = (e) => {
                            (e.target as IDBTransaction).db.close();
                            done();
                        };
                        transaction.onabort = (err) => {
                            assert.equal(
                                (err.target as IDBRequest).error?.name,
                                "ConstraintError",
                                "ConstraintError"
                            );
                            (openEvt.target as IDBOpenDBRequest).result.close();
                            done();
                        };
                        transaction.onerror = (err) => {
                            assert.equal(
                                (err.target as IDBRequest).error?.name,
                                "ConstraintError",
                                "ConstraintError"
                            );
                        };
                    } catch (ex) {
                        assert.fail("Transaction exception");
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
    // TODO: test adding data to a deleted objectstore
});
