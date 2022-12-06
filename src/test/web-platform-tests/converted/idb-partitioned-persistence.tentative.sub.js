import "../wpt-env.js";

// Here's the set-up for this test:
// Step 1. (window) set up listeners for main window.
// Step 2. (iframe1 & iframe2) loads and sends "iframe loaded" message.
// Step 3. (window) receives two "iframe loaded" message and sends "create database" message to iframe1.
// Step 4. (iframe1) receives "create database", creates database, and sends "database created" message.
// Step 5. (window) receives "database created" message and sends "check database" message to iframe2.
// Step 6. (iframe2) receives "check database" message, checks if database exists, sends "database checked" message.
// Step 7. (window) receives the "database checked" message, asserts database existed, and then exits.

async_test((t) => {
    const iframe1 = document.getElementById("iframe1");
    const iframe2 = document.getElementById("iframe2");
    let iframes_loaded = 0;

    // Step 1
    window.addEventListener(
        "message",
        t.step_func((e) => {
            // Step 3
            if (e.data.message === "iframe loaded") {
                iframes_loaded++;
                if (iframes_loaded === 2) {
                    iframe1.contentWindow.postMessage(
                        { message: "create database" },
                        "*"
                    );
                }
            }

            // Step 5
            if (e.data.message === "database created") {
                iframe2.contentWindow.postMessage(
                    { message: "check database" },
                    "*"
                );
            }

            // Step 7
            if (e.data.message === "database checked") {
                t.step(() => {
                    assert_true(
                        e.data.doesDatabaseExist,
                        "The same database should exist in both frames"
                    );
                });
                t.done();
            }
        })
    );

    iframe1.src =
        "http://{{hosts[alt][]}}:{{ports[http][0]}}/IndexedDB/resources/idb-partitioned-persistence-iframe.tentative.html";
    iframe2.src =
        "http://{{hosts[alt][]}}:{{ports[http][0]}}/IndexedDB/resources/idb-partitioned-persistence-iframe.tentative.html";
}, "Persistence test for partitioned IndexedDB");
