import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoanForm from "@/components/loan-form";
import { getLoan } from "@/actions/lender/loan";
import { getBorrowers } from "@/actions/lender/borrower";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DASH_L_LOANS_ID_PATH } from "../path";
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

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditLoanPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { loan, error: loanError } = await getLoan(parseInt(resolvedParams.id));
  const { borrowers, error: borrowersError } = await getBorrowers();

  if (loanError || !loan) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Loan not found</p>
      </div>
    );
  }

  // Transform Prisma data to match LoanForm's expected types
  const transformedLoan = {
    id: loan.id,
    borrowerId: loan.userId,
    amount: loan.amount.toString(),
    interestRate: loan.interestRate.toString(),
    termMonths: loan.termMonths,
    status: loan.status,
    startDate: loan.startDate,
    endDate: loan.endDate,
    purpose: loan.purpose,
    notes: loan.notes,
    createdAt: loan.createdAt,
    updatedAt: loan.updatedAt,
  };

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
        <Link href={DASH_L_LOANS_ID_PATH(resolvedParams.id)}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Loan</h1>
          <p className="text-muted-foreground">
            Update loan information and details
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loan Information</CardTitle>
        </CardHeader>
        <CardContent>
          {borrowersError ? (
            <div className="text-destructive">{borrowersError}</div>
          ) : (
            <LoanForm borrowers={transformedBorrowers} loan={transformedLoan} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
