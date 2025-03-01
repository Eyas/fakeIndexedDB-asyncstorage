import "../wpt-env.js";

async_test(function (t) {
    var dbname = document.location + "-" + t.name;
    var del = indexedDB.deleteDatabase(dbname);
    del.onerror = t.unreached_func("deleteDatabase should succeed");
    var open = indexedDB.open(dbname);
    open.onerror = t.unreached_func("open should succeed");

    open.onupgradeneeded = t.step_func(function () {
        var db = open.result;
        t.add_cleanup(function () {
            db.close();
            indexedDB.deleteDatabase(db.name);
        });
        var store = db.createObjectStore("store");
        store.put("a", 1).onerror = t.unreached_func("put should not fail");
        var request = store.openCursor();
        request.onerror = t.unreached_func("openCursor should not fail");
        request.onsuccess = t.step_func(function () {
            var cursor = request.result;
            assert_class_string(
                cursor,
                "IDBCursorWithValue",
                "result should be a cursor"
            );

            assert_throws_dom(
                "InvalidAccessError",
                function () {
                    cursor.continuePrimaryKey(2, 2);
                },
                "continuePrimaryKey() should throw if source is not an index"
            );
        });
    });

    open.onsuccess = t.step_func(function () {
        var db = open.result;
        db.close();
        t.done();
    });
}, "IDBCursor continuePrimaryKey() on object store cursor");

[
    {
        direction: "nextunique",
        expected_key: 1,
        expected_primaryKey: "a",
        continue_key: 2,
        continue_primaryKey: "a",
    },
    {
        direction: "prevunique",
        expected_key: 3,
        expected_primaryKey: "a",
        continue_key: 2,
        continue_primaryKey: "a",
    },
].forEach(function (testcase) {
    async_test(function (t) {
        var dbname = document.location + "-" + t.name;
        var del = indexedDB.deleteDatabase(dbname);
        del.onerror = t.unreached_func("deleteDatabase should succeed");
        var open = indexedDB.open(dbname);
        open.onerror = t.unreached_func("open should succeed");

        open.onupgradeneeded = t.step_func(function () {
            var db = open.result;
            t.add_cleanup(function () {
                db.close();
                indexedDB.deleteDatabase(db.name);
            });
            var store = db.createObjectStore("store", { keyPath: "pk" });
            var index = store.createIndex("index", "ik", { multiEntry: true });
            store.put({ pk: "a", ik: [1, 2, 3] }).onerror = t.unreached_func(
                "put should not fail"
            );
            store.put({ pk: "b", ik: [1, 2, 3] }).onerror = t.unreached_func(
                "put should not fail"
            );
            var request = index.openKeyCursor(null, testcase.direction);
            request.onerror = t.unreached_func("openCursor should not fail");
            request.onsuccess = t.step_func(function () {
                var cursor = request.result;
                assert_class_string(
                    cursor,
                    "IDBCursor",
                    "result should be a cursor"
                );
                assert_equals(
                    cursor.direction,
                    testcase.direction,
                    "direction should be as specified"
                );
                assert_equals(
                    cursor.key,
                    testcase.expected_key,
                    "key should match"
                );
                assert_equals(
                    cursor.primaryKey,
                    testcase.expected_primaryKey,
                    "primaryKey should match"
                );

                assert_throws_dom(
                    "InvalidAccessError",
                    function () {
                        cursor.continuePrimaryKey(
                            testcase.continue_key,
                            testcase.continue_primaryKey
                        );
                    },
                    "continuePrimaryKey() should throw if direction is unique"
                );
            });
        });

        open.onsuccess = t.step_func(function () {
            var db = open.result;
            db.close();
            t.done();
        });
    }, 'IDBCursor continuePrimaryKey() on "' + testcase.direction + '" cursor');
});
