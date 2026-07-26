/**
 * Result type for functional error handling.
 *
 * Represents either a successful value (Ok) or a failure (Err).
 * Use case functions return Result<T, E> to make error paths explicit.
 */

export type Ok<T> = { ok: true; value: T };
export type Err<E> = { ok: false; error: E };
export type Result<T, E> = Ok<T> | Err<E>;

export const ok = <T, _E = never>(value: T): Ok<T> => ({ ok: true, value });
export const err = <E, _T = never>(error: E): Err<E> => ({ ok: false, error });

/**
 * Unwrap a Result, returning the value if Ok or throwing if Err.
 * Only use at the composition root / framework boundary where error handling is centralized.
 */
export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (result.ok) return result.value;
  throw result.error;
};

/**
 * Map over a Result's value.
 */
export const map = <T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> => {
  if (result.ok) return ok(fn(result.value));
  return result;
};

/**
 * FlatMap over a Result.
 */
export const flatMap = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>,
): Result<U, E> => {
  if (result.ok) return fn(result.value);
  return result;
};

/**
 * Match over a Result, providing handlers for both cases.
 */
export const match = <T, E, U>(
  result: Result<T, E>,
  handlers: { ok: (value: T) => U; err: (error: E) => U },
): U => {
  if (result.ok) return handlers.ok(result.value);
  return handlers.err(result.error);
};
