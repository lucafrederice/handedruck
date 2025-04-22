import { prisma } from "@/db/prisma";

export async function getCustomerLoans(userId: number) {
  try {
    const loans = await prisma.loan.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        payments: true,
      },
    });

    return { success: true, data: loans };
  } catch (error) {
    return {
      success: false,
      error: "Failed to retrieve customer loans",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
