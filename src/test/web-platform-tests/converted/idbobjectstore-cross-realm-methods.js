import "../wpt-env.js";

/* Delete created databases
 *
 * Go through each finished test, see if it has an associated database. Close
 * that and delete the database. */
add_completion_callback(function (tests) {
    for (var i in tests) {
        if (tests[i].db) {
            tests[i].db.close();
            self.indexedDB.deleteDatabase(tests[i].db.name);
        }
    }
});

function fail(test, desc) {
    return test.step_func(function (e) {
        if (e && e.message && e.target.error)
            assert_unreached(
                desc + " (" + e.target.error.name + ": " + e.message + ")"
            );
        else if (e && e.message)
            assert_unreached(desc + " (" + e.message + ")");
        else if (e && e.target.readyState === "done" && e.target.error)
            assert_unreached(desc + " (" + e.target.error.name + ")");
        else assert_unreached(desc);
    });
}

function createdb(test, dbname, version) {
    var rq_open = createdb_for_multiple_tests(dbname, version);
    return rq_open.setTest(test);
}

function createdb_for_multiple_tests(dbname, version) {
    var rq_open,
        fake_open = {},
        test = null,
        dbname = dbname
            ? dbname
            : "testdb-" + new Date().getTime() + Math.random();

    if (version) rq_open = self.indexedDB.open(dbname, version);
    else rq_open = self.indexedDB.open(dbname);

    function auto_fail(evt, current_test) {
        /* Fail handlers, if we haven't set on/whatever/, don't
         * expect to get event whatever. */
        rq_open.manually_handled = {};

        rq_open.addEventListener(evt, function (e) {
            if (current_test !== test) {
                return;
            }

            test.step(function () {
                if (!rq_open.manually_handled[evt]) {
                    assert_unreached("unexpected open." + evt + " event");
                }

                if (
                    e.target.result + "" == "[object IDBDatabase]" &&
                    !this.db
                ) {
                    this.db = e.target.result;

                    this.db.onerror = fail(test, "unexpected db.error");
                    this.db.onabort = fail(test, "unexpected db.abort");
                    this.db.onversionchange = fail(
                        test,
                        "unexpected db.versionchange"
                    );
                }
            });
        });
        rq_open.__defineSetter__("on" + evt, function (h) {
            rq_open.manually_handled[evt] = true;
            if (!h) rq_open.addEventListener(evt, function () {});
            else rq_open.addEventListener(evt, test.step_func(h));
        });
    }

    // add a .setTest method to the IDBOpenDBRequest object
    Object.defineProperty(rq_open, "setTest", {
        enumerable: false,
        value: function (t) {
            test = t;

            auto_fail("upgradeneeded", test);
            auto_fail("success", test);
            auto_fail("blocked", test);
            auto_fail("error", test);

            return this;
        },
    });

    return rq_open;
}

function assert_key_equals(actual, expected, description) {
    assert_equals(indexedDB.cmp(actual, expected), 0, description);
}

// Usage:
//   indexeddb_test(
//     (test_object, db_connection, upgrade_tx, open_request) => {
//        // Database creation logic.
//     },
//     (test_object, db_connection, open_request) => {
//        // Test logic.
//        test_object.done();
//     },
//     'Test case description');
function indexeddb_test(upgrade_func, open_func, description, options) {
    async_test(function (t) {
        options = Object.assign({ upgrade_will_abort: false }, options);
        var dbname = location + "-" + t.name;
        var del = indexedDB.deleteDatabase(dbname);
        del.onerror = t.unreached_func("deleteDatabase should succeed");
        var open = indexedDB.open(dbname, 1);
        open.onupgradeneeded = t.step_func(function () {
            var db = open.result;
            t.add_cleanup(function () {
                // If open didn't succeed already, ignore the error.
                open.onerror = function (e) {
                    e.preventDefault();
                };
                db.close();
                indexedDB.deleteDatabase(db.name);
            });
            var tx = open.transaction;
            upgrade_func(t, db, tx, open);
        });
        if (options.upgrade_will_abort) {
            open.onsuccess = t.unreached_func("open should not succeed");
        } else {
            open.onerror = t.unreached_func("open should succeed");
            open.onsuccess = t.step_func(function () {
                var db = open.result;
                if (open_func) open_func(t, db, open);
            });
        }
    }, description);
}

// Call with a Test and an array of expected results in order. Returns
// a function; call the function when a result arrives and when the
// expected number appear the order will be asserted and test
// completed.
function expect(t, expected) {
    var results = [];
    return (result) => {
        results.push(result);
        if (results.length === expected.length) {
            assert_array_equals(results, expected);
            t.done();
        }
    };
}

// Checks to see if the passed transaction is active (by making
// requests against the named store).
function is_transaction_active(tx, store_name) {
    try {
        const request = tx.objectStore(store_name).get(0);
        request.onerror = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };
        return true;
    } catch (ex) {
        assert_equals(
            ex.name,
            "TransactionInactiveError",
            "Active check should either not throw anything, or throw " +
                "TransactionInactiveError"
        );
        return false;
    }
}

// Keeps the passed transaction alive indefinitely (by making requests
// against the named store). Returns a function that asserts that the
// transaction has not already completed and then ends the request loop so that
// the transaction may autocommit and complete.
function keep_alive(tx, store_name) {
    let completed = false;
    tx.addEventListener("complete", () => {
        completed = true;
    });

    let keepSpinning = true;

    function spin() {
        if (!keepSpinning) return;
        tx.objectStore(store_name).get(0).onsuccess = spin;
    }
    spin();

    return () => {
        assert_false(completed, "Transaction completed while kept alive");
        keepSpinning = false;
    };
}

