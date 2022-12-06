import { DataError } from "./errors.js";
import { Key } from "./types.js";

// https://w3c.github.io/IndexedDB/#convert-a-value-to-a-input
const valueToKey = (input: any, seen?: Set<object>): Key | Key[] => {
    if (typeof input === "number") {
        if (isNaN(input)) {
            throw DataError();
        }
        return input;
    } else if (input instanceof Date) {
        const ms = input.valueOf();
        if (isNaN(ms)) {
            throw DataError();
        }
        return new Date(ms);
    } else if (typeof input === "string") {
        return input;
    } else if (
        input instanceof ArrayBuffer ||
        (typeof ArrayBuffer !== "undefined" &&
            ArrayBuffer.isView &&
            ArrayBuffer.isView(input))
    ) {
        if (input instanceof ArrayBuffer) {
            return input;
        }
        return new Uint8Array(
            input.buffer,
            input.byteOffset,
            input.byteLength
        ).map((i) => i).buffer;
    } else if (Array.isArray(input)) {
        if (seen === undefined) {
            seen = new Set();
        } else if (seen.has(input)) {
            throw DataError();
        }
        seen.add(input);

        const keys = [];
        for (let i = 0; i < input.length; i++) {
            const hop = input.hasOwnProperty(i);
            if (!hop) {
                throw DataError();
            }
            const entry = input[i];
            const key = valueToKey(entry, seen);
            keys.push(key);
        }
        return keys;
    } else {
        throw DataError();
    }
};

export default valueToKey;
