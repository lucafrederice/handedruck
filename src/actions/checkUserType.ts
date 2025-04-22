import { prisma } from "@/db/prisma";

export type UserType = "admin" | "agent" | "borrower" | "customer";

export async function checkUserType(userId: number): Promise<{
  success: boolean;
  userTypes?: UserType[];
  error?: string;
  details?: string;
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const userTypes: UserType[] = [];

    if (user.isAdmin) {
      userTypes.push("admin");
    }

    if (user.isAgent) {
      userTypes.push("agent");
    }

    // Check if user has any loans
    const loans = await prisma.loan.findMany({
      where: { userId: user.id },
      select: { id: true },
    });

    console.log("loans", loans);

    if (loans.length > 0) {
      userTypes.push("borrower");
    }

    if (userTypes.length === 0) {
      userTypes.push("customer");
    }

    return { success: true, userTypes };
  } catch (error) {
    console.log("error", error);
    return {
      success: false,
      error: "Failed to check user type",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
