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

function ComputeKey(uniqueId: string) {
    return `${STORAGE_PREFIX}/recordStore/${uniqueId}`;
}

class RecordStore {
    private records: Record[] = [];
    private loaded = false;

    constructor(
        private readonly uniqueId: string,
        private readonly storage: AsyncStorage
    ) {}

    private async ensureLoaded() {
        if (this.loaded) return;

        const serializedRecords = await this.storage.getItem(
            ComputeKey(this.uniqueId)
        );
        if (serializedRecords === null) return;

        const deserialized = deserialize(serializedRecords);

        if (!deserialized || !(deserialized instanceof Array)) return;
        for (
            let chunk = deserialized.splice(0, 10);
            chunk.length > 0;
            chunk = deserialized.splice(0, 10)
        ) {
            this.records.push(...chunk);
        }
    }

    private async reflectUpdate() {
        const serialized = serialize(this.records);
        await this.storage.setItem(ComputeKey(this.uniqueId), serialized);
    }

    public async get(key: Key | FDBKeyRange) {
        await this.ensureLoaded();

        if (key instanceof FDBKeyRange) {
            return getByKeyRange(this.records, key);
        }

        return getByKey(this.records, key);
    }

    public async add(newRecord: Record) {
        await this.ensureLoaded();

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
        await this.reflectUpdate();
    }

    public async delete(key: Key) {
        await this.ensureLoaded();

        const deletedRecords: Record[] = [];

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
            await this.reflectUpdate();
        }
        return deletedRecords;
    }

    public async deleteByValue(key: Key) {
        await this.ensureLoaded();

        const range = key instanceof FDBKeyRange ? key : FDBKeyRange.only(key);

        const deletedRecords: Record[] = [];

        this.records = this.records.filter((record) => {
            const shouldDelete = range.includes(record.value);

            if (shouldDelete) {
                deletedRecords.push(record);
            }

            return !shouldDelete;
        });

        if (deletedRecords.length > 0) {
            await this.reflectUpdate();
        }

        return deletedRecords;
    }

    public async clear() {
        await this.ensureLoaded();

        const deletedRecords = this.records.slice();
        this.records = [];

        if (deletedRecords.length > 0) {
            await this.reflectUpdate();
        }

        return deletedRecords;
    }

    public values(range?: FDBKeyRange, direction: "next" | "prev" = "next") {
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

                        let done;
                        let value;
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

                        // The weird "as IteratorResult<Record>" is needed because of
                        // https://github.com/Microsoft/TypeScript/issues/11375 and
                        // https://github.com/Microsoft/TypeScript/issues/2983
                        // tslint:disable-next-line no-object-literal-type-assertion
                        return {
                            done,
                            value,
                        } as IteratorResult<Record>;
                    },
                };
            },
        };
    }
}

export default RecordStore;
