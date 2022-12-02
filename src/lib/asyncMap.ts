/* tslint:disable:max-classes-per-file */

import { AsyncStorage } from "./storage";

const LAZY = Symbol("lazy");
type Lazy = typeof LAZY;

function keysKey(keyPrefix: string): string {
    return `${keyPrefix}/keys/`;
}
function valueKey(keyPrefix: string, key: string): string {
    return `${keyPrefix}/values/key=${key}/`;
}

function makeMarshallers<V>(
    storage: AsyncStorage,
    keyPrefix: string,
    _construct: (s: string) => V | Promise<V>,
    _save: (v: V) => string | Promise<string>
) {
    return {
        async construct(key: string): Promise<V> {
            const valStr = await storage.getItem(valueKey(keyPrefix, key));
            if (valStr === null) {
                throw new Error("unexpected data loss");
            }
            return _construct(valStr);
        },

        async save(key: string, val: V): Promise<void> {
            const valStr = _save(val);
            await storage.setItem(valueKey(keyPrefix, key), await valStr);
        },

        remove(key: string): Promise<void> {
            return storage.removeItem(valueKey(keyPrefix, key));
        },
    };
}

export class AsyncStringMap<V> {
    constructor(
        private readonly storage: AsyncStorage,
        private readonly keyPrefix: string,
        _construct: (s: string) => V | Promise<V>,
        _save: (v: V) => string | Promise<string>
    ) {
        const m = makeMarshallers(storage, keyPrefix, _construct, _save);
        this.construct = m.construct;
        this.save = m.save;
    }

    private loaded = false;
    private readonly impl = new Map<string, V | Lazy>();

    private construct: (key: string) => Promise<V>;
    private save: (key: string, val: V) => Promise<void>;

    private async loadRecords() {
        if (this.loaded) return;

        const allKeysStr = await this.storage.getItem(keysKey(this.keyPrefix));
        if (allKeysStr !== null) {
            for (const key of JSON.parse(allKeysStr)) {
                this.impl.set(key, LAZY);
            }
        }

        this.loaded = true;
    }

    private async updateRecords() {
        await this.storage.setItem(
            keysKey(this.keyPrefix),
            JSON.stringify(Array.from(this.impl.keys()))
        );
    }

    async get(key: string): Promise<V | undefined> {
        await this.loadRecords();
        const v = this.impl.get(key);
        if (v === undefined) return undefined;
        if (v === LAZY) {
            const result = await this.construct(key);
            this.impl.set(key, result);
            return result;
        }
        return v;
    }

    async has(key: string): Promise<boolean> {
        await this.loadRecords();
        return this.impl.has(key);
    }

    async set(key: string, value: V): Promise<void> {
        await this.loadRecords();
        const updateRecords = this.impl.has(key);
        this.impl.set(key, value);

        await this.save(key, value);
        if (updateRecords) {
            await this.updateRecords();
        }
    }

    async delete(key: string): Promise<void> {
        await this.loadRecords();

        const shouldUpdateRecords = this.impl.delete(key);
        if (shouldUpdateRecords) {
            await this.updateRecords();
        }
    }

    async entries(): Promise<readonly [string, V][]> {
        await this.loadRecords();
        return Promise.all(
            Array.from(this.impl.entries()).map(async ([k, v]) => {
                if (v === LAZY) {
                    v = await this.construct(k);
                    this.impl.set(k, v);
                }
                return [k, v];
            })
        );
    }

    async keys(): Promise<readonly string[]> {
        await this.loadRecords();
        return Array.from(this.impl.keys());
    }

    async values(): Promise<readonly V[]> {
        return (await this.entries()).map(([, v]) => v);
    }
}

export interface AsyncStringMap2Builder<V> {
    storage: AsyncStorage;
    keyPrefix: string;
    construct: (s: string) => V | Promise<V>;
    save: (v: V) => string | Promise<string>;
}

export class AsyncStringMap2<V> {
    public static async construct<V>({
        storage,
        keyPrefix,
        construct: c,
        save: s,
    }: AsyncStringMap2Builder<V>) {
        const allKeysStr = await storage.getItem(keysKey(keyPrefix));
        const allKeys: string[] = allKeysStr ? JSON.parse(allKeysStr) : [];

        const m = makeMarshallers(storage, keyPrefix, c, s);

        const entries = await Promise.all(
            allKeys.map(
                async (key) => [key, (await m.construct(key)) as V] as const
            )
        );
        const map = new Map(entries);

        return new AsyncStringMap2(storage, keyPrefix, m, map);
    }

    public static createNew<V>({
        storage,
        keyPrefix,
        construct: c,
        save: s,
    }: AsyncStringMap2Builder<V>) {
        const m = makeMarshallers(storage, keyPrefix, c, s);
        const map = new Map();

        return new AsyncStringMap2(storage, keyPrefix, m, map);
    }

    private constructor(
        private readonly storage: AsyncStorage,
        private readonly keyPrefix: string,
        private readonly marshaller: ReturnType<typeof makeMarshallers<V>>,
        private readonly impl: Map<string, V>
    ) {}

    private async updateRecords() {
        await this.storage.setItem(
            keysKey(this.keyPrefix),
            JSON.stringify(Array.from(this.impl.keys()))
        );
    }

    get(key: string): V | undefined {
        return this.impl.get(key);
    }

    has(key: string): boolean {
        return this.impl.has(key);
    }

    async set(key: string, value: V): Promise<void> {
        const shouldUpdateRecords = !this.impl.has(key);
        this.impl.set(key, value);

        await this.marshaller.save(key, value);
        if (shouldUpdateRecords) {
            await this.updateRecords();
        }
    }

    async delete(key: string): Promise<void> {
        const shouldUpdateRecords = this.impl.delete(key);
        if (shouldUpdateRecords) {
            await this.updateRecords();
        }
    }

    entries() {
        return this.impl.entries();
    }

    keys() {
        return this.impl.keys();
    }

    values() {
        return this.impl.values();
    }
}
