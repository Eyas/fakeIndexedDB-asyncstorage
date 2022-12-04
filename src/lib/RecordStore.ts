import { deserialize, serialize } from "serialize-anything";
import FDBKeyRange from "../FDBKeyRange.js";
import {
    getByKey,
    getByKeyRange,
    getIndexByKey,
    getIndexByKeyGTE,
    getIndexByKeyRange,
} from "./binarySearch.js";
import cmp from "./cmp.js";
import { AsyncStorage, STORAGE_PREFIX } from "./storage.js";
import { Key, Record } from "./types.js";

function ComputeKey(uniqueId: string, refId?: number) {
    if (refId === undefined) {
        return `${STORAGE_PREFIX}/recordStore/${uniqueId}`;
    }
    return `${STORAGE_PREFIX}/recordStore/${uniqueId}/ref/${refId}`;
}

/*
   value://uniqueId/ref/refId -> Value
   store://uniqueId --> refId[];
*/

interface RecordWithRef extends Record {
    r: number;
}

class RecordStore {
    private records: RecordWithRef[] = [];
    private loaded: Promise<void> | undefined;
    private nextRefId = 0;

    constructor(
        private readonly uniqueId: string,
        private readonly storage: AsyncStorage
    ) {}

    private ensureLoaded(): Promise<void> {
        if (this.loaded) {
            return this.loaded;
        }

        const load = async () => {
            const serializedRecords = await this.storage.getItem(
                "store://" + ComputeKey(this.uniqueId)
            );
            if (serializedRecords === null) return;

            const deserialized = JSON.parse(serializedRecords);
            if (!deserialized || !(deserialized instanceof Array)) return;

            const recordIds: number[] = [];
            for (
                let chunk = deserialized.splice(0, 10);
                chunk.length > 0;
                chunk = deserialized.splice(0, 10)
            ) {
                recordIds.push(...chunk);
            }

            this.records = (
                await Promise.all(
                    recordIds
                        .map(
                            (recordId) =>
                                "value://" + ComputeKey(this.uniqueId, recordId)
                        )
                        .map(this.storage.getItem)
                )
            ).map((recordStr) => {
                if (recordStr === null) throw new Error("Data Loss!!!");
                return deserialize(recordStr) as RecordWithRef;
            });
            this.nextRefId = 1 + +recordIds.reduce((a, b) => Math.max(a, b));
            if (isNaN(this.nextRefId)) {
                throw new Error("Unexpected NaN");
            }
        };

        this.loaded = load();
        return this.loaded;
    }

    private async saveSort() {
        const serialized = JSON.stringify(this.records.map((r) => r.r));
        await this.storage.setItem(
            "store://" + ComputeKey(this.uniqueId),
            serialized
        );
    }

    private async changeRecord(r: RecordWithRef) {
        const serialized = serialize(r);
        await this.storage.setItem(
            "value://" + ComputeKey(this.uniqueId, r.r),
            serialized
        );
    }

    private async deleteRecord(r: RecordWithRef) {
        await this.storage.removeItem(
            "value://" + ComputeKey(this.uniqueId, r.r)
        );
    }

    public async get(key: Key | FDBKeyRange) {
        await this.ensureLoaded();

        if (key instanceof FDBKeyRange) {
            return getByKeyRange(this.records, key);
        }

        return getByKey(this.records, key);
    }

    public async add(r: Record) {
        await this.ensureLoaded();

        const newRecord: RecordWithRef = {
            ...r,
            r: this.nextRefId++,
        };

        // Find where to put it so it's sorted by key
        let i;
        if (this.records.length === 0) {
            i = 0;
        } else {
            i = getIndexByKeyGTE(this.records, newRecord.key);

            if (i === -1) {
                // If no matching key, add to end
                i = this.records.length;
            } else {
                // If matching key, advance to appropriate position based on value (used in indexes)
                while (
                    i < this.records.length &&
                    cmp(this.records[i].key, newRecord.key) === 0
                ) {
                    if (cmp(this.records[i].value, newRecord.value) !== -1) {
                        // Record value >= newRecord value, so insert here
                        break;
                    }

                    i += 1; // Look at next record
                }
            }
        }

        this.records.splice(i, 0, newRecord);
        await this.saveSort();
        await this.changeRecord(newRecord);
    }

