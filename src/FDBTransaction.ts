import { buildCursor } from "./FDBCursor.js";
import { buildCursorWithValue } from "./FDBCursorWithValue.js";
import FDBDatabase from "./FDBDatabase.js";
import FDBObjectStore from "./FDBObjectStore.js";
import FDBRequest from "./FDBRequest.js";
import {
    AbortError,
    InvalidStateError,
    NotFoundError,
    TransactionInactiveError,
} from "./lib/errors.js";
import FakeDOMStringList from "./lib/FakeDOMStringList.js";
import FakeEvent from "./lib/FakeEvent.js";
import FakeEventTarget from "./lib/FakeEventTarget.js";
import { queueTask } from "./lib/scheduling.js";
import {
    EventCallback,
    RequestObj,
    RollbackLog,
    TransactionMode,
} from "./lib/types.js";

// http://www.w3.org/TR/2015/REC-IndexedDB-20150108/#transaction
class FDBTransaction extends FakeEventTarget {
    public _state:
        | "active"
        | "aborting"
        | "inactive"
        | "committing"
        | "finished" = "active";
    public _started = false;
    public _rollbackLog: RollbackLog = {
        immediate: [],
        transactional: [],
    };
    public _objectStoresCache: Map<string, FDBObjectStore> = new Map();

    public objectStoreNames: FakeDOMStringList;
    public mode: TransactionMode;
    public db: FDBDatabase;
    public error: Error | null = null;
    public onabort: EventCallback | null = null;
    public oncomplete: EventCallback | null = null;
    public onerror: EventCallback | null = null;

    public durability: "default" | "relaxed" | "strict" = "default";

    public _scope: Set<string>;
    private _requests: {
        operation: () => unknown | Promise<unknown>;
        request: FDBRequest;
    }[] = [];

    constructor(storeNames: string[], mode: TransactionMode, db: FDBDatabase) {
        super();

        this._scope = new Set(storeNames);
        this.mode = mode;
        this.db = db;
        this.objectStoreNames = new FakeDOMStringList(
            ...Array.from(this._scope).sort()
        );
    }

    public _runImmediateRollback() {
        for (const f of this._rollbackLog.immediate.reverse()) {
            f();
        }
    }

    // http://www.w3.org/TR/2015/REC-IndexedDB-20150108/#dfn-steps-for-aborting-a-transaction
    public async _abort(error: DOMException | null) {
        for (const f of this._rollbackLog.transactional.reverse()) {
            await f();
        }

        if (error !== null) {
            this.error = error;
        }

        // Should this directly remove from _requests?
        for (const { request } of this._requests) {
            if (request.readyState !== "done") {
                request.readyState = "done"; // This will cancel execution of this request's operation
                if (request.source) {
                    request.result = undefined;
                    request.error = AbortError();

                    const event = new FakeEvent("error", {
                        bubbles: true,
                        cancelable: true,
                    });
                    event.eventPath = [this.db, this];
                    request.dispatchEvent(event);
                }
            }
        }

        queueTask(() => {
            const event = new FakeEvent("abort", {
                bubbles: true,
                cancelable: false,
            });
            event.eventPath = [this.db];
            this.dispatchEvent(event);
        });

        this._state = "finished";
    }

    public abort() {
        if (this._state === "committing" || this._state === "finished") {
            throw InvalidStateError();
        }
        this._runImmediateRollback();
        this._state = "aborting";

        // Kick off abort ASAP before any other action.
        this._requests.unshift({
            operation: this._abort.bind(this, null),
            request: new FDBRequest(),
        });
    }

    // http://w3c.github.io/IndexedDB/#dom-idbtransaction-objectstore
    public objectStore(name: string) {
        if (this._state !== "active") {
            throw InvalidStateError();
        }

        const objectStore = this._objectStoresCache.get(name);
        if (objectStore !== undefined) {
            return objectStore;
        }

        const rawObjectStore = this.db._rawDatabase.rawObjectStores.get(name);
        if (!this._scope.has(name) || rawObjectStore === undefined) {
            throw NotFoundError();
        }

        const objectStore2 = new FDBObjectStore(
            this,
            rawObjectStore,
            buildCursor,
            buildCursorWithValue
        );
        this._objectStoresCache.set(name, objectStore2);

        return objectStore2;
    }

    // http://www.w3.org/TR/2015/REC-IndexedDB-20150108/#dfn-steps-for-asynchronously-executing-a-request
    public _execRequestAsync(obj: RequestObj) {
        const source = obj.source;
        const operation = obj.operation;
        let request = obj.hasOwnProperty("request") ? obj.request : null;

        if (this._state !== "active") {
            throw TransactionInactiveError();
        }

        // Request should only be passed for cursors
        if (!request) {
            if (!source) {
                // Special requests like indexes that just need to run some code
                request = new FDBRequest();
            } else {
                request = new FDBRequest();
                request.source = source;
                request.transaction = (source as any).transaction;
            }
        }

        this._requests.push({
            operation,
            request,
        });

        return request;
    }

    public async _start() {
        this._started = true;

        // Remove from request queue - cursor ones will be added back if necessary by cursor.continue and such
        let operation;
        let request;
        while (this._requests.length > 0) {
            const r = this._requests.shift();

            // This should only be false if transaction was aborted
            if (r && r.request.readyState !== "done") {
                request = r.request;
                operation = r.operation;
                break;
            }
        }

        if (request && operation) {
            if (!request.source) {
                // Special requests like indexes that just need to run some code, with error handling already built into
                // operation
                await operation();
            } else {
                let defaultAction: undefined | (() => Promise<void>);
                let event;
                try {
                    const result = await operation();
                    request.readyState = "done";
                    request.result = result;
                    request.error = undefined;

                    // http://www.w3.org/TR/2015/REC-IndexedDB-20150108/#dfn-fire-a-success-event
                    if (this._state === "inactive") {
                        this._state = "active";
                    }
                    event = new FakeEvent("success", {
                        bubbles: false,
                        cancelable: false,
                    });
                } catch (err) {
                    request.readyState = "done";
                    request.result = undefined;
                    request.error = err;

                    // http://www.w3.org/TR/2015/REC-IndexedDB-20150108/#dfn-fire-an-error-event
                    if (this._state === "inactive") {
                        this._state = "active";
                    }
                    event = new FakeEvent("error", {
                        bubbles: true,
                        cancelable: true,
                    });

                    defaultAction = () => {
                        this._runImmediateRollback();
                        return this._abort(err);
                    };
                }

                try {
                    event.eventPath = [this.db, this];
                    request.dispatchEvent(event);
                } catch (err) {
                    if (this._state !== "committing") {
                        this._runImmediateRollback();
                        await this._abort(AbortError());
                    }
                    throw err;
                }

                // Default action of event
                if (!event.canceled) {
                    if (defaultAction) {
                        await defaultAction();
                    }
                }
            }

            // Give it another chance for new handlers to be set before finishing
            queueTask(this._start.bind(this));
            return;
        }

        // Check if transaction complete event needs to be fired
        if (this._state !== "finished" && this._state !== "aborting") {
            // Either aborted or committed already
            this._state = "finished";

            if (!this.error) {
                const event = new FakeEvent("complete");
                this.dispatchEvent(event);
            }
        }
    }

    public commit() {
        if (this._state !== "active") {
            throw InvalidStateError();
        }

        this._state = "committing";
    }

    public [Symbol.toStringTag] = "IDBRequest";
}

export default FDBTransaction;
