import "../../wpt-env.js";

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

async function run() {
    const dbs_to_delete = await indexedDB.databases();
    for (const db_info of dbs_to_delete) {
        let request = indexedDB.deleteDatabase(db_info.name);
        await new Promise((resolve, reject) => {
            request.onsuccess = resolve;
            request.onerror = reject;
        });
    }

    var openRequest = indexedDB.open("db-isolation-test");
    openRequest.onupgradeneeded = () => {
        openRequest.result.createObjectStore("s");
    };
    openRequest.onsuccess = () => {
        var tx = openRequest.result.transaction("s", "readonly", {
            durability: "relaxed",
        });
        keep_alive(tx, "s");
        window.parent.postMessage("keep_alive_started", "*");
    };
}

run();
