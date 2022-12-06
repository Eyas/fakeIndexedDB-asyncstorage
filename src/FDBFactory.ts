import FDBDatabase, { ALLOW_VERSION_CHANGE } from "./FDBDatabase.js";
import FDBOpenDBRequest from "./FDBOpenDBRequest.js";
import FDBVersionChangeEvent from "./FDBVersionChangeEvent.js";
import { AsyncStringMap } from "./lib/asyncMap.js";
import cmp from "./lib/cmp.js";
import Database from "./lib/Database.js";
import enforceRange from "./lib/enforceRange.js";
import { AbortError, VersionError } from "./lib/errors.js";
import FakeEvent from "./lib/FakeEvent.js";
import { queueTask } from "./lib/scheduling.js";
import { AsyncStorage, STORAGE_PREFIX } from "./lib/storage.js";

const waitForOthersClosedDelete = async (
    databases: AsyncStringMap<Database>,
    name: string,
    openDatabases: FDBDatabase[],
    cb: (err: Error | null) => void
) => {
    // While any db is open
    while (openDatabases.some((d) => !d._closed && !d._closePending)) {
        await new Promise((resolve) => setImmediate(resolve));
    }

    // cleanup db if we can find it...
    const db = await databases.get(name);
    if (db) {
        Array.from(db.rawObjectStores.values()).map((rawObjectStore) => {
            const p1 = rawObjectStore.records.clear();
            const p2a = Array.from(rawObjectStore.rawIndexes.values()).map(
                (rawIndex) => rawIndex.records.clear()
            );
            return Promise.all([p1, ...p2a]);
        });
        await db.rawObjectStores.clear();
    }
    await databases.delete(name);

    cb(null);
};

// http://www.w3.org/TR/2015/REC-IndexedDB-20150108/#dfn-steps-for-deleting-a-database
const deleteDatabase = async (
    databases: AsyncStringMap<Database>,
    name: string,
    request: FDBOpenDBRequest,
    cb: (err: Error | null) => void
) => {
    let openDatabases: FDBDatabase[];
    try {
        const db = await databases.get(name);
        if (db === undefined) {
            cb(null);
            return;
        }

        db.deletePending = true;

        openDatabases = db.connections.filter((connection) => {
            return !connection._closed && !connection._closePending;
        });

        for (const openDatabase2 of openDatabases) {
            if (!openDatabase2._closePending) {
                const event = new FDBVersionChangeEvent("versionchange", {
                    newVersion: null,
                    oldVersion: db.version,
                });
                openDatabase2.dispatchEvent(event);
            }
        }

        const anyOpen = openDatabases.some((openDatabase3) => {
            return !openDatabase3._closed && !openDatabase3._closePending;
        });

        if (request && anyOpen) {
            const event = new FDBVersionChangeEvent("blocked", {
                newVersion: null,
                oldVersion: db.version,
            });
            request.dispatchEvent(event);
        }
    } catch (err) {
        cb(err);
        return;
    }

    await waitForOthersClosedDelete(databases, name, openDatabases, cb);
};

// http://www.w3.org/TR/2015/REC-IndexedDB-20150108/#dfn-steps-for-running-a-versionchange-transaction
const runVersionchangeTransaction = (
    connection: FDBDatabase,
    version: number,
    request: FDBOpenDBRequest,
    cb: (err: Error | null) => void
) => {
    connection._runningVersionchangeTransaction = true;

    const oldVersion = connection.version;

    const openDatabases = connection._rawDatabase.connections.filter(
        (otherDatabase) => {
            return connection !== otherDatabase;
        }
    );

    for (const openDatabase2 of openDatabases) {
        if (!openDatabase2._closed && !openDatabase2._closePending) {
            const event = new FDBVersionChangeEvent("versionchange", {
                newVersion: version,
                oldVersion,
            });
            openDatabase2.dispatchEvent(event);
        }
    }

    const anyOpen = openDatabases.some((openDatabase3) => {
        return !openDatabase3._closed && !openDatabase3._closePending;
    });

    if (anyOpen) {
        const event = new FDBVersionChangeEvent("blocked", {
            newVersion: version,
            oldVersion,
        });
        request.dispatchEvent(event);
    }

    const waitForOthersClosed = () => {
        const anyOpen2 = openDatabases.some((openDatabase2) => {
            return !openDatabase2._closed && !openDatabase2._closePending;
        });

        if (anyOpen2) {
            queueTask(waitForOthersClosed);
            return;
        }

        // Set the version of database to version. This change is considered part of the transaction, and so if the
        // transaction is aborted, this change is reverted.
        connection._rawDatabase.version = version;
        connection.version = version;

        // Get rid of this setImmediate?
        const transaction = connection.transaction(
            connection.objectStoreNames,
            "versionchange",
            ALLOW_VERSION_CHANGE
        );
        request.result = connection;
        request.readyState = "done";
        request.transaction = transaction;

        transaction._rollbackLog.transactional.push(() => {
            connection._rawDatabase.version = oldVersion;
            connection.version = oldVersion;
        });

        const event = new FDBVersionChangeEvent("upgradeneeded", {
            newVersion: version,
            oldVersion,
        });
        request.dispatchEvent(event);

        transaction.addEventListener("error", () => {
            connection._runningVersionchangeTransaction = false;
            // throw arguments[0].target.error;
            // console.log("error in versionchange transaction - not sure if anything needs to be done here", e.target.error.name);
        });
        transaction.addEventListener("abort", () => {
            connection._runningVersionchangeTransaction = false;
            request.transaction = null;
            queueTask(() => {
                cb(AbortError());
            });
        });
        transaction.addEventListener("complete", () => {
            connection._runningVersionchangeTransaction = false;
            request.transaction = null;
            // Let other complete event handlers run before continuing
            queueTask(() => {
                if (connection._closePending) {
                    cb(AbortError());
                } else {
                    cb(null);
                }
            });
        });
    };

    waitForOthersClosed();
};

