import { getBorrowers } from "@/actions/lender/borrower";
import LoanForm from "@/components/loan-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DASH_L_LOANS_PATH } from "../page";

export default async function NewLoanPage() {
  const { borrowers, error } = await getBorrowers();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link href={DASH_L_LOANS_PATH}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Create New Loan</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loan Details</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-destructive">{error}</div>
          ) : (
            <LoanForm borrowers={borrowers || []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
export const DASH_L_LOANS_NEW_PATH = "/dashboard/l/loans/new";
