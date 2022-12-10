import { execSync } from "node:child_process";
import path from "node:path";
import glob from "glob";

const __dirname = "src/test/web-platform-tests";
const testFolder = path.join(__dirname, "converted");

let passed = 0;
const failed = [];
let skipped = 0;

const skip = new Set([
    // Maximum call stack size exceeded, possibly due to the promise resolution microtask not taking precedence when it
    // should (keep_alive not working).
    "event-dispatch-active-flag.js",
    "transaction-deactivation-timing.js",
    "upgrade-transaction-deactivation-timing.js",

    // These are pretty tricky. Would be nice to have them working.
    "fire-error-event-exception.js",
    "fire-success-event-exception.js",
    "fire-upgradeneeded-event-exception.js",

    // Mostly works, except the last test which is edge cases
    "get-databases.any.js",

    // No Web Worker in Node.js.
    "idb-binary-key-detached.js",
    "idb_webworkers.js",

    // Mostly works, but keepAlive results in an infinite loop
    "idb-explicit-commit.any.js",

    // Not sure how to do this weird error silencing in Node.js.
    "idb-explicit-commit-throw.any.js",

    // Usually works, but there is a race condition. Sometimes the setTimeout runs before the transaction commits.
    "idbcursor-continue-exception-order.js",
    "idbcursor-delete-exception-order.js",
    "idbcursor-update-exception-order.js",

    // This might never work in Async. We don't close transactions as soon as the tests expect. These tests assume
    // that in one task (setTimeout(0)), a transaction would end if no more tasks have happened. But in our case,
    // async storage can take a while to return, might trigger callbacks, etc.
    "idbcursor-advance-exception-order.js",

    // Mostly works, but subtlely wrong behavior when renaming a newly-created index/store and then aborting the upgrade
    // transaction (this has roughly 0 real world impact, but could be indicative of other problems in fake-indexeddb).
    "idbindex-rename-abort.js",
    "idbobjectstore-rename-abort.js",
    "transaction-abort-index-metadata-revert.js",
    "transaction-abort-multiple-metadata-revert.js",
    "transaction-abort-object-store-metadata-revert.js",

    // Half works, and I don't care enough to investigate further right now.
    "idbrequest-onupgradeneeded.js",

    // db2.close() sets _closePending flag, and then that's checked in runVersionchangeTransaction resulting in an
    // AbortError. Based on https://w3c.github.io/IndexedDB/#opening this seems corret, so I'm not sure why this test is
    // supposed to work.
    "idbtransaction_objectStoreNames.js",

    // Node.js doesn't have Blob or File, and my simple mocks aren't good enough for these tests.
    "nested-cloning-large.js",
    "nested-cloning-large-multiple.js",
    "nested-cloning-small.js",

    // All kinds of fucked up.
    "open-request-queue.js",

    // Did not investigate in great detail.
    "bindings-inject-keys-bypass-setters.js",
    "bindings-inject-values-bypass-setters.js",
    "request-event-ordering.js",
    "transaction-abort-generator-revert.js",
    "transaction-lifetime-empty.js",
    "upgrade-transaction-lifecycle-backend-aborted.js",
    "upgrade-transaction-lifecycle-user-aborted.js",

    // References to DOM functions.
    "database-names-by-origin.js",
    "idbfactory-databases-opaque-origin.js",
    "idbfactory-deleteDatabase-opaque-origin.js",
    "idbfactory-open-opaque-origin.js",
    "idbfactory-origin-isolation.js",
    "idbindex-cross-realm-methods.js",
    "idbobjectstore-cross-realm-methods.js",
    "ready-state-destroyed-execution-context.js",
    "structured-clone.any.js",
    "file_support.sub.js",
    "idb-partitioned-basic.tentative.sub.js",
    "idb-partitioned-coverage.tentative.sub.js",
    "idb-partitioned-persistence.tentative.sub.js",
    "resources/idb-partitioned-persistence-iframe.tentative.js",
    "resources/idb-partitioned-basic-iframe.tentative.js",
    "resources/cross-origin-helper-frame.js",
    "resources/idbfactory-origin-isolation-iframe.js",

    // XMLHttpRequest
    "blob-contenttype.any.js",

    // Navigator
    "storage-buckets.https.any.js",

    // References to origins, etc.
    "serialize-sharedarraybuffer-throws.https.js",

    // IDB(Index|ObjectStore).batchGetAll() is pretty new.
    "idbindex_batchGetAll.tentative.any.js",
    "idbobjectstore_batchGetAll_largeValue.tentative.any.js",
    "idbobjectstore_batchGetAll.tentative.any.js",

    // Transaction Durability is pretty new
    "transaction-relaxed-durability.tentative.any.js",

    // New Tests that we should get passing
    "structured-clone-transaction-state.any.js",
    "transaction-scheduling-within-database.any.js",
]);

const filenames = glob.sync("/**/*.js", { root: testFolder });
for (const absFilename of filenames) {
    const filename = path.relative(testFolder, absFilename).replace(/\\/g, "/");
    if (skip.delete(filename)) {
        console.log(`Skipping ${filename}...`);
        skipped += 1;
        continue;
    }

    try {
        const output = execSync(`node ${filename}`, {
            cwd: testFolder,
        });
        if (output.toString().length > 0) {
            console.log(output.toString());
        }
        passed += 1;
    } catch (err) {
        console.log(`Failed at ${filename}`);
        failed.push(filename);
    }
}

if (skip.size > 0) {
    const errorMsg = `Skipped ${skipped} tests, but some "skipped" tests never ran. Are you missing some files?`;
    console.error(Array.from(skip.values()));
    throw new Error(errorMsg);
}

console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed.length}`);
console.log(`Skipped: ${skipped}\n`);

const pct = Math.round((100 * passed) / (passed + failed.length + skipped));
console.log(`Success Rate: ${pct}%`);

if (failed.length > 0) {
    console.log("Failed Tests: ", failed);
    process.exit(1);
}
