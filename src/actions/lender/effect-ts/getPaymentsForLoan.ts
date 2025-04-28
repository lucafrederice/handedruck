"use server";

import { prisma } from "@/db/prisma";
import { Effect, pipe } from "effect";
import { checkAgentAccess } from "../../auth/checkAgentAccess";
import { DatabaseError } from "@/lib/errors";

// Get all payments for a loan
export const getPaymentsForLoan = (loanId: number) =>
  pipe(
    checkAgentAccess(),
    Effect.flatMap(() =>
      Effect.tryPromise({
        try: () =>
          prisma.payment.findMany({
            where: {
              loanId: loanId,
            },
            orderBy: {
              paymentDate: "desc",
            },
          }),
        catch: (error) =>
          new DatabaseError(
            `Failed to fetch payments for loan ${loanId}`,
            error
          ),
      })
    ),
    Effect.map((payments) => ({ payments })),
    Effect.catchAll((error) => Effect.succeed({ error: error.message }))
  );
