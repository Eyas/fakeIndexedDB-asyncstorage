import "../../wpt-env.js";

const dbName = "users";

// Create the database at v1 and detect success via `onsuccess`.
function createDatabase() {
    return new Promise((resolve, reject) => {
        var dbRequest = window.indexedDB.open(dbName, 1);
        dbRequest.onblocked = () => reject();
        dbRequest.onerror = () => reject();
        dbRequest.onsuccess = (e) => {
            e.target.result.close();
            resolve();
        };
    });
}

// Open the database at v2 and detect existance via `onupgradeneeded`.
function doesDatabaseExist() {
    let didExist = false;
    return new Promise((resolve, reject) => {
        var dbRequest = window.indexedDB.open(dbName, 2);
        dbRequest.onblocked = () => reject();
        dbRequest.onerror = () => reject();
        dbRequest.onsuccess = (e) => {
            e.target.result.close();
            deleteDatabase().then(() => resolve(didExist));
        };
        dbRequest.onupgradeneeded = (e) => {
            didExist = e.oldVersion != 0;
        };
    });
}

// Delete the database and detect success via `onsuccess`.
function deleteDatabase() {
    return new Promise((resolve, reject) => {
        var dbRequest = window.indexedDB.deleteDatabase(dbName);
        dbRequest.onblocked = () => reject();
        dbRequest.onerror = () => reject();
        dbRequest.onsuccess = () => resolve();
    });
}

window.addEventListener("load", () => {
    if (!parent.opener) {
        // Step 2
        createDatabase().then(() => {
            parent.postMessage(
                { message: "same-site iframe loaded" },
                parent.origin
            );
        });
    } else {
        // Step 4
        doesDatabaseExist().then((result) => {
            parent.opener.postMessage(
                {
                    message: "cross-site iframe loaded",
                    doesDatabaseExist: result,
                },
                parent.opener.origin
            );
        });
    }
});

// Step 6
window.addEventListener("message", (e) => {
    if (e.data.message == "delete database") {
        deleteDatabase().then(() => {
            e.source.postMessage(
                { message: "database deleted" },
                e.source.origin
            );
        });
    }
});
