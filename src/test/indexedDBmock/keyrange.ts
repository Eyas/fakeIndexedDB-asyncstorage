import * as assert from "assert";

describe("KeyRange", () => {
    it("only - number", () => {
        const value = 1;

        const keyRange = IDBKeyRange.only(value);

        assert.equal(keyRange.lower, value, "lower: " + keyRange.lower);
        assert.equal(keyRange.upper, value, "upper: " + keyRange.upper);
        assert.equal(
            keyRange.lowerOpen,
            false,
            "lowerOpen: " + keyRange.lowerOpen
        );
        assert.equal(
            keyRange.upperOpen,
            false,
            "upperOpen: " + keyRange.upperOpen
        );
    });
    it("only - date", () => {
        const value = new Date();

        const keyRange = IDBKeyRange.only(value);

        assert.deepEqual(keyRange.lower, value, "lower: " + keyRange.lower);
        assert.deepEqual(keyRange.upper, value, "upper: " + keyRange.upper);
        assert.equal(
            keyRange.lowerOpen,
            false,
            "lowerOpen: " + keyRange.lowerOpen
        );
        assert.equal(
            keyRange.upperOpen,
            false,
            "upperOpen: " + keyRange.upperOpen
        );
    });
    it("only - string", () => {
        const value = "1";

        const keyRange = IDBKeyRange.only(value);

        assert.deepEqual(keyRange.lower, value, "lower: " + keyRange.lower);
        assert.deepEqual(keyRange.upper, value, "upper: " + keyRange.upper);
        assert.equal(
            keyRange.lowerOpen,
            false,
            "lowerOpen: " + keyRange.lowerOpen
        );
        assert.equal(
            keyRange.upperOpen,
            false,
            "upperOpen: " + keyRange.upperOpen
        );
    });
    it("only - array", () => {
        const value = [1, "1", new Date()];

        const keyRange = IDBKeyRange.only(value);

        assert.deepEqual(keyRange.lower, value, "lower: " + keyRange.lower);
        assert.deepEqual(keyRange.upper, value, "upper: " + keyRange.upper);
        assert.equal(
            keyRange.lowerOpen,
            false,
            "lowerOpen: " + keyRange.lowerOpen
        );
        assert.equal(
            keyRange.upperOpen,
            false,
            "upperOpen: " + keyRange.upperOpen
        );
    });
    it("only - invalid key", () => {
        const value = {};

        try {
            const keyRange = IDBKeyRange.only(value);
        } catch (ex) {
            assert.equal(ex.name, "DataError", "DataError");
        }
    });
    it("lowerBound", () => {
        const value = 1;

        const keyRange = IDBKeyRange.lowerBound(value);

        assert.equal(keyRange.lower, value, "lower: " + keyRange.lower);
        assert.equal(keyRange.upper, undefined, "upper: " + keyRange.upper);
        assert.equal(
            keyRange.lowerOpen,
            false,
            "lowerOpen: " + keyRange.lowerOpen
        );
        assert.equal(
            keyRange.upperOpen,
            true,
            "upperOpen: " + keyRange.upperOpen
        );
    });
    it("lowerBound - value inclusieve", () => {
        const value = 1;

        const keyRange = IDBKeyRange.lowerBound(value, false);

        assert.equal(keyRange.lower, value, "lower: " + keyRange.lower);
        assert.equal(keyRange.upper, undefined, "upper: " + keyRange.upper);
        assert.equal(
            keyRange.lowerOpen,
            false,
            "lowerOpen: " + keyRange.lowerOpen
        );
        assert.equal(
            keyRange.upperOpen,
            true,
            "upperOpen: " + keyRange.upperOpen
        );
    });
    it("lowerBound - value exclusieve", () => {
        const value = 1;

        const keyRange = IDBKeyRange.lowerBound(value, true);

        assert.equal(keyRange.lower, value, "lower: " + keyRange.lower);
        assert.equal(keyRange.upper, undefined, "upper: " + keyRange.upper);
        assert.equal(
            keyRange.lowerOpen,
            true,
            "lowerOpen: " + keyRange.lowerOpen
        );
        assert.equal(
            keyRange.upperOpen,
            true,
            "upperOpen: " + keyRange.upperOpen
        );
    });
    it("lowerBound - invalid key", () => {
        const value = {};

        try {
            const keyRange = IDBKeyRange.lowerBound(value);
        } catch (ex) {
            assert.equal(ex.name, "DataError", "DataError");
        }
    });
    it("upperBound", () => {
        const value = 1;

        const keyRange = IDBKeyRange.upperBound(value);

        assert.equal(keyRange.lower, undefined, "lower: " + keyRange.lower);
        assert.equal(keyRange.upper, value, "upper: " + keyRange.upper);
        assert.equal(
            keyRange.lowerOpen,
            true,
            "lowerOpen: " + keyRange.lowerOpen
        );
        assert.equal(
            keyRange.upperOpen,
            false,
            "upperOpen: " + keyRange.upperOpen
        );
    });
    it("upperBound - value inclusieve", () => {
        const value = 1;

        const keyRange = IDBKeyRange.upperBound(value, false);

        assert.equal(keyRange.lower, undefined, "lower: " + keyRange.lower);
        assert.equal(keyRange.upper, value, "upper: " + keyRange.upper);
        assert.equal(
            keyRange.lowerOpen,
            true,
            "lowerOpen: " + keyRange.lowerOpen
        );
        assert.equal(
            keyRange.upperOpen,
            false,
            "upperOpen: " + keyRange.upperOpen
        );
    });
    it("upperBound - value exclusieve", () => {
        const value = 1;

        const keyRange = IDBKeyRange.upperBound(value, true);

        assert.equal(keyRange.lower, undefined, "lower: " + keyRange.lower);
        assert.equal(keyRange.upper, value, "upper: " + keyRange.upper);
        assert.equal(
            keyRange.lowerOpen,
            true,
            "lowerOpen: " + keyRange.lowerOpen
        );
        assert.equal(
            keyRange.upperOpen,
            true,
            "upperOpen: " + keyRange.upperOpen
        );
    });
    it("upperBound - invalid key", () => {
        const value = {};

        try {
            const keyRange = IDBKeyRange.upperBound(value);
        } catch (ex) {
            assert.equal(ex.name, "DataError", "DataError");
        }
    });
    it("bound", () => {
        const lower = 1;
        const upper = 2;

        const keyRange = IDBKeyRange.bound(lower, upper);

        assert.equal(keyRange.lower, lower, "lower: " + keyRange.lower);
        assert.equal(keyRange.upper, upper, "upper: " + keyRange.upper);
        assert.equal(
            keyRange.lowerOpen,
            false,
            "lowerOpen: " + keyRange.lowerOpen
        );
        assert.equal(
            keyRange.upperOpen,
            false,
            "upperOpen: " + keyRange.upperOpen
        );
    });
    it("bound - lower & upper inclusieve", () => {
        const lower = 1;
        const upper = 2;

        const keyRange = IDBKeyRange.bound(lower, upper, true, true);

        assert.equal(keyRange.lower, lower, "lower: " + keyRange.lower);
        assert.equal(keyRange.upper, upper, "upper: " + keyRange.upper);
        assert.equal(
            keyRange.lowerOpen,
            true,
            "lowerOpen: " + keyRange.lowerOpen
        );
        assert.equal(
            keyRange.upperOpen,
            true,
            "upperOpen: " + keyRange.upperOpen
        );
    });
    it("bound - lower & upper exclusieve", () => {
        const lower = 1;
        const upper = 2;

        const keyRange = IDBKeyRange.bound(lower, upper, false, false);

        assert.equal(keyRange.lower, lower, "lower: " + keyRange.lower);
        assert.equal(keyRange.upper, upper, "upper: " + keyRange.upper);
        assert.equal(
            keyRange.lowerOpen,
            false,
            "lowerOpen: " + keyRange.lowerOpen
        );
        assert.equal(
            keyRange.upperOpen,
            false,
            "upperOpen: " + keyRange.upperOpen
        );
    });
    it("bound - lower inclusieve & upper exclusieve", () => {
        const lower = 1;
        const upper = 2;

        const keyRange = IDBKeyRange.bound(lower, upper, true, false);

        assert.equal(keyRange.lower, lower, "lower: " + keyRange.lower);
        assert.equal(keyRange.upper, upper, "upper: " + keyRange.upper);
        assert.equal(
            keyRange.lowerOpen,
            true,
            "lowerOpen: " + keyRange.lowerOpen
        );
        assert.equal(
            keyRange.upperOpen,
            false,
            "upperOpen: " + keyRange.upperOpen
        );
    });
    it("bound - lower exclusieve & upper inclusieve", () => {
        const lower = 1;
        const upper = 2;

        const keyRange = IDBKeyRange.bound(lower, upper, false, true);

        assert.equal(keyRange.lower, lower, "lower: " + keyRange.lower);
        assert.equal(keyRange.upper, upper, "upper: " + keyRange.upper);
        assert.equal(
            keyRange.lowerOpen,
            false,
            "lowerOpen: " + keyRange.lowerOpen
        );
        assert.equal(
            keyRange.upperOpen,
            true,
            "upperOpen: " + keyRange.upperOpen
        );
    });
    it("bound - invalid key lower", () => {
        const value = {};

        try {
            const keyRange = IDBKeyRange.bound(value, 1);
        } catch (ex) {
            assert.equal(ex.name, "DataError", "DataError");
        }
    });
    it("bound - invalid key upper", () => {
        const value = {};

        try {
            const keyRange = IDBKeyRange.bound(1, value);
        } catch (ex) {
            assert.equal(ex.name, "DataError", "DataError");
        }
    });
    it("bound - upper smaler then lower", () => {
        const lower = 1;
        const upper = 2;

        try {
            const keyRange = IDBKeyRange.bound(upper, lower);
        } catch (ex) {
            assert.equal(ex.name, "DataError", "DataError");
        }
    });
    it("bound - lower === upper and lower & upper exclusieve", () => {
        const lower = 1;
        const upper = 2;

        try {
            const keyRange = IDBKeyRange.bound(upper, lower);
        } catch (ex) {
            assert.equal(ex.name, "DataError", "DataError");
        }
    });
});
