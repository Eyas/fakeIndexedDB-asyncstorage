/**
 * Created by Kristof on 10/03/2015.
 */

import * as assert from "assert";
import {
    initionalSituationObjectStore,
    dbName,
    objectStoreName,
    initionalSituation,
} from "./helpers.js";

describe("Transaction", () => {
    it("Opening transaction", (done) => {
        initionalSituationObjectStore(
            () => {
                const request = indexedDB.open(dbName);
                request.onsuccess = (openEvt) => {
                    try {
                        const transaction = (
                            openEvt.target as IDBOpenDBRequest
                        ).result.transaction([objectStoreName]);
                        assert.ok(true, "Transaction open");
                        assert.equal(transaction.mode, "readonly", "readonly");

                        transaction.oncomplete = (e) => {
                            assert.ok(true, "Transaction commited");
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
    it("Opening readonly transaction", (done) => {
        const mode = "readonly";

        initionalSituationObjectStore(
            () => {
                const request = indexedDB.open(dbName);
                request.onsuccess = (openEvt) => {
                    try {
                        const transaction = (
                            openEvt.target as IDBOpenDBRequest
                        ).result.transaction([objectStoreName]);
                        assert.ok(true, "Transaction open");
                        assert.equal(transaction.mode, mode, mode);

                        transaction.oncomplete = (e) => {
                            assert.ok(true, "Transaction commited");
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
    it("Opening readwrite transaction", (done) => {
        const mode = "readwrite";

        initionalSituationObjectStore(
            () => {
                const request = indexedDB.open(dbName);
                request.onsuccess = (openEvt) => {
                    try {
                        const transaction = (
                            openEvt.target as IDBOpenDBRequest
                        ).result.transaction([objectStoreName], mode);
                        assert.ok(true, "Transaction open");
                        assert.equal(transaction.mode, mode, mode);

                        transaction.oncomplete = (e) => {
                            assert.ok(true, "Transaction commited");
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
    it("Aborting transaction", (done) => {
        initionalSituationObjectStore(
            () => {
                const request = indexedDB.open(dbName);
                request.onsuccess = (openEvt) => {
                    try {
                        const transaction = (
                            openEvt.target as IDBOpenDBRequest
                        ).result.transaction([objectStoreName]);
                        assert.ok(true, "Transaction open");

                        transaction.oncomplete = (e) => {
                            assert.fail("Transaction commited");
                        };
                        transaction.onabort = () => {
                            assert.ok(true, "Transaction aborted");
                            (openEvt.target as IDBOpenDBRequest).result.close();
                            done();
                        };
                        transaction.onerror = () => {
                            assert.fail("Transaction error");
                        };
                        transaction.abort();
                    } catch (ex) {
                        assert.equal(
                            ex.type,
                            "InvalidAccessError",
                            "InvalidAccessError"
                        );
                        (openEvt.target as IDBOpenDBRequest).result.close();
                        done();
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
    it("Opening transaction - without objectStore", (done) => {
        initionalSituationObjectStore(
            () => {
                const request = indexedDB.open(dbName);
                request.onsuccess = (openEvt) => {
                    try {
                        (openEvt.target as IDBOpenDBRequest).result.transaction(
                            []
                        );
                        assert.fail("Transaction open");
                    } catch (ex) {
                        assert.equal(
                            ex.name,
                            "InvalidAccessError",
                            "InvalidAccessError"
                        );
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
    it("Opening transaction - non existing objectStore", (done) => {
        const anOtherObjectStore = "anOtherObjectStore";
        initionalSituation(
            () => {
                const request = indexedDB.open(dbName);
                request.onsuccess = (openEvt) => {
                    try {
                        (openEvt.target as IDBOpenDBRequest).result.transaction(
                            [anOtherObjectStore]
                        );
                        assert.fail("Transaction open");
                    } catch (ex) {
                        assert.equal(ex.name, "NotFoundError", "NotFoundError");
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
    // TODO: Test concurrent transactions
});
