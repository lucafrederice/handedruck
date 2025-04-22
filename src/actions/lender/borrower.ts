"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/db/prisma";

// Get all borrowers (users with loans)
export async function getBorrowers() {
  try {
    const borrowers = await prisma.user.findMany({
      where: {
        loans: {
          some: {},
        },
      },
      include: {
        loans: true,
      },
      orderBy: {
        lastName: "asc",
      },
    });
    return { borrowers };
  } catch (error) {
    console.error("Failed to fetch borrowers:", error);
    return { error: "Failed to fetch borrowers" };
  }
}

// Get a single borrower with their loans
export async function getBorrower(id: number) {
  try {
    const borrower = await prisma.user.findUnique({
      where: { id },
      include: {
        loans: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!borrower) {
      return { error: "Borrower not found" };
    }

    return { borrower };
  } catch (error) {
    console.error(`Failed to fetch borrower ${id}:`, error);
    return { error: `Failed to fetch borrower ${id}` };
  }
}

// Create a new borrower (user)
export async function createBorrower(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  creditScore?: number;
}) {
  try {
    const borrower = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        creditScore: data.creditScore,
      },
    });

    revalidatePath("/borrowers");
    return { borrower };
  } catch (error) {
    console.error("Failed to create borrower:", error);
    return { error: "Failed to create borrower" };
  }
}

// Update an existing borrower
export async function updateBorrower(
  id: number,
  data: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    address: string | null;
    creditScore: number | null;
  }>
) {
  try {
    const borrower = await prisma.user.update({
      where: { id },
      data,
    });

    revalidatePath(`/borrowers/${id}`);
    revalidatePath("/borrowers");
    return { borrower };
  } catch (error) {
    console.error(`Failed to update borrower ${id}:`, error);
    return { error: `Failed to update borrower ${id}` };
  }
}

// Delete a borrower
export async function deleteBorrower(id: number) {
  try {
    const borrower = await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/borrowers");
    return { success: true, borrower };
  } catch (error) {
    console.error(`Failed to delete borrower ${id}:`, error);
    return { error: `Failed to delete borrower ${id}` };
  }
}
