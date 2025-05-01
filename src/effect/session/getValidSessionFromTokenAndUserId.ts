"use server";

import { prisma } from "@/db/prisma";

export const getValidSessionFromTokenAndUserId = async (
  sessionToken: string,
  userId: string
) => {
  const session = await prisma.session.findFirst({
    where: {
      jwtToken: sessionToken,
      forceDeactivation: false,
      userId: Number(userId),
      expiresAt: {
        gt: new Date(),
      },
    },
  });
  if (!session) return null;
  return session;
};
