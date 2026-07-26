/**
 * Result type for functional error handling.
 *
 * Represents either a successful value (Ok) or a failure (Err).
 * Use case functions return Result<T, E> to make error paths explicit.
 */
export const ok = (value) => ({ ok: true, value });
export const err = (error) => ({ ok: false, error });
/**
 * Unwrap a Result, returning the value if Ok or throwing if Err.
 * Only use at the composition root / framework boundary where error handling is centralized.
 */
export const unwrap = (result) => {
    if (result.ok)
        return result.value;
    throw result.error;
};
/**
 * Map over a Result's value.
 */
export const map = (result, fn) => {
    if (result.ok)
        return ok(fn(result.value));
    return result;
};
/**
 * FlatMap over a Result.
 */
export const flatMap = (result, fn) => {
    if (result.ok)
        return fn(result.value);
    return result;
};
/**
 * Match over a Result, providing handlers for both cases.
 */
export const match = (result, handlers) => {
    if (result.ok)
        return handlers.ok(result.value);
    return handlers.err(result.error);
};
//# sourceMappingURL=result.js.map