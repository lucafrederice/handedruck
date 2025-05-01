"use server";

import { Effect as _, pipe } from "effect";
import { getUserById } from "../user/getUserById";
import { updateSessionLastActive } from "../session/updateSessionLastActive";
import { getValidSessionFromTokenAndUserId } from "../session/getValidSessionFromTokenAndUserId";
import { getUserIdFromJWTPayload } from "./getUserIdFromJWTPayload";
import { verifySessionToken } from "./verifySessionToken";
import { getSessionToken } from "./getSessionToken";
import {
  SessionNotFoundError,
  SessionTokenNotFoundError,
  SessionTokenVerificationError,
  UserIdNotFoundError,
  SessionUpdateError,
  UserNotFoundError,
  EmptyError,
} from "../constants";
import { succeedOrFailEmpty } from "../succeedOrFailEmpty";
import { tryWithError } from "../tryWithError";
import {
  ConsoleSpanExporter,
  BatchSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { NodeSdk } from "@effect/opentelemetry";

// Set up tracing with the OpenTelemetry SDK
const NodeSdkLive = NodeSdk.layer(() => ({
  resource: {
    serviceName: "handedruck",
    attributes: {
      "handedruck.version": "1.0.0",
      "handedruck.environment": process.env.NODE_ENV,
      "handedruck.service": "handedruck",
    },
  },
  // Export span data to the console
  spanProcessor: new BatchSpanProcessor(new ConsoleSpanExporter()),
}));

/**
 * Retrieves the currently authenticated user based on their session token.
 * This function performs a series of steps to validate the user's session and retrieve their information:
 * 1. Gets the session token from the request
 * 2. Verifies the session token's validity
 * 3. Extracts the user ID from the token payload
 * 4. Validates the session exists for the user
 * 5. Updates the session's last active timestamp
 * 6. Retrieves the user's information
 *
 * @returns {Promise<User | null>} The authenticated user object if found and valid, null otherwise
 * @throws {SessionTokenNotFoundError} When no session token is found
 * @throws {SessionTokenVerificationError} When the session token is invalid
 * @throws {UserIdNotFoundError} When no user ID can be extracted from the token
 * @throws {SessionNotFoundError} When no valid session exists for the user
 * @throws {SessionUpdateError} When the session's last active timestamp cannot be updated
 * @throws {UserNotFoundError} When the user cannot be found
 */
export const getCurrentUser = async () =>
  pipe(
    // get session token
    tryWithError(
      async () => await getSessionToken(),
      SessionTokenNotFoundError
    ).pipe(
      _.andThen((token) =>
        succeedOrFailEmpty({ token }, "Session token is empty")
      ),
      // add tracing
      _.withSpan("getSessionToken")
    ),
    // verify session token
    _.andThen((token) =>
      tryWithError(
        async () => await verifySessionToken(token),
        SessionTokenVerificationError
      ).pipe(
        _.andThen((payload) =>
          succeedOrFailEmpty({ token, payload }, "Session payload is empty")
        ),
        // add tracing
        _.withSpan("verifySessionToken")
      )
    ),
    // get user id from payload
    _.andThen(({ token, payload }) =>
      tryWithError(
        async () => await getUserIdFromJWTPayload(payload),
        UserIdNotFoundError
      ).pipe(
        _.andThen((userId) =>
          succeedOrFailEmpty({ token, userId }, "No user id from payload")
        ),
        // add tracing
        _.withSpan("getUserIdFromJWTPayload")
      )
    ),
    // get valid session from token and user id
    _.andThen(({ token, userId }) =>
      tryWithError(
        async () => await getValidSessionFromTokenAndUserId(token, userId),
        SessionNotFoundError
      ).pipe(
        _.andThen((session) =>
          succeedOrFailEmpty(
            { userId, sessionId: session?.id },
            "No session id from token and user id"
          )
        ),
        // add tracing
        _.withSpan("getValidSessionFromTokenAndUserId")
      )
    ),
    // update session last active
    _.tap(({ sessionId }) =>
      tryWithError(
        async () => await updateSessionLastActive(sessionId),
        SessionUpdateError
      ).pipe(
        // add tracing
        _.withSpan("updateSessionLastActive")
      )
    ),
    // get user by id
    _.map(({ userId }) => userId),
    _.andThen((userId) =>
      tryWithError(
        async () => await getUserById(userId),
        UserNotFoundError
      ).pipe(
        _.andThen((user) =>
          succeedOrFailEmpty({ user }, "No user from user id")
        ),
        // add tracing
        _.withSpan("getUserById")
      )
    ),
    // catch empty error
    _.catchTag(EmptyError._tag, (error) => {
      console.log("EmptyError", error);
      return _.succeed(null);
    }),
    // catch all errors
    _.catchAll((e) => {
      console.error(e);
      return _.succeed(null);
    }),
    // greater span
    _.withSpan("getCurrentUser"),
    // Provide the tracing layer
    _.provide(NodeSdkLive),
    // run the effect
    _.runPromise
  );

// old
// export const getCurrentUser = async () =>
//   pipe(
//     Effect.tryPromise({
//       try: async () => await getSessionToken(),
//       catch: (e) => new SessionTokenNotFoundError(e as string),
//     }).pipe(
//       Effect.andThen((token) =>
//         token
//           ? Effect.succeed(token)
//           : Effect.fail(
//               new EmptyError(
//                 `Session token is empty ${JSON.stringify(token, null, 2)}`
//               )
//             )
//       )
//     ),
//     _.andThen((token) =>
//       _.tryPromise({
//         try: async () => await verifySessionToken(token),
//         catch: (e) => new SessionTokenVerificationError(e as string),
//       }).pipe(
//         _.andThen((payload) =>
//           token && payload
//             ? _.succeed({ token, payload })
//             : _.fail(new EmptyError("Session payload is empty"))
//         )
//       )
//     ),
//     _.andThen(({ token, payload }) =>
//       _.tryPromise({
//         try: async () => await getUserIdFromJWTPayload(payload),
//         catch: (e) => new UserIdNotFoundError(e as string),
//       }).pipe(
//         _.andThen((userId) =>
//           token && userId
//             ? _.succeed({ token, userId })
//             : _.fail(new EmptyError("No user id from payload"))
//         )
//       )
//     ),
//     _.andThen(({ token, userId }) =>
//       _.tryPromise({
//         try: async () => await getValidSessionFromTokenAndUserId(token, userId),
//         catch: (e) => new SessionNotFoundError(e as string),
//       }).pipe(
//         _.andThen((session) =>
//           session
//             ? _.succeed({ userId, sessionId: session.id })
//             : _.fail(new EmptyError("No session id from token and user id"))
//         )
//       )
//     ),
//     _.tap(({ sessionId }) =>
//       _.tryPromise({
//         try: async () => await updateSessionLastActive(sessionId),
//         catch: (e) => new SessionUpdateError(e as string),
//       })
//     ),
//     _.map(({ userId }) => userId),
//     _.andThen((userId) =>
//       _.tryPromise({
//         try: async () => await getUserById(userId),
//         catch: (e) => new UserNotFoundError(e as string),
//       }).pipe(
//         _.andThen((user) =>
//           user
//             ? _.succeed(user)
//             : _.fail(new EmptyError(`No user from user id ${userId}`))
//         )
//       )
//     ),
//     _.catchTag(EmptyError._tag, (error) => {
//       console.log("EmptyError", error);
//       return _.succeed(null);
//     }),
//     _.catchAll((e) => {
//       console.error(e);
//       return _.succeed(null);
//     }),
//     _.runPromise
//   );
