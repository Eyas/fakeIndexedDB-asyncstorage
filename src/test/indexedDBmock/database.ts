/**
 * Created by Kristof on 16/02/2015.
 */

import * as assert from "assert";
import {
    dbName,
    initionalSituation,
    initionalSituationDatabase,
    initionalSituationDatabaseVersion,
    msgCreatingInitialSituationFailed,
} from "./helpers.js";

describe("database", () => {
    it("Opening/Creating Database", (done) => {
        initionalSituation(
            () => {
                const request = indexedDB.open(dbName);

                request.onsuccess = (e) => {
                    assert.equal(
                        (e.target as IDBRequest).result.name,
                        dbName,
                        "Database opened/created"
                    );
                    // Necessary for indexeddb who work with setVersion
                    assert.equal(
                        parseInt((e.target as IDBRequest).result.version, 10),
                        1,
                        "Database opened/created"
                    );
                    (e.target as IDBRequest).result.close();
                    done();
                };
                request.onerror = () => {
                    assert.fail("Creating database failed");
                };
                request.onupgradeneeded = (e) => {
                    assert.equal(e.type, "upgradeneeded", "Upgrading database");
                };
            },
            done,
            assert
        );
    });
    it("Opening/Creating Database with version", (done) => {
        const version = 2;

        initionalSituation(
            () => {
                const request = indexedDB.open(dbName, version);

                request.onsuccess = (e) => {
                    assert.equal(
                        (e.target as IDBRequest).result.name,
                        dbName,
                        "Database opened/created"
                    );
                    // Necessary for indexeddb who work with setVersion
                    assert.equal(
                        parseInt((e.target as IDBRequest).result.version, 10),
                        version,
                        "Database version"
                    );
                    (e.target as IDBRequest).result.close();
                    done();
                };
                request.onerror = () => {
                    assert.fail("Creating database failed");
                };
                request.onupgradeneeded = (e) => {
                    assert.equal(e.type, "upgradeneeded", "Upgrading database");
                    assert.equal(e.oldVersion, 0, "Old version");
                    assert.equal(e.newVersion, version, "New version");
                };
            },
            done,
            assert
        );
    });
    it("Opening existing Database", (done) => {
        initionalSituationDatabase(
            () => {
                const request = indexedDB.open(dbName);
                request.onsuccess = (e) => {
                    assert.equal(
                        (e.target as IDBRequest).result.name,
                        dbName,
                        "Database opened/created"
                    );
                    (e.target as IDBRequest).result.close();
                    done();
                };
                request.onerror = () => {
                    assert.fail("Creating/opening database failed");
                };
                request.onupgradeneeded = (e) => {
                    assert.fail("Upgrading database");
                };
            },
            done,
            assert
        );
    });
    it("Opening existing Database with current version", (done) => {
        const version = 1;

        initionalSituationDatabase(
            () => {
                const request = indexedDB.open(dbName, version);
                request.onsuccess = (e) => {
                    assert.equal(
                        (e.target as IDBRequest).result.name,
                        dbName,
                        "Database opened/created"
                    );
                    assert.equal(
                        parseInt((e.target as IDBRequest).result.version, 10),
                        version,
                        "Database version"
                    );
                    (e.target as IDBRequest).result.close();
                    done();
                };
                request.onerror = () => {
                    assert.fail("Creating/opening database failed");
                };
                request.onupgradeneeded = (e) => {
                    assert.fail("Upgrading database");
                };
            },
            done,
            assert
        );
    });
    it("Opening existing Database with lower version", (done) => {
        const version = 1;

        initionalSituationDatabaseVersion(
            () => {
                const request = indexedDB.open(dbName, version);

                request.onsuccess = (e) => {
                    assert.fail("Database opened/created");
                };
                request.onerror = (e) => {
                    assert.equal(
                        (e.target as IDBRequest).error?.name,
                        "VersionError",
                        "Creating/Opening database failed"
                    );
                    done();
                };
                request.onupgradeneeded = (e) => {
                    assert.fail("Upgrading database");
                };
            },
            done,
            assert
        );
    });
    it("Opening existing Database with higher version", (done) => {
        const version = 2;

        initionalSituationDatabase(
            () => {
                const request = indexedDB.open(dbName, version);

                request.onsuccess = (e) => {
                    assert.equal(
                        (e.target as IDBRequest).result.name,
                        dbName,
                        "Database opened/created"
                    );
                    assert.equal(
                        (e.target as IDBRequest).result.version,
                        version,
                        "Database version"
                    );
                    (e.target as IDBRequest).result.close();
                    done();
                };
                request.onerror = () => {
                    assert.fail("Creating/Opening database failed");
                };
                request.onupgradeneeded = (e) => {
                    assert.equal("upgradeneeded", e.type, "Upgrading database");
                    assert.equal(e.oldVersion, 1, "Old version");
                    assert.equal(e.newVersion, version, "New version");
                };
            },
            done,
            assert
        );
    });
    it("Deleting existing Database", (done) => {
        const request = indexedDB.open(dbName);

        request.onsuccess = (e) => {
            (e.target as IDBRequest).result.close();
            const deleteRequest = indexedDB.deleteDatabase(dbName);

            deleteRequest.onsuccess = () => {
                assert.ok(true, "Database removed");
                done();
            };
            deleteRequest.onerror = () => {
                assert.fail("Deleting database failed: ");
            };
        };
        request.onerror = () => {
            assert.fail(msgCreatingInitialSituationFailed);
        };
    });
    it("Deleting non existing Database", (done) => {
        initionalSituation(
            () => {
                const deleteRequest = indexedDB.deleteDatabase(dbName);

                deleteRequest.onsuccess = (e) => {
                    assert.ok(true, "Database removed");
                    done();
                };
                deleteRequest.onerror = () => {
                    assert.fail("Deleting database failed: ");
                };
            },
            done,
            assert
        );
    });
});
