type TypedArray =
    | Int8Array
    | Uint8Array
    | Uint8ClampedArray
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Float32Array
    | Float64Array
    | BigInt64Array
    | BigUint64Array;
type ErrorType =
    | Error
    | EvalError
    | RangeError
    | ReferenceError
    | SyntaxError
    | TypeError
    | URIError;

type RealPrimitive =
    | string
    | number
    | boolean
    | bigint
    | Date
    | RegExp
    | DataView
    | ArrayBufferView
    | TypedArray
    | ArrayBuffer
    | SharedArrayBuffer
    | ErrorType
    // | WebTypes
    | null
    | undefined;
type Real =
    | RealPrimitive
    | Map<string | number | boolean | null, Real>
    | Real[]
    | { [key: string | number]: Real };
export type RealObject = Exclude<Real, RealPrimitive>;

type SerialPrimitive = { v: string | number | boolean | null } | { b: string };
type SerialDate = { d: string };
type SerialRegex = { R: string };
type SerialBufferView = {
    BV: [keyof typeof dataViewsReverse, number, number, { r: number }];
};
type SerialBuffer = { B: string };
type SerialError = {
    E: [
        "Error" | keyof typeof specificErrorConstructors,
        string,
        string | null
    ];
};
type SerialReference = { r: number } | { u: null };
type SerialValue = SerialPrimitive | SerialDate | SerialRegex | SerialReference;
type SerialObject = { o: [string | number, SerialValue][] };
type SerialArray = { a: SerialValue[] };
type SerialMap = { m: Array<[string | number | boolean | null, SerialValue]> };
type SerialAnyRef =
    | SerialObject
    | SerialArray
    | SerialMap
    | SerialBuffer
    | SerialBufferView
    | SerialError;
type SerialList = Map<number, SerialAnyRef>;
export type SerializedResult = [number, SerialAnyRef][];

type RealReference =
    | RealObject
    | ArrayBuffer
    | SharedArrayBuffer
    | TypedArray
    | DataView
    | ArrayBufferView
    | ErrorType;

function buildDvSD<
    T,
    N extends string,
    DV extends new (
        buffer: ArrayBufferLike,
        byteOffset: number,
        byteLength: number
    ) => T
>(name: N, dv: DV) {
    return {
        name,
        dv,
    };
}
const dataViews = {
    DataView: buildDvSD("dv", DataView),
    Int8Array: buildDvSD("i8", Int8Array),
    Uint8Array: buildDvSD("u8", Uint8Array),
    Uint8ClampedArray: buildDvSD("u8c", Uint8ClampedArray),
    Int16Array: buildDvSD("i16", Int16Array),
    Uint16Array: buildDvSD("u16", Uint16Array),
    Int32Array: buildDvSD("i32", Int32Array),
    Uint32Array: buildDvSD("u32", Uint32Array),
    Float32Array: buildDvSD("f32", Float32Array),
    Float64Array: buildDvSD("f64", Float64Array),
    BigInt64Array: buildDvSD("b64", BigInt64Array),
    BigUint64Array: buildDvSD("bu64", BigUint64Array),
};
const dataViewsReverse: {
    [Key in keyof typeof dataViews as typeof dataViews[Key]["name"]]: Key;
} = Object.fromEntries(
    Object.entries(dataViews).map(([key, { name }]) => [name, key])
) as any;

const specificErrorConstructors = {
    EvalError,
    RangeError,
    ReferenceError,
    SyntaxError,
    TypeError,
    URIError,
};

function ref(
    value: RealReference,
    wm: WeakMap<object, number>,
    explore: RealReference[],
    nextIndex: number
): [number, number] {
    if (wm.has(value)) {
        return [wm.get(value)!, nextIndex];
    }
    ++nextIndex;
    wm.set(value, nextIndex);
    explore.push(value);
    return [nextIndex, nextIndex];
}

export function serialize(o: RealObject): SerializedResult {
    const result: SerialList = new Map();
    const wm = new WeakMap<object, number>();
    wm.set(o, 0);
    const explore: RealReference[] = [o];
    let nextIndex = 1;

    function serializeValue(value: Real): SerialValue {
        if (typeof value === "bigint") {
            return { b: value.toString() };
        }
        if (value instanceof Date) {
            return { d: value.toISOString() };
        }
        if (value instanceof RegExp) {
            return { R: `${value}` };
        }
        if (
            value instanceof ArrayBuffer ||
            value instanceof SharedArrayBuffer ||
            ArrayBuffer.isView(value) ||
            value instanceof Error ||
            value instanceof Object
        ) {
            let idx: number;
            [idx, nextIndex] = ref(value, wm, explore, nextIndex);
            return { r: idx };
        }
        if (value === undefined) {
            return { u: null };
        } else {
            return { v: value };
        }
    }

    let cur: RealReference | undefined;
    while ((cur = explore.pop())) {
        let obj: SerialAnyRef;
        if (Array.isArray(cur)) {
            obj = { a: cur.map(serializeValue) };
        } else if (cur instanceof Map) {
            obj = {
                m: Array.from(cur.entries()).map(([k, v]) => [
                    k,
                    serializeValue(v),
                ]),
            };
        } else if (
            cur instanceof ArrayBuffer ||
            cur instanceof SharedArrayBuffer
        ) {
            const u8 = new Uint8Array(cur);
            const base64 = btoa(
                Array.from(u8)
                    .map((n) => String.fromCharCode(n))
                    .join("")
            );
            obj = { B: base64 };
        } else if (ArrayBuffer.isView(cur)) {
            let idx: number;
            [idx, nextIndex] = ref(cur.buffer, wm, explore, nextIndex);

            const type = cur.constructor.name as keyof typeof dataViews;
            const typeName = dataViews[type].name;

            obj = {
                BV: [typeName, cur.byteOffset, cur.byteLength, { r: idx }],
            };
        } else if (cur instanceof Error) {
            const name = (
                cur.name in specificErrorConstructors ? cur.name : "Error"
            ) as "Error" | keyof typeof specificErrorConstructors;
            obj = { E: [name, cur.message, cur.stack || null] };
        } else if (cur instanceof Object) {
            obj = {
                o: Object.entries(cur).map(([k, v]) => [k, serializeValue(v)]),
            };
        } else {
            const assertion: never = cur;
            throw new Error(
                `Unexpected ${assertion} (of type ${typeof assertion}).`
            );
        }

        const idx = wm.get(cur)!;
        result.set(idx, obj);
    }
    return Array.from(result.entries());
}

