declare module "serialize-anything" {
    export interface SerializationOptions {
        maxDepth?: number;
        pretty?: boolean;
    }

    export function serialize(
        source: unknown,
        options?: SerializationOptions
    ): string;

    export function deserialize(source: string): unknown;
}
