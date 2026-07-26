/**
 * Result type for functional error handling.
 *
 * Represents either a successful value (Ok) or a failure (Err).
 * Use case functions return Result<T, E> to make error paths explicit.
 */
export type Ok<T> = {
    ok: true;
    value: T;
};
export type Err<E> = {
    ok: false;
    error: E;
};
export type Result<T, E> = Ok<T> | Err<E>;
export declare const ok: <T, E = never>(value: T) => Ok<T>;
export declare const err: <E, T = never>(error: E) => Err<E>;
/**
 * Unwrap a Result, returning the value if Ok or throwing if Err.
 * Only use at the composition root / framework boundary where error handling is centralized.
 */
export declare const unwrap: <T, E>(result: Result<T, E>) => T;
/**
 * Map over a Result's value.
 */
export declare const map: <T, U, E>(result: Result<T, E>, fn: (value: T) => U) => Result<U, E>;
/**
 * FlatMap over a Result.
 */
export declare const flatMap: <T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>) => Result<U, E>;
/**
 * Match over a Result, providing handlers for both cases.
 */
export declare const match: <T, E, U>(result: Result<T, E>, handlers: {
    ok: (value: T) => U;
    err: (error: E) => U;
}) => U;
//# sourceMappingURL=result.d.ts.map