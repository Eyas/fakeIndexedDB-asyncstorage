import "../wpt-env.js";

function load_iframe(src, sandbox) {
    return new Promise((resolve) => {
        const iframe = document.createElement("iframe");
        iframe.onload = () => {
            resolve(iframe);
        };
        if (sandbox) iframe.sandbox = sandbox;
        iframe.srcdoc = src;
        iframe.style.display = "none";
        document.documentElement.appendChild(iframe);
    });
}

function wait_for_message(recipient, source) {
    return new Promise((resolve) => {
        recipient.onmessage = function listener(e) {
            if (e.source === source) {
                resolve(e.data);
                recipient.removeEventListener("message", listener);
            }
        };
    });
}

const test_code =
    "  const handler = (reply) => {" +
    "    try {" +
    '      indexedDB.deleteDatabase("opaque-origin-test");' +
    "    } catch {}" +
    "    try {" +
    '      const r = indexedDB.open("opaque-origin-test");' +
    "      r.onupgradeneeded = () => { r.transaction.abort(); };" +
    '      reply({result: "no exception"});' +
    "    } catch (ex) {" +
    "      reply({result: ex.name});" +
    "    };" +
    "  };";

const iframe_script =
    "<script>" +
    test_code +
    "  window.onmessage = () => {" +
    '    handler(msg => window.parent.postMessage(msg, "*"));' +
    "  };" +
    "</script>";

promise_test((t) => {
    return load_iframe(iframe_script)
        .then((iframe) => {
            iframe.contentWindow.postMessage({}, "*");
            return wait_for_message(self, iframe.contentWindow);
        })
        .then((message) => {
            assert_equals(
                message.result,
                "no exception",
                "IDBFactory.open() should not throw"
            );
        });
}, "IDBFactory.open() in non-sandboxed iframe should not throw");

promise_test((t) => {
    return load_iframe(iframe_script, "allow-scripts")
        .then((iframe) => {
            iframe.contentWindow.postMessage({}, "*");
            return wait_for_message(self, iframe.contentWindow);
        })
        .then((message) => {
            assert_equals(
                message.result,
                "SecurityError",
                "Exception should be SecurityError"
            );
        });
}, "IDBFactory.open() in sandboxed iframe should throw SecurityError");

const worker_script = `
${test_code}
// For dedicated workers:
self.addEventListener("message", () => handler(self.postMessage));
// For shared workers:
self.addEventListener("connect", (e) => {
  var port = e.ports[0];
  handler(msg => port.postMessage(msg));
});
`;
const worker_data_url = "data:,".concat(encodeURIComponent(worker_script));

promise_test(async (t) => {
    let worker = new Worker(worker_data_url);
    t.add_cleanup(() => worker.terminate());
    worker.postMessage({});
    const message = await wait_for_message(worker, null);
    assert_equals(
        message.result,
        "SecurityError",
        "Promise should be rejected with SecurityError"
    );
}, "IDBFactory.open() in data URL dedicated workers should throw SecurityError");

promise_test(async (t) => {
    let worker = new SharedWorker(worker_data_url, "idb_open_opaque");
    worker.port.postMessage({});
    const message = await wait_for_message(worker.port, null);
    assert_equals(
        message.result,
        "SecurityError",
        "Promise should be rejected with SecurityError"
    );
}, "IDBFactory.open() in data URL shared workers should throw SecurityError");
