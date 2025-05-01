"server only";

export class SessionTokenNotFoundError extends Error {
  static readonly _tag = "SessionTokenNotFoundError" as const;
  readonly _tag = SessionTokenNotFoundError._tag;

  constructor(message: string) {
    super(`[${SessionTokenNotFoundError._tag}] ${message}`);
  }
}

export class UserIdNotFoundError extends Error {
  static readonly _tag = "UserIdNotFoundError" as const;
  readonly _tag = UserIdNotFoundError._tag;

  constructor(message: string) {
    super(`[${UserIdNotFoundError._tag}] ${message}`);
  }
}

export class SessionTokenVerificationError extends Error {
  static readonly _tag = "SessionTokenVerificationError" as const;
  readonly _tag = SessionTokenVerificationError._tag;

  constructor(message: string) {
    super(`[${SessionTokenVerificationError._tag}] ${message}`);
  }
}

export class SessionNotFoundError extends Error {
  static readonly _tag = "SessionNotFoundError" as const;
  readonly _tag = SessionNotFoundError._tag;

  constructor(message: string) {
    super(`[${SessionNotFoundError._tag}] ${message}`);
  }
}

export class UserNotFoundError extends Error {
  static readonly _tag = "UserNotFoundError" as const;
  readonly _tag = UserNotFoundError._tag;

  constructor(message: string) {
    super(`[${UserNotFoundError._tag}] ${message}`);
  }
}

export class SessionUpdateError extends Error {
  static readonly _tag = "SessionUpdateError" as const;
  readonly _tag = SessionUpdateError._tag;

  constructor(message: string) {
    super(`[${SessionUpdateError._tag}] ${message}`);
  }
}

export class EmptyError extends Error {
  static readonly _tag = "EmptyError" as const;
  readonly _tag = EmptyError._tag;

  constructor(message: string) {
    super(`[${EmptyError._tag}] ${message}`);
  }
}