    public async delete(key: Key): Promise<readonly Record[]> {
        await this.ensureLoaded();

        const deletedRecords: RecordWithRef[] = [];

        const isRange = key instanceof FDBKeyRange;
        while (true) {
            const idx = isRange
                ? getIndexByKeyRange(this.records, key)
                : getIndexByKey(this.records, key);
            if (idx === -1) {
                break;
            }
            deletedRecords.push(this.records[idx]);
            this.records.splice(idx, 1);
        }
        if (deletedRecords.length > 0) {
            await Promise.all(deletedRecords.map((r) => this.deleteRecord(r)));
            await this.saveSort();
        }
        return deletedRecords;
    }

    public async deleteByValue(key: Key): Promise<readonly Record[]> {
        await this.ensureLoaded();

        const range = key instanceof FDBKeyRange ? key : FDBKeyRange.only(key);

        const deletedRecords: RecordWithRef[] = [];

        this.records = this.records.filter((record) => {
            const shouldDelete = range.includes(record.value);

            if (shouldDelete) {
                deletedRecords.push(record);
            }

            return !shouldDelete;
        });

        if (deletedRecords.length > 0) {
            await Promise.all(deletedRecords.map((r) => this.deleteRecord(r)));
            await this.saveSort();
        }

        return deletedRecords;
    }

    public async clear() {
        await this.ensureLoaded();

        const deletedRecords = this.records.slice();
        this.records = [];

        if (deletedRecords.length > 0) {
            await Promise.all(deletedRecords.map((r) => this.deleteRecord(r)));
            await this.saveSort();
        }

        return deletedRecords;
    }

    public values(
        range?: FDBKeyRange,
        direction: "next" | "prev" = "next"
    ): AsyncIterable<Record> {
        return {
            [Symbol.asyncIterator]: () => {
                const init = async () => {
                    await this.ensureLoaded();

                    let i_: number;
                    if (direction === "next") {
                        i_ = 0;
                        if (range !== undefined && range.lower !== undefined) {
                            while (this.records[i_] !== undefined) {
                                const cmpResult = cmp(
                                    this.records[i_].key,
                                    range.lower
                                );
                                if (
                                    cmpResult === 1 ||
                                    (cmpResult === 0 && !range.lowerOpen)
                                ) {
                                    break;
                                }
                                i_ += 1;
                            }
                        }
                    } else {
                        i_ = this.records.length - 1;
                        if (range !== undefined && range.upper !== undefined) {
                            while (this.records[i_] !== undefined) {
                                const cmpResult = cmp(
                                    this.records[i_].key,
                                    range.upper
                                );
                                if (
                                    cmpResult === -1 ||
                                    (cmpResult === 0 && !range.upperOpen)
                                ) {
                                    break;
                                }
                                i_ -= 1;
                            }
                        }
                    }
                    return i_;
                };

                let i!: number;
                let isInit = false;

                return {
                    next: async () => {
                        if (!isInit) {
                            i = await init();
                            isInit = true;
                        }

                        let done: boolean;
                        let value: Record | undefined;
                        if (direction === "next") {
                            value = this.records[i];
                            done = i >= this.records.length;
                            i += 1;

                            if (
                                !done &&
                                range !== undefined &&
                                range.upper !== undefined
                            ) {
                                const cmpResult = cmp(value.key, range.upper);
                                done =
                                    cmpResult === 1 ||
                                    (cmpResult === 0 && range.upperOpen);
                                if (done) {
                                    value = undefined;
                                }
                            }
                        } else {
                            value = this.records[i];
                            done = i < 0;
                            i -= 1;

                            if (
                                !done &&
                                range !== undefined &&
                                range.lower !== undefined
                            ) {
                                const cmpResult = cmp(value.key, range.lower);
                                done =
                                    cmpResult === -1 ||
                                    (cmpResult === 0 && range.lowerOpen);
                                if (done) {
                                    value = undefined;
                                }
                            }
                        }

                        return {
                            done,
                            value: value!,
                        };
                    },
                };
            },
        };
    }
}

export default RecordStore;
