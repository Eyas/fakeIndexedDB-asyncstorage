import FDBDatabase from "../FDBDatabase.js";
import FDBTransaction from "../FDBTransaction.js";
import { deserialize, serialize } from "../serial/serial.js";
import { AsyncStringMap2 } from "./asyncMap.js";
import ObjectStore from "./ObjectStore.js";
import { queueTask } from "./scheduling.js";
import { AsyncStorage, STORAGE_PREFIX } from "./storage.js";
import { KeyPath } from "./types.js";

type TypeOfMap = {
    string: string;
    number: number;
};

function assertTypeof<T extends keyof TypeOfMap>(
    s: unknown,
    type: T
): asserts s is TypeOfMap[T] {
    if (typeof s !== type) throw new Error(`expected ${type}, saw, ${s}`);
}

// http://www.w3.org/TR/2015/REC-IndexedDB-20150108/#dfn-database
class Database {
    public deletePending = false;
    public readonly transactions: FDBTransaction[] = [];
    public connections: FDBDatabase[] = [];

    public readonly name: string;
    public version: number;

    public static getConstruct(
        storage: AsyncStorage
    ): (serialized: string) => Promise<Database> {
        return (serialized: string): Promise<Database> => {
            const { name, version } = JSON.parse(serialized);
            assertTypeof(name, "string");
            assertTypeof(version, "number");

            return Database.build(storage, name, version);
        };
    }

    public static async build(
        storage: AsyncStorage,
        name: string,
        version: number
    ) {
        type DiskFormat = {
            objectStoreName: string;
            keyPath: string | string[] | null;
            autoIncrement: boolean;
        };

        const db: Database = new Database(name, version, null!, storage);
        db.rawObjectStores = await AsyncStringMap2.construct({
            storage,
            keyPrefix: `${STORAGE_PREFIX}/${name}/rawObjectStores/`,
            construct(s) {
                const { objectStoreName, keyPath, autoIncrement } = deserialize(
                    JSON.parse(s)
                ) as DiskFormat;
                return ObjectStore.build(
                    db,
                    objectStoreName,
                    keyPath,
                    autoIncrement
                );
            },
            async save(s) {
                const diskFormat: DiskFormat = {
                    objectStoreName: s.name,
                    keyPath:
                        s.keyPath &&
                        (Array.isArray(s.keyPath)
                            ? s.keyPath
                            : String(s.keyPath)),
                    autoIncrement: s.autoIncrement,
                };
                return JSON.stringify(await serialize(diskFormat));
            },
        });
        return db;
    }

    public static save(database: Database): string {
        return JSON.stringify({
            name: database.name,
            version: database.version,
        });
    }

    constructor(
        name: string,
        version: number,
        public rawObjectStores: AsyncStringMap2<ObjectStore>,
        public readonly storage: AsyncStorage
    ) {
        this.name = name;
        this.version = version;
        this.processTransactions = this.processTransactions.bind(this);
    }

    public processTransactions() {
        queueTask(() => {
            const anyRunning = this.transactions.some((transaction) => {
                return (
                    transaction._started && transaction._state !== "finished"
                );
            });

            if (!anyRunning) {
                const next = this.transactions.find((transaction) => {
                    return (
                        !transaction._started &&
                        transaction._state !== "finished"
                    );
                });

                if (next) {
                    next.addEventListener("complete", this.processTransactions);
                    next.addEventListener("abort", this.processTransactions);
                    next._start();
                }
            }
        });
    }
}

export default Database;
