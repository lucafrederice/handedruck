"use server";

import { prisma } from "@/db/prisma";

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
  });
  if (!user) return null;
  return user;
};