// Returns a new function. After it is called |count| times, |func|
// will be called.
function barrier_func(count, func) {
    let n = 0;
    return () => {
        if (++n === count) func();
    };
}

("use strict");
const KEY_EXISTING_LOWER = 1000;
const KEY_EXISTING_UPPER = 1001;
const KEY_EXISTING_RANGE = IDBKeyRange.bound(
    KEY_EXISTING_LOWER,
    KEY_EXISTING_UPPER
);
const KEY_NEWLY_ADDED = 1002;

const VALUE_EXISTING_LOWER = "VALUE_EXISTING_LOWER";
const VALUE_EXISTING_UPPER = "VALUE_EXISTING_UPPER";
const VALUE_NEWLY_ADDED = "VALUE_NEWLY_ADDED";

const testCases = [
    {
        methodName: "put",
        arguments: [KEY_NEWLY_ADDED, KEY_EXISTING_LOWER],
        validateResult: (t, e) => {
            assert_equals(e.target.result, KEY_EXISTING_LOWER);
            const rq = e.target.source.getAll();
            rq.onsuccess = t.step_func_done((e) => {
                assert_array_equals(e.target.result, [
                    KEY_NEWLY_ADDED,
                    VALUE_EXISTING_UPPER,
                ]);
            });
        },
    },
    {
        methodName: "add",
        arguments: [VALUE_NEWLY_ADDED, KEY_NEWLY_ADDED],
        validateResult: (t, e) => {
            assert_equals(e.target.result, KEY_NEWLY_ADDED);
            const rq = e.target.source.getAll();
            rq.onsuccess = t.step_func_done((e) => {
                assert_array_equals(e.target.result, [
                    VALUE_EXISTING_LOWER,
                    VALUE_EXISTING_UPPER,
                    VALUE_NEWLY_ADDED,
                ]);
            });
        },
    },
    {
        methodName: "delete",
        arguments: [KEY_EXISTING_LOWER],
        validateResult: (t, e) => {
            assert_equals(e.target.result, undefined);
            const rq = e.target.source.getAllKeys();
            rq.onsuccess = t.step_func_done((e) => {
                assert_array_equals(e.target.result, [KEY_EXISTING_UPPER]);
            });
        },
    },
    {
        methodName: "clear",
        arguments: [],
        validateResult: (t, e) => {
            assert_equals(e.target.result, undefined);
            const rq = e.target.source.count();
            rq.onsuccess = t.step_func_done((e) => {
                assert_equals(e.target.result, 0);
            });
        },
    },
    {
        methodName: "get",
        arguments: [KEY_EXISTING_UPPER],
        validateResult: (t, e) => {
            assert_equals(e.target.result, VALUE_EXISTING_UPPER);
            t.done();
        },
    },
    {
        methodName: "getKey",
        arguments: [KEY_EXISTING_LOWER],
        validateResult: (t, e) => {
            assert_equals(e.target.result, KEY_EXISTING_LOWER);
            t.done();
        },
    },
    {
        methodName: "getAll",
        arguments: [KEY_EXISTING_RANGE],
        validateResult: (t, e) => {
            assert_array_equals(e.target.result, [
                VALUE_EXISTING_LOWER,
                VALUE_EXISTING_UPPER,
            ]);
            t.done();
        },
    },
    {
        methodName: "getAllKeys",
        arguments: [KEY_EXISTING_RANGE],
        validateResult: (t, e) => {
            assert_array_equals(e.target.result, [
                KEY_EXISTING_LOWER,
                KEY_EXISTING_UPPER,
            ]);
            t.done();
        },
    },
    {
        methodName: "count",
        arguments: [],
        validateResult: (t, e) => {
            assert_equals(e.target.result, 2);
            t.done();
        },
    },
    {
        methodName: "openCursor",
        arguments: [],
        validateResult: (t, e) => {
            const cursor = e.target.result;
            assert_true(cursor instanceof IDBCursor);
            assert_equals(cursor.value, VALUE_EXISTING_LOWER);
            t.done();
        },
    },
    {
        methodName: "openKeyCursor",
        arguments: [],
        validateResult: (t, e) => {
            const cursor = e.target.result;
            assert_true(cursor instanceof IDBCursor);
            assert_equals(cursor.key, KEY_EXISTING_LOWER);
            t.done();
        },
    },
];

for (const testCase of testCases) {
    async_test((t) => {
        const iframe = document.createElement("iframe");
        iframe.onload = t.step_func(() => {
            const method =
                iframe.contentWindow.IDBObjectStore.prototype[
                    testCase.methodName
                ];
            iframe.remove();

            let db;
            const open_rq = createdb(t);
            open_rq.onupgradeneeded = t.step_func((e) => {
                db = e.target.result;
                const objectStore = db.createObjectStore("store");
                objectStore.add(VALUE_EXISTING_LOWER, KEY_EXISTING_LOWER);
                objectStore.add(VALUE_EXISTING_UPPER, KEY_EXISTING_UPPER);
            });

            open_rq.onsuccess = t.step_func(() => {
                const objectStore = db
                    .transaction("store", "readwrite", {
                        durability: "relaxed",
                    })
                    .objectStore("store");
                const rq = method.call(objectStore, ...testCase.arguments);
                rq.onsuccess = t.step_func((e) => {
                    testCase.validateResult(t, e);
                });
            });
        });
        document.body.append(iframe);
    }, `Cross-realm IDBObjectStore::${testCase.methodName}() method from detached <iframe> works as expected`);
}