// http://www.w3.org/TR/2015/REC-IndexedDB-20150108/#dfn-steps-for-opening-a-database
const openDatabase = async (
    storage: AsyncStorage,
    databases: AsyncStringMap<Database>,
    name: string,
    version: number | undefined,
    request: FDBOpenDBRequest,
    cb: (err: Error | null, connection?: FDBDatabase) => void
) => {
    let db = await databases.get(name);
    while (db && db.deletePending) {
        // yield control
        await new Promise<void>((resolve) => queueTask(resolve));
        db = await databases.get(name);
    }

    if (db === undefined) {
        db = await Database.build(storage, name, 0);
        databases.set(name, db);
    }

    if (version === undefined) {
        version = db.version !== 0 ? db.version : 1;
    }

    if (db.version > version) {
        return cb(VersionError());
    }

    const connection = new FDBDatabase(db);

    if (db.version < version) {
        runVersionchangeTransaction(connection, version, request, (err) => {
            if (err) {
                // DO THIS HERE: ensure that connection is closed by running the steps for closing a database connection before these
                // steps are aborted.
                return cb(err);
            }

            cb(null, connection);
        });
    } else {
        cb(null, connection);
    }
};

class FDBFactory {
    public cmp = cmp;
    private readonly _databases: AsyncStringMap<Database>;

    private deleteQueue: (() => Promise<void>)[] = [];
    private deleteQueueProcessing = false;

    constructor(private readonly storage: AsyncStorage) {
        this._databases = new AsyncStringMap(
            storage,
            STORAGE_PREFIX + "/databases/",
            Database.getConstruct(storage),
            Database.save
        );
    }

    // http://www.w3.org/TR/2015/REC-IndexedDB-20150108/#widl-IDBFactory-deleteDatabase-IDBOpenDBRequest-DOMString-name
    public deleteDatabase(name: string) {
        const request = new FDBOpenDBRequest();
        request.source = null;

        const deleteAction = async () => {
            const db = await this._databases.get(name);
            const oldVersion = db !== undefined ? db.version : 0;

            await deleteDatabase(this._databases, name, request, (err) => {
                if (err) {
                    request.error = new Error();
                    request.error.name = err.name;
                    request.readyState = "done";

                    const event = new FakeEvent("error", {
                        bubbles: true,
                        cancelable: true,
                    });
                    event.eventPath = [];
                    request.dispatchEvent(event);

                    return;
                }

                request.result = undefined;
                request.readyState = "done";

                const event2 = new FDBVersionChangeEvent("success", {
                    newVersion: null,
                    oldVersion,
                });
                request.dispatchEvent(event2);
            });
        };

        this.deleteQueue.push(deleteAction);
        if (!this.deleteQueueProcessing) {
            const f = async () => {
                this.deleteQueueProcessing = true;
                while (this.deleteQueue.length > 0) {
                    await this.deleteQueue.shift()!();
                }
                this.deleteQueueProcessing = false;
            };
            f();
        }

        return request;
    }

    // tslint:disable-next-line max-line-length
    // http://www.w3.org/TR/2015/REC-IndexedDB-20150108/#widl-IDBFactory-open-IDBOpenDBRequest-DOMString-name-unsigned-long-long-version
    public open(name: string, version?: number) {
        if (arguments.length > 1 && version !== undefined) {
            // Based on spec, not sure why "MAX_SAFE_INTEGER" instead of "unsigned long long", but it's needed to pass
            // tests
            version = enforceRange(version, "MAX_SAFE_INTEGER");
        }
        if (version === 0) {
            throw new TypeError();
        }

        const request = new FDBOpenDBRequest();
        request.source = null;

        queueTask(() => {
            openDatabase(
                this.storage,
                this._databases,
                name,
                version,
                request,
                (err, connection) => {
                    if (err) {
                        request.result = undefined;
                        request.readyState = "done";

                        request.error = new Error();
                        request.error.name = err.name;

                        const event = new FakeEvent("error", {
                            bubbles: true,
                            cancelable: true,
                        });
                        event.eventPath = [];
                        request.dispatchEvent(event);

                        return;
                    }

                    request.result = connection;
                    request.readyState = "done";

                    const event2 = new FakeEvent("success");
                    event2.eventPath = [];
                    request.dispatchEvent(event2);
                }
            );
        });

        return request;
    }

    // https://w3c.github.io/IndexedDB/#dom-idbfactory-databases
    public async databases() {
        const result = [];
        for (const [name, database] of await this._databases.entries()) {
            result.push({
                name,
                version: database.version,
            });
        }
        return result;
    }

    public [Symbol.toStringTag] = "IDBFactory";
}

export default FDBFactory;
