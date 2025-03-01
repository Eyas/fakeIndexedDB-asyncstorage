import FDBIndex from "../FDBIndex.js";
import FDBKeyRange from "../FDBKeyRange.js";
import FDBObjectStore from "../FDBObjectStore.js";
import FDBRequest from "../FDBRequest.js";

export type CursorSource = FDBIndex | FDBObjectStore;

interface EventInCallback extends Event {
    target: any;
    error: Error | null;
}

export type EventCallback = (event: EventInCallback) => void;

export type EventType =
    | "abort"
    | "blocked"
    | "complete"
    | "error"
    | "success"
    | "upgradeneeded"
    | "versionchange";

export type FDBCursorDirection = "next" | "nextunique" | "prev" | "prevunique";

export type KeyPath = string | { toString(): string } | string[];

export type Key = any;

export type CursorRange = Key | FDBKeyRange | undefined;

export type Value = any;

export interface Record {
    key: Key;
    value: Key | Value; // For indexes, will be Key. For object stores, will be Value.
}

export interface RequestObj<T = unknown> {
    operation: () => T | Promise<T>;
    request?: FDBRequest | undefined;
    source?: any;
}

export type RollbackLog = {
    immediate: (() => void)[];
    transactional: (() => Promise<void> | void)[];
};

export type TransactionMode = "readonly" | "readwrite" | "versionchange";
