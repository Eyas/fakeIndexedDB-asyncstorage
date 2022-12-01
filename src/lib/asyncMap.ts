import AsyncStorage from "@react-native-async-storage/async-storage";

const LAZY = Symbol("lazy");
type Lazy = typeof LAZY;

export class AsyncStringMap<V> {
    constructor(
        private readonly keyPrefix: string,
        private readonly _construct: (s: string) => V,
        private readonly _save: (v: V) => string
    ) {}

    private loaded = false;
    private readonly impl = new Map<string, V | Lazy>();

    private keysKey(): string {
        return `KEYS:${this.keyPrefix}/keys`;
    }
    private valueKey(key: string): string {
        return `VALUES:${this.keyPrefix}/key/${key}`;
    }

    private async construct(key: string): Promise<V> {
        const valStr = await AsyncStorage.getItem(this.valueKey(key));
        if (valStr === null) {
            throw new Error("unexpected data loss");
        }
        return this._construct(valStr);
    }
    private async save(key: string, val: V): Promise<void> {
        const valStr = this._save(val);
        await AsyncStorage.setItem(this.valueKey(key), valStr);
    }

    private async loadRecords() {
        if (this.loaded) return;

        const allKeysStr = await AsyncStorage.getItem(this.keysKey());
        if (allKeysStr !== null) {
            for (const key of JSON.parse(allKeysStr)) {
                this.impl.set(key, LAZY);
            }
        }

        this.loaded = true;
    }

    private async updateRecords() {
        await AsyncStorage.setItem(
            this.keysKey(),
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

    async *entries(): AsyncIterable<[string, V]> {
        await this.loadRecords();
        for await (let [k, v] of this.impl.entries()) {
            if (v === LAZY) {
                v = await this.construct(k);
                this.impl.set(k, v);
            }
            return [k, v];
        }
    }

    async *keys(): AsyncIterable<string> {
        await this.loadRecords();
        for (const k of this.impl.keys()) yield k;
    }

    async *values(): AsyncIterable<V> {
        for await (const [, v] of this.entries()) {
            yield v;
        }
    }
}
