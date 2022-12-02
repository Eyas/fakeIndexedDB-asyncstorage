import { FDBCursor } from "./FDBCursor.js";
import type {
    CursorRange,
    CursorSource,
    FDBCursorDirection,
    Value,
} from "./lib/types.js";

export class FDBCursorWithValue extends FDBCursor {
    public value: Value = undefined;

    constructor(
        source: CursorSource,
        range: CursorRange,
        direction?: FDBCursorDirection,
        request?: any
    ) {
        super(source, range, direction, request);
    }

    public toString() {
        return "[object IDBCursorWithValue]";
    }
}

export type CursorWithValueBuilder = (
    source: CursorSource,
    range: CursorRange,
    direction?: FDBCursorDirection,
    request?: any
) => FDBCursorWithValue;

export const buildCursorWithValue: CursorWithValueBuilder = (
    source,
    range,
    direction,
    request
) => new FDBCursorWithValue(source, range, direction, request);
