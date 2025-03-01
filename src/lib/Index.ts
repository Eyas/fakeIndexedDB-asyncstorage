import FDBKeyRange from "../FDBKeyRange.js";
import FDBTransaction from "../FDBTransaction.js";
import { ConstraintError } from "./errors.js";
import extractKey from "./extractKey.js";
import ObjectStore from "./ObjectStore.js";
import RecordStore from "./RecordStore.js";
import { Key, KeyPath, Record } from "./types.js";
import valueToKey from "./valueToKey.js";

// http://www.w3.org/TR/2015/REC-IndexedDB-20150108/#dfn-index
class Index {
    public deleted = false;
    // Initialized should be used to decide whether to throw an error or abort the versionchange transaction when there is a
    // constraint
    public initialized = false;
    public readonly rawObjectStore: ObjectStore;
    public readonly records: RecordStore;
    public name: string;
    public readonly keyPath: KeyPath;
    public multiEntry: boolean;
    public unique: boolean;

    constructor(
        rawObjectStore: ObjectStore,
        name: string,
        keyPath: KeyPath,
        multiEntry: boolean,
        unique: boolean
    ) {
        this.rawObjectStore = rawObjectStore;
        this.records = new RecordStore(
            `IX/${rawObjectStore.rawDatabase.name}/${rawObjectStore.name}/${name}`,
            rawObjectStore.rawDatabase.storage
        );

        this.name = name;
        this.keyPath = keyPath;
        this.multiEntry = multiEntry;
        this.unique = unique;
    }

    // http://www.w3.org/TR/2015/REC-IndexedDB-20150108/#dfn-steps-for-retrieving-a-value-from-an-index
    public async getKey(key: FDBKeyRange | Key) {
        const record = await this.records.get(key);

        return record !== undefined ? record.value : undefined;
    }

    // http://w3c.github.io/IndexedDB/#retrieve-multiple-referenced-values-from-an-index
    public async getAllKeys(range: FDBKeyRange, count?: number) {
        if (count === undefined || count === 0) {
            count = Infinity;
        }

        const records = [];
        for await (const record of this.records.values(range)) {
            records.push(structuredClone(record.value));
            if (records.length >= count) {
                break;
            }
        }

        return records;
    }

    // http://www.w3.org/TR/2015/REC-IndexedDB-20150108/#index-referenced-value-retrieval-operation
    public async getValue(key: FDBKeyRange | Key) {
        const record = await this.records.get(key);

        return record !== undefined
            ? this.rawObjectStore.getValue(record.value)
            : undefined;
    }

    // http://w3c.github.io/IndexedDB/#retrieve-multiple-referenced-values-from-an-index
    public async getAllValues(range: FDBKeyRange, count?: number) {
        if (count === undefined || count === 0) {
            count = Infinity;
        }

        const records = [];
        for await (const record of this.records.values(range)) {
            records.push(this.rawObjectStore.getValue(record.value));
            if (records.length >= count) {
                break;
            }
        }

        return Promise.all(records);
    }

    // http://www.w3.org/TR/2015/REC-IndexedDB-20150108/#dfn-steps-for-storing-a-record-into-an-object-store (step 7)
    public async storeRecord(newRecord: Record) {
        let indexKey;
        try {
            indexKey = extractKey(this.keyPath, newRecord.value);
        } catch (err) {
            if (err.name === "DataError") {
                // Invalid key is not an actual error, just means we do not store an entry in this index
                return;
            }

            throw err;
        }

        if (!this.multiEntry || !Array.isArray(indexKey)) {
            try {
                valueToKey(indexKey);
            } catch (e) {
                return;
            }
        } else {
            // remove any elements from index key that are not valid keys and remove any duplicate elements from index
            // key such that only one instance of the duplicate value remains.
            const keep = [];
            for (const part of indexKey) {
                if (keep.indexOf(part) < 0) {
                    try {
                        keep.push(valueToKey(part));
                    } catch (err) {
                        /* Do nothing */
                    }
                }
            }
            indexKey = keep;
        }

        if (!this.multiEntry || !Array.isArray(indexKey)) {
            if (this.unique) {
                const existingRecord = await this.records.get(indexKey);
                if (existingRecord) {
                    throw ConstraintError();
                }
            }
        } else {
            if (this.unique) {
                for (const individualIndexKey of indexKey) {
                    const existingRecord = await this.records.get(
                        individualIndexKey
                    );
                    if (existingRecord) {
                        throw ConstraintError();
                    }
                }
            }
        }

        if (!this.multiEntry || !Array.isArray(indexKey)) {
            this.records.add({
                key: indexKey,
                value: newRecord.key,
            });
        } else {
            for (const individualIndexKey of indexKey) {
                this.records.add({
                    key: individualIndexKey,
                    value: newRecord.key,
                });
            }
        }
    }

    public initialize(transaction: FDBTransaction) {
        if (this.initialized) {
            throw new Error("Index already initialized");
        }

        transaction._execRequestAsync({
            operation: async () => {
                try {
                    // Create index based on current value of objectstore
                    for await (const record of this.rawObjectStore.records.values()) {
                        await this.storeRecord(record);
                    }

                    this.initialized = true;
                } catch (err) {
                    transaction._runImmediateRollback();
                    await transaction._abort(err);
                }
            },
            source: null,
        });
    }
}

export default Index;
