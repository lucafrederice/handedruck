"use server";

import { JWTPayload } from "jose";

export const getUserIdFromJWTPayload = async (payload: JWTPayload) =>
  payload.sub ? payload.sub : null;
