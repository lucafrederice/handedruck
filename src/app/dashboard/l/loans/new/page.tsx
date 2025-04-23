import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoanForm from "@/components/loan-form";
import { getBorrowers } from "@/actions/lender/borrower";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DASH_L_LOANS_PATH } from "../path";
import { Decimal } from "@prisma/client/runtime/library";

type LoanStatus = "pending" | "active" | "paid" | "defaulted" | "cancelled";

type PrismaLoan = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  amount: Decimal;
  interestRate: Decimal;
  termMonths: number;
  status: LoanStatus;
  approvedByUs: boolean;
  approvedByCustomer: boolean;
  startDate: Date | null;
  endDate: Date | null;
  purpose: string | null;
  notes: string | null;
};

type PrismaBorrower = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  fiscalId: string | null;
  country: string | null;
  address: string | null;
  birthday: Date | null;
  email: string | null;
  phone: string | null;
  creditScore: number | null;
  isAgent: boolean;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  loans: PrismaLoan[];
};

export default async function NewLoanPage() {
  const { borrowers, error } = await getBorrowers();

  // Transform Prisma data to match LoanForm's expected types
  const transformedBorrowers =
    borrowers?.map((borrower: PrismaBorrower) => ({
      id: borrower.id,
      firstName: borrower.firstName || "",
      lastName: borrower.lastName || "",
      email: borrower.email || "",
    })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link href={DASH_L_LOANS_PATH}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Loan</h1>
          <p className="text-muted-foreground">
            Create a new loan for a borrower
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loan Information</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-destructive">{error}</div>
          ) : (
            <LoanForm borrowers={transformedBorrowers} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
