import Link from "next/link";
import { getLoans } from "@/actions/lender/loan";
import { getBorrowers } from "@/actions/lender/borrower";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, ArrowRight, Plus } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/loan-utils";
import { DASH_L_LOANS_NEW_PATH } from "./new/path";
import { DASH_L_LOANS_ID_PATH } from "./[id]/path";

type LoanStatus = "pending" | "active" | "paid" | "defaulted" | "cancelled";
type PaymentStatus = "pending" | "completed" | "failed" | "cancelled";

type Payment = {
  id: number;
  loanId: number;
  amount: number;
  paymentDate: Date;
  status: PaymentStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type Loan = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  amount: number;
  interestRate: number;
  termMonths: number;
  status: LoanStatus;
  approvedByUs: boolean;
  approvedByCustomer: boolean;
  startDate: Date | null;
  endDate: Date | null;
  purpose: string | null;
  notes: string | null;
  payments: Payment[];
  user: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
};

export default async function LoansPage() {
  const { loans, error } = await getLoans();
  const { borrowers } = await getBorrowers();
  const hasBorrowers = borrowers && borrowers.length > 0;

  // Separate pending loans that need approval
  const pendingApproval = loans?.filter(
    (loan: Loan) => loan.status === "pending" && !loan.approvedByUs
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between max-md:flex-col max-md:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loans</h1>
          <p className="text-muted-foreground">Manage and track all loans</p>
        </div>
        <Link href={hasBorrowers ? DASH_L_LOANS_NEW_PATH : ""}>
          <Button
            disabled={!hasBorrowers}
            title={!hasBorrowers ? "No borrowers available" : ""}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Loan
          </Button>
        </Link>
      </div>

      {pendingApproval && pendingApproval.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-amber-600 dark:text-amber-400">
              <AlertCircle className="mr-2 h-5 w-5" />
              Loans Pending Approval
            </CardTitle>
            <CardDescription>
              The following loans have been asked by borrowers and require our
              confirmation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Interest Rate</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApproval.map((loan: Loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">#{loan.id}</TableCell>
                    <TableCell>{formatCurrency(loan.amount)}</TableCell>
                    <TableCell>{loan.purpose}</TableCell>
                    <TableCell>{loan.termMonths} months</TableCell>
                    <TableCell>{loan.interestRate}%</TableCell>
                    <TableCell>{formatDate(loan.createdAt)}</TableCell>
                    <TableCell>
                      <Link href={DASH_L_LOANS_ID_PATH(loan.id.toString())}>
                        <Button size="sm">
                          Review
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Loans</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-destructive">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Interest Rate</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans && loans.length > 0 ? (
                  loans.map((loan: Loan) => (
                    <TableRow key={loan.id}>
                      <TableCell>{loan.id}</TableCell>
                      <TableCell>
                        {loan.user.firstName} {loan.user.lastName}
                      </TableCell>
                      <TableCell>{formatCurrency(loan.amount)}</TableCell>
                      <TableCell>{loan.interestRate}%</TableCell>
                      <TableCell>{loan.termMonths} months</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            loan.status === "active"
                              ? "bg-green-100 text-green-800"
                              : loan.status === "paid"
                                ? "bg-blue-100 text-blue-800"
                                : loan.status === "defaulted"
                                  ? "bg-red-100 text-red-800"
                                  : loan.status === "cancelled"
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {loan.status.charAt(0).toUpperCase() +
                            loan.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {loan.startDate ? formatDate(loan.startDate) : "N/A"}
                      </TableCell>
                      <TableCell>
                        {loan.endDate ? formatDate(loan.endDate) : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Link href={DASH_L_LOANS_ID_PATH(loan.id.toString())}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No loans found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
