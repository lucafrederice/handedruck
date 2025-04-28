import { Effect, pipe } from "effect";
import { getCurrentUser } from "./getCurrentUser";

export const checkAgentAccess = () =>
  pipe(
    Effect.tryPromise({
      try: () => getCurrentUser(),
      catch: (error) => new Error(`Failed to get current user: ${error}`),
    }),
    Effect.flatMap((user) => {
      if (!user) {
        return Effect.fail(new Error("User not found"));
      }

      if (!user.isAgent) {
        return Effect.fail(new Error("User is not an agent"));
      }

      return Effect.succeed(user);
    })
  );
