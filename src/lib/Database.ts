import FDBDatabase from "../FDBDatabase.js";
import FDBTransaction from "../FDBTransaction.js";
import { AsyncStringMap } from "./asyncMap.js";
import ObjectStore from "./ObjectStore.js";
import { queueTask } from "./scheduling.js";

// http://www.w3.org/TR/2015/REC-IndexedDB-20150108/#dfn-database
class Database {
    public deletePending = false;
    public readonly transactions: FDBTransaction[] = [];
    public readonly rawObjectStores: AsyncStringMap<ObjectStore>;
    public connections: FDBDatabase[] = [];

    public readonly name: string;
    public version: number;

    constructor(name: string, version: number) {
        const self = this;
        this.name = name;
        this.version = version;
        this.rawObjectStores = new AsyncStringMap(
            `FIDB:AsyncStorage/v0/rawObjectStores/${this.name}`,
            function construct(s) {
                const { name, keyPath, autoIncrement } = JSON.parse(s);
                return new ObjectStore(self, name, keyPath, autoIncrement);
            },
            function save(s) {
                return JSON.stringify({
                    name: s.name,
                    keyPath: s.keyPath,
                    autoIncrement: s.autoIncrement,
                });
            }
        );

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
