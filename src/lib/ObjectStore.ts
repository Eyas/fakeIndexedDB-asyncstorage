import { deserialize, serialize } from "serialize-anything";
import FDBKeyRange from "../FDBKeyRange.js";
import { AsyncStringMap2, AsyncStringMap2Builder } from "./asyncMap.js";
import Database from "./Database.js";
import { ConstraintError, DataError } from "./errors.js";
import extractKey from "./extractKey.js";
import Index from "./Index.js";
import KeyGenerator from "./KeyGenerator.js";
import RecordStore from "./RecordStore.js";
import { AsyncStorage, STORAGE_PREFIX } from "./storage.js";
import { Key, KeyPath, Record, RollbackLog } from "./types.js";

function RawIndexesBuilder(
    storage: AsyncStorage,
    objectStore: ObjectStore
): AsyncStringMap2Builder<Index> {
    type DiskFormat = {
        indexName: string;
        keyPath: KeyPath;
        multiEntry: boolean;
        unique: boolean;
    };

    return {
        storage,
        keyPrefix: `${STORAGE_PREFIX}/raw_indexes/${objectStore.rawDatabase.name}/store/${objectStore.name}/`,
        construct(str): Index {
            const { keyPath, multiEntry, unique, indexName } = deserialize(
                str
            ) as DiskFormat;
            return new Index(
                objectStore,
                indexName,
                keyPath,
                multiEntry,
                unique
            );
        },
        save(idx: Index): string {
            const diskFormat: DiskFormat = {
                indexName: idx.name,
                keyPath: idx.keyPath,
                multiEntry: idx.multiEntry,
                unique: idx.unique,
            };
            return serialize(diskFormat);
        },
    };
}

// http://www.w3.org/TR/2015/REC-IndexedDB-20150108/#dfn-object-store
class ObjectStore {
    public deleted = false;
    public readonly rawDatabase: Database;
    public readonly records: RecordStore;
    public name: string;
    public readonly keyPath: KeyPath | null;
    public readonly autoIncrement: boolean;
    public readonly keyGenerator: KeyGenerator | null;

    public static async build(
        db: Database,
        storeName: string,
        keyPath: KeyPath | null,
        autoIncrement: boolean
    ): Promise<ObjectStore> {
        const objectStore = new ObjectStore(
            db,
            storeName,
            keyPath,
            autoIncrement,
            null!
        );
        objectStore.rawIndexes = await AsyncStringMap2.construct(
            RawIndexesBuilder(db.storage, objectStore)
        );
        return objectStore;
    }

    public static createNew(
        db: Database,
        storeName: string,
        keyPath: KeyPath | null,
        autoIncrement: boolean
    ): ObjectStore {
        const objectStore = new ObjectStore(
            db,
            storeName,
            keyPath,
            autoIncrement,
            null!
        );
        objectStore.rawIndexes = AsyncStringMap2.createNew(
            RawIndexesBuilder(db.storage, objectStore)
        );
        return objectStore;
    }

    private constructor(
        rawDatabase: Database,
        name: string,
        keyPath: KeyPath | null,
        autoIncrement: boolean,
        public rawIndexes: AsyncStringMap2<Index>
    ) {
        this.rawDatabase = rawDatabase;
        this.records = new RecordStore(
            `RS/${rawDatabase.name}/${name}`,
            rawDatabase.storage
        );
        this.keyGenerator = autoIncrement === true ? new KeyGenerator() : null;
        this.deleted = false;

        this.name = name;
        this.keyPath = keyPath;
        this.autoIncrement = autoIncrement;
    }

    // http://www.w3.org/TR/2015/REC-IndexedDB-20150108/#dfn-steps-for-retrieving-a-value-from-an-object-store
    public async getKey(key: FDBKeyRange | Key) {
        const record = await this.records.get(key);

        return record !== undefined ? structuredClone(record.key) : undefined;
    }

    // http://w3c.github.io/IndexedDB/#retrieve-multiple-keys-from-an-object-store
    public async getAllKeys(range: FDBKeyRange, count?: number) {
        if (count === undefined || count === 0) {
            count = Infinity;
        }

        const records = [];
        for await (const record of this.records.values(range)) {
            records.push(structuredClone(record.key));
            if (records.length >= count) {
                break;
            }
        }

        return records;
    }

