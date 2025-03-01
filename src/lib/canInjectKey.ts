import { KeyPath, Value } from "./types.js";

// http://w3c.github.io/IndexedDB/#check-that-a-key-could-be-injected-into-a-value
const canInjectKey = (keyPath: KeyPath, value: Value) => {
    if (Array.isArray(keyPath)) {
        // tslint:disable-next-line max-line-length
        throw new Error(
            "The key paths used in this section are always strings and never sequences, since it is not possible to create a object store which has a key generator and also has a key path that is a sequence."
        );
    }

    const identifiers = String(keyPath).split(".");
    if (identifiers.length === 0) {
        throw new Error("Assert: identifiers is not empty");
    }
    identifiers.pop();

    for (const identifier of identifiers) {
        if (typeof value !== "object" && !Array.isArray(value)) {
            return false;
        }

        const hop = value.hasOwnProperty(identifier);
        if (!hop) {
            return true;
        }

        value = value[identifier];
    }

    return typeof value === "object" || Array.isArray(value);
};

export default canInjectKey;
