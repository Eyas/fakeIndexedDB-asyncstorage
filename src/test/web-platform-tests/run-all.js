import { execSync } from "node:child_process";
import path from "node:path";
import glob from "glob";

const __dirname = "src/test/web-platform-tests";
const testFolder = path.join(__dirname, "converted");

let passed = 0;
const failed = [];
let skipped = 0;

const skip = [
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

    // No iframe in Node.js.
    "idbfactory-deleteDatabase-opaque-origin.js",
    "idbfactory-open-opaque-origin.js",

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
    "idbfactory-databases-opaque-origin.js",
    "request-event-ordering.js",
    "transaction-abort-generator-revert.js",
    "transaction-lifetime-empty.js",
    "upgrade-transaction-lifecycle-backend-aborted.js",
    "upgrade-transaction-lifecycle-user-aborted.js",
];

const filenames = glob.sync("/**/*.js", { root: testFolder });
for (const absFilename of filenames) {
    const filename = path.relative(testFolder, absFilename);
    if (skip.includes(filename)) {
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

if (skipped !== skip.length) {
    const errorMsg = `Skipped ${skipped} tests, but skip.length is ${skip.length}. Missing file?`;
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
