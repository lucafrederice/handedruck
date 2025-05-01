"use server";

import { cookies } from "next/headers";

export const getSessionToken = async () => {
  const sessionToken = (await cookies()).get("session_token")?.value;
  if (!sessionToken) {
    return null;
  }
  return sessionToken;
};
