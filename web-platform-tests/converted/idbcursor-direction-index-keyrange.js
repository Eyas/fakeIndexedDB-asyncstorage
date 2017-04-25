require("../../build/global.js");
const {
    add_completion_callback,
    assert_array_equals,
    assert_equals,
    assert_false,
    assert_not_equals,
    assert_throws,
    assert_true,
    async_test,
    createdb,
    createdb_for_multiple_tests,
    fail,
    indexeddb_test,
    setup,
    test,
} = require("../support-node.js");

const document = {};
const window = global;


var records = [ 1337, "Alice", "Bob", "Bob", "Greg", "Åke", ["Anne"] ];
var cases = [
  {dir: 'next', expect: ['Alice:1', 'Bob:2', 'Bob:3', 'Greg:4']},
  {dir: 'prev', expect: ['Greg:4',  'Bob:3', 'Bob:2', 'Alice:1']},
  {dir: 'nextunique', expect: ['Alice:1', 'Bob:2', 'Greg:4']},
  {dir: 'prevunique', expect: ['Greg:4',  'Bob:2', 'Alice:1']}
];


cases.forEach(function(testcase) {
  var dir = testcase.dir;
  var expect = testcase.expect;
  indexeddb_test(
    function(t, db, tx) {
      var objStore = db.createObjectStore("test");
      objStore.createIndex("idx", "name");

      for (var i = 0; i < records.length; i++)
        objStore.add({ name: records[i] }, i);
    },
    function(t, db) {
      var count = 0;
      var rq = db.transaction("test").objectStore("test").index("idx").openCursor(IDBKeyRange.bound("AA", "ZZ"), dir);
      rq.onsuccess = t.step_func(function(e) {
        var cursor = e.target.result;
        if (!cursor) {
          assert_equals(count, expect.length, "cursor runs");
          t.done();
        }
        assert_equals(cursor.value.name + ":" + cursor.primaryKey, expect[count], "cursor.value");
        count++;
        cursor.continue();
      });
      rq.onerror = t.step_func(function(e) {
        e.preventDefault();
        e.stopPropagation();
        assert_unreached("rq.onerror - " + e.message);
      });
    },
    document.title + ' - ' + dir
  )
});
