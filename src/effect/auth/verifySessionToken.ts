"use server";

import { jwtVerify } from "jose";
import { JWT_SECRET } from "@/actions/auth/constants";

export const verifySessionToken = async (sessionToken: string) =>
  (await jwtVerify(sessionToken, JWT_SECRET)).payload;