    // http://www.w3.org/TR/2015/REC-IndexedDB-20150108/#dfn-steps-for-retrieving-a-value-from-an-object-store
    public async getValue(key: FDBKeyRange | Key) {
        const record = await this.records.get(key);

        return record !== undefined ? structuredClone(record.value) : undefined;
    }

    // http://w3c.github.io/IndexedDB/#retrieve-multiple-values-from-an-object-store
    public async getAllValues(range: FDBKeyRange, count?: number) {
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

    // http://www.w3.org/TR/2015/REC-IndexedDB-20150108/#dfn-steps-for-storing-a-record-into-an-object-store
    public async storeRecord(
        newRecord: Record,
        noOverwrite: boolean,
        rollbackLog?: RollbackLog
    ) {
        if (this.keyPath !== null) {
            const key = extractKey(this.keyPath, newRecord.value);
            if (key !== undefined) {
                newRecord.key = key;
            }
        }

        if (this.keyGenerator !== null && newRecord.key === undefined) {
            if (rollbackLog) {
                const keyGeneratorBefore = this.keyGenerator.num;
                rollbackLog.push(() => {
                    if (this.keyGenerator) {
                        this.keyGenerator.num = keyGeneratorBefore;
                    }
                });
            }

            newRecord.key = this.keyGenerator.next();

            // Set in value if keyPath defiend but led to no key
            // http://www.w3.org/TR/2015/REC-IndexedDB-20150108/#dfn-steps-to-assign-a-key-to-a-value-using-a-key-path
            if (this.keyPath !== null) {
                if (Array.isArray(this.keyPath)) {
                    throw new Error(
                        "Cannot have an array key path in an object store with a key generator"
                    );
                }
                let remainingKeyPath = this.keyPath;
                let object = newRecord.value;
                let identifier;

                let i = 0; // Just to run the loop at least once
                while (i >= 0) {
                    if (typeof object !== "object") {
                        throw new DataError();
                    }

                    i = remainingKeyPath.indexOf(".");
                    if (i >= 0) {
                        identifier = remainingKeyPath.slice(0, i);
                        remainingKeyPath = remainingKeyPath.slice(i + 1);

                        if (!object.hasOwnProperty(identifier)) {
                            object[identifier] = {};
                        }

                        object = object[identifier];
                    }
                }

                identifier = remainingKeyPath;

                object[identifier] = newRecord.key;
            }
        } else if (
            this.keyGenerator !== null &&
            typeof newRecord.key === "number"
        ) {
            this.keyGenerator.setIfLarger(newRecord.key);
        }

        const existingRecord = await this.records.get(newRecord.key);
        if (existingRecord) {
            if (noOverwrite) {
                throw new ConstraintError();
            }
            await this.deleteRecord(newRecord.key, rollbackLog);
        }

        this.records.add(newRecord);

        if (rollbackLog) {
            rollbackLog.push(async () => {
                await this.deleteRecord(newRecord.key);
            });
        }

        // Update indexes
        for await (const rawIndex of this.rawIndexes.values()) {
            if (rawIndex.initialized) {
                await rawIndex.storeRecord(newRecord);
            }
        }

        return newRecord.key;
    }

    // http://www.w3.org/TR/2015/REC-IndexedDB-20150108/#dfn-steps-for-deleting-records-from-an-object-store
    public async deleteRecord(key: Key, rollbackLog?: RollbackLog) {
        const deletedRecords = await this.records.delete(key);

        if (rollbackLog) {
            for (const record of deletedRecords) {
                rollbackLog.push(async () => {
                    await this.storeRecord(record, true);
                });
            }
        }

        for await (const rawIndex of this.rawIndexes.values()) {
            rawIndex.records.deleteByValue(key);
        }
    }

    // http://www.w3.org/TR/2015/REC-IndexedDB-20150108/#dfn-steps-for-clearing-an-object-store
    public async clear(rollbackLog: RollbackLog) {
        const deletedRecords = await this.records.clear();

        if (rollbackLog) {
            for (const record of deletedRecords) {
                rollbackLog.push(async () => {
                    await this.storeRecord(record, true);
                });
            }
        }

        for await (const rawIndex of this.rawIndexes.values()) {
            rawIndex.records.clear();
        }
    }
}

export default ObjectStore;
