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
    initionalSituationObjectStoreWithKeyPathAndDataNoAutoIncrement,
    initionalSituationIndexUniqueIndexWithData,
    initionalSituationIndexUniqueMultiEntryIndexWithData,
    addData,
} from "./helpers.js";

describe("ObjectStore.add", () => {
    it("Adding data", (done) => {
        const data = { test: "test" };

        initionalSituationObjectStoreNoAutoIncrement(
            () => {
                const request = indexedDB.open(dbName);
                request.onsuccess = (e) => {
                    try {
                        const transaction = (
                            e.target as IDBOpenDBRequest
                        ).result.transaction([objectStoreName], "readwrite");
                        const objectstore =
                            transaction.objectStore(objectStoreName);

                        try {
                            const addRequest = objectstore.add(data);
                            addRequest.onsuccess = () => {
                                assert.ok(false, "data added");
                            };
                            addRequest.onerror = () => {
                                assert.fail("Add error");
                            };
                        } catch (ex) {
                            assert.equal(ex.name, "DataError", "DataError");
                        }

                        transaction.oncomplete = (completeEvt) => {
                            assert.ok(true, "Transaction complete");
                            (completeEvt.target as IDBTransaction).db.close();
                            done();
                        };
                        transaction.onabort = () => {
                            assert.fail("Transaction abort");
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
    it("Adding data with external key", (done) => {
        const data = { test: "test" };
        const key = 1;

        initionalSituationObjectStoreNoAutoIncrement(
            () => {
                const request = indexedDB.open(dbName);
                request.onsuccess = (e) => {
                    try {
                        const transaction = (
                            e.target as IDBOpenDBRequest
                        ).result.transaction([objectStoreName], "readwrite");
                        const objectstore =
                            transaction.objectStore(objectStoreName);

                        try {
                            const addRequest = objectstore.add(data, key);

                            addRequest.onsuccess = (addEvt) => {
                                assert.ok(true, "data added");
                                assert.equal(
                                    (addEvt.target as IDBRequest<IDBValidKey>)
                                        .result,
                                    key,
                                    "Key assert.ok"
                                );
                            };
                            addRequest.onerror = () => {
                                assert.ok(false, "add error");
                            };
                        } catch (ex) {
                            assert.ok(false, "add exception");
                        }

                        transaction.oncomplete = (completeEvt) => {
                            (completeEvt.target as IDBTransaction).db.close();
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
    it("Adding data - objectstore autoincrement", (done) => {
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
                            const addRequest = objectstore.add(data);

                            addRequest.onsuccess = (e) => {
                                assert.ok(true, "data added");
                            };
                            addRequest.onerror = (e) => {
                                assert.ok(false, "add exception");
                            };
                        } catch (ex) {
                            assert.ok(false, "add exception");
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
    it("Adding data with external key - objectstore autoincrement", (done) => {
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
                            const addRequest = objectstore.add(data, key);

                            addRequest.onsuccess = (e) => {
                                assert.ok(true, "data added");
                                assert.equal(
                                    (e.target as IDBRequest<IDBValidKey>)
                                        .result,
                                    key,
                                    "Key assert.ok"
                                );
                            };
                            addRequest.onerror = (e) => {
                                assert.ok(false, "add error");
                            };
                        } catch (ex) {
                            assert.ok(false, "add exception");
                        }

                        transaction.oncomplete = (e) => {
                            (e.target as IDBTransaction).db.close();
                            done();
                        };
                        transaction.onabort = () => {
                            assert.fail("Transaction aborted");
                        };
                        transaction.onerror = () => {
                            assert.fail("Transaction exception");
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
    it("Adding data with external key (increase autoincrement) - objectstore autoincrement", (done) => {
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
                            const addRequest = objectstore.add(data);

                            addRequest.onsuccess = (add1) => {
                                assert.ok(true, "data added");
                                const key = (
                                    add1.target as IDBRequest<IDBValidKey>
                                ).result;

                                try {
                                    const addRequest2 = objectstore.add(
                                        data,
                                        (key as number) + 3
                                    );

                                    addRequest2.onsuccess = (add2) => {
                                        assert.equal(
                                            (
                                                add2.target as IDBRequest<IDBValidKey>
                                            ).result,
                                            (key as number) + 3,
                                            "Key same as provided"
                                        );
                                        try {
                                            const addRequest3 =
                                                objectstore.add(data);

                                            addRequest3.onsuccess = (e) => {
                                                assert.equal(
                                                    (
                                                        e.target as IDBRequest<IDBValidKey>
                                                    ).result,
                                                    (key as number) + 4,
                                                    "Key increased after add with provided key"
                                                );
                                            };
                                            addRequest3.onerror = () => {
                                                assert.ok(false, "add error");
                                            };
                                        } catch (ex) {
                                            assert.ok(false, "add exception");
                                        }
                                    };
                                    addRequest2.onerror = () => {
                                        assert.ok(false, "add error");
                                    };
                                } catch (ex) {
                                    assert.ok(false, "add exception");
                                }
                            };
                            addRequest.onerror = () => {
                                assert.ok(false, "add error");
                            };
                        } catch (ex) {
                            assert.ok(false, "add exception");
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
    it("Adding data - objectstore keyPath", (done) => {
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
                            const addRequest = objectstore.add(data);

                            addRequest.onsuccess = (e) => {
                                assert.ok(false, "data added");
                            };
                            addRequest.onerror = (e) => {
                                assert.fail("Add error");
                            };
                        } catch (ex) {
                            assert.equal(ex.name, "DataError", "DataError");
                        }

                        transaction.oncomplete = (e) => {
                            assert.ok(true, "Transaction complete");
                            (e.target as IDBTransaction).db.close();
                            done();
                        };
                        transaction.onabort = (err) => {
                            assert.fail("Transaction abort");
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
    it("Adding data with inline key - objectstore keyPath", (done) => {
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
                            const addRequest = objectstore.add(data);

                            addRequest.onsuccess = (e) => {
                                assert.ok(true, "data added");
                                assert.equal(
                                    (e.target as IDBRequest<IDBValidKey>)
                                        .result,
                                    data.id,
                                    "Key same as provided"
                                );
                            };
                            addRequest.onerror = (e) => {
                                assert.fail("add error");
                            };
                        } catch (ex) {
                            assert.fail("add exception");
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
    it("Adding data with external key - objectstore keyPath", (done) => {
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
                            const addRequest = objectstore.add(data, key);

                            addRequest.onsuccess = (e) => {
                                assert.ok(false, "data added");
                            };
                            addRequest.onerror = (e) => {
                                assert.fail("add error");
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
    it("Adding data - objectstore keyPath autoincrement", (done) => {
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
                            const addRequest = objectstore.add(data);

                            addRequest.onsuccess = (e) => {
                                assert.ok(true, "data added");
                                assert.equal(
                                    (e.target as IDBRequest<IDBValidKey>)
                                        .result,
                                    1,
                                    "Key same as provided"
                                );
                            };
                            addRequest.onerror = (e) => {
                                assert.fail("add error");
                            };
                        } catch (ex) {
                            assert.fail("add exception");
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
    it("Adding data with inline key - objectstore keyPath autoincrement", (done) => {
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
                            const addRequest = objectstore.add(data);

                            addRequest.onsuccess = (e) => {
                                assert.ok(true, "data added");
                                assert.equal(
                                    (e.target as IDBRequest<IDBValidKey>)
                                        .result,
                                    data.id,
                                    "Key set by autoincrement"
                                );
                            };
                            addRequest.onerror = (e) => {
                                assert.fail("add error");
                            };
                        } catch (ex) {
                            assert.fail("add exception");
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
    it("Adding data with external key - objectstore keyPath autoincrement", (done) => {
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
                            const addRequest = objectstore.add(data, key);

                            addRequest.onsuccess = (e) => {
                                assert.ok(false, "data added");
                            };
                            addRequest.onerror = (e) => {
                                assert.ok(false, "data error");
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
    it("Adding data with existing external key", (done) => {
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
                            const addRequest = objectstore.add(
                                addData,
                                addData.id
                            );

                            addRequest.onsuccess = (e) => {
                                assert.ok(false, "data added");
                            };
                            addRequest.onerror = (e) => {
                                assert.equal(
                                    (e.target as IDBRequest).error?.name,
                                    "ConstraintError",
                                    "ConstraintError"
                                );
                            };
                        } catch (ex) {
                            assert.fail("Add exception");
                        }

                        transaction.oncomplete = (e) => {
                            (e.target as IDBTransaction).db.close();
                            done();
                        };
                        transaction.onabort = (err) => {
                            assert.equal(
                                (err.target as IDBTransaction).error?.name,
                                "ConstraintError",
                                "ConstraintError"
                            );
                            (openEvt.target as IDBRequest).result.close();
                            done();
                        };
                        transaction.onerror = (err) => {
                            assert.equal(
                                (err.target as IDBTransaction).error?.name,
                                "ConstraintError",
                                "ConstraintError"
                            );
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
    it("Adding data with existing internal key", (done) => {
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
                            const addRequest = objectstore.add(addData);

                            addRequest.onsuccess = (e) => {
                                assert.ok(false, "data added");
                            };
                            addRequest.onerror = (e) => {
                                assert.equal(
                                    (e.target as IDBRequest).error?.name,
                                    "ConstraintError",
                                    "ConstraintError"
                                );
                            };
                        } catch (ex) {
                            assert.fail("Add exception");
                        }

                        transaction.oncomplete = (e) => {
                            (e.target as IDBTransaction).db.close();
                            done();
                        };
                        transaction.onabort = (err) => {
                            assert.equal(
                                (err.target as IDBTransaction).error?.name,
                                "ConstraintError",
                                "ConstraintError"
                            );
                            (openEvt.target as IDBOpenDBRequest).result.close();
                            done();
                        };
                        transaction.onerror = (err) => {
                            assert.equal(
                                (err.target as IDBTransaction).error?.name,
                                "ConstraintError",
                                "ConstraintError"
                            );
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
    it("Adding data with invalid key", (done) => {
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
                            const addRequest = objectstore.add(
                                data,
                                data as unknown as IDBValidKey
                            );

                            addRequest.onsuccess = (e) => {
                                assert.ok(false, "data added");
                            };
                            addRequest.onerror = (e) => {
                                assert.fail("Add error");
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
    it("Adding data with external key - string", (done) => {
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
                            const addRequest = objectstore.add(data, key);

                            addRequest.onsuccess = (e) => {
                                assert.ok(true, "data added");
                                assert.equal(
                                    (e.target as IDBRequest<IDBValidKey>)
                                        .result,
                                    key,
                                    "Key assert.ok"
                                );
                            };
                            addRequest.onerror = (e) => {
                                assert.ok(false, "add error");
                            };
                        } catch (ex) {
                            assert.ok(false, "add exception");
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
    it("Adding data with external key - array", (done) => {
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
                            const addRequest = objectstore.add(data, key);

                            addRequest.onsuccess = (e) => {
                                assert.ok(true, "data added");
                                assert.deepEqual(
                                    (e.target as IDBRequest<IDBValidKey>)
                                        .result,
                                    key,
                                    "Key assert.ok"
                                );
                            };
                            addRequest.onerror = (e) => {
                                assert.ok(false, "add error");
                            };
                        } catch (ex) {
                            assert.ok(false, "add exception");
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
    it("Adding data with inline key - string", (done) => {
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
                            const addRequest = objectstore.add(data);

                            addRequest.onsuccess = (e) => {
                                assert.ok(true, "data added");
                                assert.equal(
                                    (e.target as IDBRequest<IDBValidKey>)
                                        .result,
                                    data.id,
                                    "Key same as provided"
                                );
                            };
                            addRequest.onerror = (e) => {
                                assert.fail("add error");
                            };
                        } catch (ex) {
                            assert.fail("add exception");
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
                    assert.fail("Database exception");
                };
            },
            done,
            assert
        );
    });
    it("Adding data with inline key - date", (done) => {
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
                            const addRequest = objectstore.add(data);

                            addRequest.onsuccess = (e) => {
                                assert.ok(true, "data added");
                                assert.deepEqual(
                                    (e.target as IDBRequest<IDBValidKey>)
                                        .result,
                                    data.id,
                                    "Key same as provided"
                                );
                            };
                            addRequest.onerror = (e) => {
                                assert.fail("add error");
                            };
                        } catch (ex) {
                            assert.fail("add exception");
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
                    assert.fail("Database exception");
                };
            },
            done,
            assert
        );
    });
    it("Adding data with inline key - array", (done) => {
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
                            const addRequest = objectstore.add(data);

                            addRequest.onsuccess = (e) => {
                                assert.ok(true, "data added");
                                assert.deepEqual(
                                    (e.target as IDBRequest<IDBValidKey>)
                                        .result,
                                    data.id,
                                    "Key same as provided"
                                );
                            };
                            addRequest.onerror = (e) => {
                                assert.fail("add error");
                            };
                        } catch (ex) {
                            assert.fail("add exception");
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
    it("Adding data - ReadOnly transaction", (done) => {
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
                            const addRequest = objectstore.add(data, key);

                            addRequest.onsuccess = (e) => {
                                assert.ok(false, "data added");
                            };
                            addRequest.onerror = (e) => {
                                assert.fail("Add error");
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
    it("Adding data - DataCloneError", (done) => {
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
                            const addRequest = objectstore.add(data, key);

                            addRequest.onsuccess = (e) => {
                                assert.ok(false, "data added");
                            };
                            addRequest.onerror = (e) => {
                                assert.fail("Add error");
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
    it("Adding data with existing index key - unique index ", (done) => {
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
                            const addRequest = objectstore.add(
                                addData,
                                addData.id + 1
                            );

                            addRequest.onsuccess = (e) => {
                                assert.ok(false, "data added");
                            };
                            addRequest.onerror = (e) => {
                                assert.equal(
                                    (e.target as IDBRequest).error?.name,
                                    "ConstraintError",
                                    "ConstraintError"
                                );
                            };
                        } catch (ex) {
                            assert.fail("Add exception");
                        }

                        transaction.oncomplete = (e) => {
                            (e.target as IDBTransaction).db.close();
                            done();
                        };
                        transaction.onabort = (err) => {
                            assert.equal(
                                (err.target as IDBTransaction).error?.name,
                                "ConstraintError",
                                "ConstraintError"
                            );
                            (openEvt.target as IDBOpenDBRequest).result.close();
                            done();
                        };
                        transaction.onerror = (err) => {
                            assert.equal(
                                (err.target as IDBTransaction).error?.name,
                                "ConstraintError",
                                "ConstraintError"
                            );
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
    it("Adding data with existing index key - unique multientry index ", (done) => {
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
                            const addRequest = objectstore.add(
                                addData,
                                addData.id + 1
                            );

                            addRequest.onsuccess = (e) => {
                                assert.ok(false, "data added");
                            };
                            addRequest.onerror = (e) => {
                                assert.equal(
                                    (e.target as IDBTransaction).error?.name,
                                    "ConstraintError",
                                    "ConstraintError"
                                );
                            };
                        } catch (ex) {
                            assert.fail("Add exception");
                        }

                        transaction.oncomplete = (e) => {
                            (e.target as IDBTransaction).db.close();
                            done();
                        };
                        transaction.onabort = (err) => {
                            assert.equal(
                                (err.target as IDBTransaction).error?.name,
                                "ConstraintError",
                                "ConstraintError"
                            );
                            (openEvt.target as IDBOpenDBRequest).result.close();
                            done();
                        };
                        transaction.onerror = (err) => {
                            assert.equal(
                                (err.target as IDBTransaction).error?.name,
                                "ConstraintError",
                                "ConstraintError"
                            );
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
    // TODO: test adding data to a deleted objectstore
});
