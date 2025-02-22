import { Key, KeyPath, Value } from "./types.js";
import valueToKey from "./valueToKey.js";

// http://www.w3.org/TR/2015/REC-IndexedDB-20150108/#dfn-steps-for-extracting-a-key-from-a-value-using-a-key-path
const extractKey = (keyPath: KeyPath, value: Value) => {
    if (Array.isArray(keyPath)) {
        const result: Key[] = [];

        for (let item of keyPath) {
            // This doesn't make sense to me based on the spec, but it is needed to pass the W3C KeyPath tests (see same
            // comment in validateKeyPath)
            if (
                item !== undefined &&
                item !== null &&
                typeof item !== "string" &&
                (item as any).toString
            ) {
                item = (item as any).toString();
            }
            result.push(valueToKey(extractKey(item, value)));
        }

        return result;
    }

    if (keyPath === "") {
        return value;
    }

    let remainingKeyPath: string | null = String(keyPath);
    let object = value;

    while (remainingKeyPath !== null) {
        let identifier;

        const i = remainingKeyPath.indexOf(".");
        if (i >= 0) {
            identifier = remainingKeyPath.slice(0, i);
            remainingKeyPath = remainingKeyPath.slice(i + 1);
        } else {
            identifier = remainingKeyPath;
            remainingKeyPath = null;
        }

        const special = determineSpecialIdentifier(object, identifier);
        if (special !== undefined) {
            identifier = special;
        } else if (
            object === undefined ||
            object === null ||
            !object.hasOwnProperty(identifier)
        ) {
            return;
        }

        object = object[identifier];
    }

    return object;
};

// https://w3c.github.io/IndexedDB/#evaluate-a-key-path-on-a-value
function determineSpecialIdentifier(object: unknown, identifier: string) {
    if (typeof object === "string" || Array.isArray(object)) {
        if (identifier === "length") return "length";
        return undefined;
    }

    if (object instanceof Blob) {
        if (identifier === "size") return "size";
        if (identifier === "type") return "type";
        return undefined;
    }

    // instanceof File
    // "name", "lastModified"
    return undefined;
}

export default extractKey;
