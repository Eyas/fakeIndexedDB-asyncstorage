import { KeyPath } from "./types";

export function shallowCopy(path: KeyPath): KeyPath {
    if (path === null || path === undefined) return path;
    switch (typeof path) {
        case "bigint":
        case "boolean":
        case "number":
        case "string":
        case "symbol":
            return path;
        case "function":
            return path;
        default:
            break;
    }

    if (Array.isArray(path)) return Array.from(path);

    return { ...path };
}
