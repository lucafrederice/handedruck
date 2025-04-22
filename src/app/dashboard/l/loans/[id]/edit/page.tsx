import { getLoan } from "@/actions/lender/loan";
import { getBorrowers } from "@/actions/lender/borrower";
import { notFound } from "next/navigation";
import LoanForm from "@/components/loan-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DASH_L_LOANS_ID_PATH } from "../page";

export const DASH_L_LOANS_ID_EDIT_PATH = (id: string) =>
  `${DASH_L_LOANS_ID_PATH(id)}/edit`;

export default async function EditLoanPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number.parseInt(params.id);
  const { loan, error: loanError } = await getLoan(id);
  const { borrowers, error: borrowersError } = await getBorrowers();

  if (loanError || !loan) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link href={DASH_L_LOANS_ID_PATH(id.toString())}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Edit Loan #{id}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loan Details</CardTitle>
        </CardHeader>
        <CardContent>
          {borrowersError ? (
            <div className="text-destructive">{borrowersError}</div>
          ) : (
            <LoanForm borrowers={borrowers || []} loan={loan} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
