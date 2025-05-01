import { Effect as _ } from "effect";
import { EmptyError } from "./constants";

type SingleOrObject<T extends Record<string, unknown>> = T extends {
  [K in keyof T]: infer V;
} & { [key: string]: unknown }
  ? keyof T extends infer K
    ? K extends string
      ? T[K] extends unknown
        ? keyof T extends K
          ? NonNullable<V>
          : { [P in keyof T]: NonNullable<T[P]> }
        : never
      : never
    : never
  : never;

/**
 * A utility function that ensures all values in an object are non-null and non-undefined.
 * It provides both runtime validation and compile-time type narrowing.
 *
 * The function has two behaviors:
 * 1. For single-property objects: Returns just the non-null value
 * 2. For multi-property objects: Returns the object with all values non-null
 *
 * This function simplifies common patterns like:
 * ```typescript
 * // Before:
 * Effect.andThen((token) =>
 *   token && userId
 *     ? Effect.succeed({ token, userId })
 *     : Effect.fail(new EmptyError("No user id from payload"))
 * )
 *
 * // After:
 * Effect.andThen((token) => succeedOrFailEmpty({ token, userId }))
 *
 * // Before:
 * Effect.andThen((session) =>
 *   session
 *     ? Effect.succeed({ userId, sessionId: session.id })
 *     : Effect.fail(new EmptyError("No session id from token and user id"))
 * )
 *
 * // After:
 * Effect.andThen((session) => succeedOrFailEmpty({ userId, sessionId: session?.id }))
 * ```
 *
 * @template T - The type of the input object, which must be a Record with string keys
 * @param obj - The object to validate
 * @returns An Effect that either:
 *          - Succeeds with:
 *            - A single value if the object has only one property (e.g., { token: "abc" } -> "abc")
 *            - The same object with all values guaranteed to be non-null if multiple properties
 *          - Fails with an EmptyError if any value is null, undefined, or falsy
 *
 * @example
 * ```typescript
 * // Single property - returns just the value
 * pipe(
 *   Effect.succeed({ token: "some-token" }),
 *   Effect.andThen((token) => succeedOrFailEmpty({ token })) // returns Effect<string, EmptyError, never>
 * )
 *
 * // Multiple properties - returns the object
 * pipe(
 *   Effect.succeed({ token: "some-token", userId: 123 }),
 *   Effect.andThen(({ token, userId }) => succeedOrFailEmpty({ token, userId })) // returns Effect<{ token: string, userId: number }, EmptyError, never>
 * )
 * ```
 *
 * Type Safety:
 * - Uses TypeScript's NonNullable utility type to ensure all values are non-null
 * - Automatically narrows types in subsequent Effect.andThen operations
 * - Returns a single value type for single-property objects
 * - Returns an object type with all non-null values for multi-property objects
 */
export const succeedOrFailEmpty = <T extends Record<string, unknown>>(
  obj: T,
  errorMessage: string
): _.Effect<SingleOrObject<T>, EmptyError, never> => {
  const hasEmptyValues = Object.values(obj).some((v) => !v);
  if (hasEmptyValues) {
    return _.fail(new EmptyError(errorMessage));
  }

  const entries = Object.entries(obj);
  if (entries.length === 1) {
    return _.succeed(
      entries[0][1] as NonNullable<T[keyof T]>
    ) as unknown as _.Effect<SingleOrObject<T>, EmptyError, never>;
  }

  return _.succeed(
    obj as { [K in keyof T]: NonNullable<T[K]> }
  ) as unknown as _.Effect<SingleOrObject<T>, EmptyError, never>;
};
