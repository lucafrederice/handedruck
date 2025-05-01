import { Effect as _ } from "effect";

export const tryWithError = <T, E extends Error>(
  fn: () => Promise<T>,
  ErrorClass: new (message: string) => E
) =>
  _.tryPromise({
    try: fn,
    catch: (e) => new ErrorClass(e as string),
  });