export function deserialize(_j: SerializedResult): RealReference {
    const j = new Map(_j);
    const results = new Map<number, RealReference>();

    function deserializeValue(v: SerialValue): Real {
        if ("v" in v) {
            return v.v;
        } else if ("d" in v) {
            return new Date(v.d);
        } else if ("R" in v) {
            return new RegExp(v.R);
        } else if ("r" in v) {
            const ref = results.get(v.r);
            if (!ref) throw new Error(`Reference ${v.r} not found.`);
            return ref;
        } else if ("u" in v) {
            return undefined;
        } else if ("b" in v) {
            return BigInt(v.b);
        } else {
            const assertion: never = v;
            throw new Error(`Unexpected value ${JSON.stringify(assertion)}.`);
        }
    }

    const bvs: [number, SerialBufferView][] = [];

    // First, pre-create references to all objects (Except buffer views)
    for (const [idx, obj] of j) {
        if ("o" in obj) {
            results.set(idx, {});
        } else if ("a" in obj) {
            results.set(idx, []);
        } else if ("m" in obj) {
            results.set(idx, new Map());
        } else if ("B" in obj) {
            const base64 = atob(obj.B)
                .split("")
                .map((str) => str.charCodeAt(0));
            const typed = Uint8Array.from(base64);
            results.set(idx, typed.buffer);
        } else if ("BV" in obj) {
            bvs.push([idx, obj]);
        } else if ("E" in obj) {
            const [type, message, stack] = obj.E;
            const e = new (
                type === "Error" ? Error : specificErrorConstructors[type]
            )(message);
            e.stack = stack ?? undefined;
            results.set(idx, e);
        } else {
            const assertion: never = obj;
            throw new Error(`Unexpected ${JSON.stringify(assertion)}`);
        }
    }

    // Only create BVs once all Buffers ("B"s) have been evaluated above.
    for (const [idx, bv] of bvs) {
        const [type, byteOffset, byteLength, bufferReference] = bv.BV;
        const buffer = results.get(bufferReference.r);
        if (!buffer)
            throw new Error(`Buffer reference ${bufferReference.r} not found.`);
        if (
            !(buffer instanceof ArrayBuffer) &&
            !(buffer instanceof SharedArrayBuffer)
        )
            throw new Error(`Expected ${buffer} to be an ArrayBuffer`);
        results.set(
            idx,
            new dataViews[dataViewsReverse[type]].dv(
                buffer,
                byteOffset,
                byteLength
            )
        );
    }

    for (const [idx, obj] of j) {
        if ("o" in obj) {
            const deserialized = results.get(idx)!;
            if (Array.isArray(deserialized))
                throw new Error("Deserialized shouldn't be an array.");
            if (deserialized instanceof Map)
                throw new Error("Deserialized shouldn't be a map.");
            if (
                deserialized instanceof ArrayBuffer ||
                deserialized instanceof SharedArrayBuffer
            )
                throw new Error("Deserialized shouldn't be a buffer.");
            if (ArrayBuffer.isView(deserialized))
                throw new Error(
                    "Deserialized shouldn't be an Array Buffer View."
                );
            if (deserialized instanceof Error)
                throw new Error("Deserialized shouldn't be an Error instance.");
            if (!(deserialized instanceof Object))
                throw new Error("Deserialized shouldn't be a primitive.");

            for (const [k, v] of obj.o) {
                deserialized[k] = deserializeValue(v);
            }
        } else if ("a" in obj) {
            const deserialized = results.get(idx)!;
            if (!Array.isArray(deserialized))
                throw new Error("Deserialized should be an array.");

            deserialized.push(...obj.a.map(deserializeValue));
        } else if ("m" in obj) {
            const deserialized = results.get(idx)!;
            if (!(deserialized instanceof Map))
                throw new Error("Deserialized should be a map.");

            for (const [k, v] of obj.m) {
                deserialized.set(k, deserializeValue(v));
            }
        } else if ("B" in obj || "E" in obj || "BV" in obj) {
            // Array Buffers and Array Buffer Views are fine as-is
            continue;
        } else {
            const assertion: never = obj;
            throw new Error(`Unexpected ${JSON.stringify(assertion)}`);
        }
    }

    return results.get(0)!;
}
