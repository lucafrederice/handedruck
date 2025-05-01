"use server";

import { prisma } from "@/db/prisma";

export const updateSessionLastActive = async (sessionId: number) => {
  const session = await prisma.session.update({
    where: { id: sessionId },
    data: { lastActive: new Date(), updatedAt: new Date() },
  });
  if (!session) return null;
  return session;
};
