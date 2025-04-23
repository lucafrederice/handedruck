import Link from "next/link";
import {
  formatCurrency,
  formatDate,
  calculateMonthlyPayment,
} from "@/lib/loan-utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, ArrowRight, AlertCircle } from "lucide-react";
import { getUserLoans } from "@/actions/borrower/loan";

type LoanStatus = "pending" | "active" | "paid" | "defaulted" | "cancelled";

type Loan = {
  id: number;
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
  createdAt: Date;
  updatedAt: Date;
  payments: {
    id: number;
    loanId: number;
    amount: number;
    paymentDate: Date;
    status: "pending" | "completed" | "failed" | "cancelled";
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }[];
};

export default async function MyLoansPage() {
  const { loans, error } = await getUserLoans();

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!loans) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">No loans found</p>
      </div>
    );
  }

  // Separate pending loans that need approval
  const pendingApproval = loans.filter(
    (loan: Loan) => loan.status === "pending" && !loan.approvedByCustomer
  );

  // Active and other loans
  const otherLoans = loans.filter(
    (loan: Loan) =>
      !(
        loan.status === "pending" &&
        loan.approvedByUs &&
        !loan.approvedByCustomer
      )
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Loans</h1>
          <p className="text-muted-foreground">
            View and manage all your loans
          </p>
        </div>
        <Link href="/dashboard/b/apply">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Apply for New Loan
          </Button>
        </Link>
      </div>

      {pendingApproval.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-amber-600 dark:text-amber-400">
              <AlertCircle className="mr-2 h-5 w-5" />
              Loans Pending Your Approval
            </CardTitle>
            <CardDescription>
              The following loans have been approved by us and require your
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
                      <Link href={`/dashboard/b/loan/${loan.id}`}>
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
          <CardDescription>Your complete loan history</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loan ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Monthly Payment</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {otherLoans.length > 0 ? (
                otherLoans.map((loan: Loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">#{loan.id}</TableCell>
                    <TableCell>{formatCurrency(loan.amount)}</TableCell>
                    <TableCell>
                      {loan.status !== "pending"
                        ? formatCurrency(
                            calculateMonthlyPayment(
                              loan.amount,
                              loan.interestRate,
                              loan.termMonths
                            )
                          )
                        : "N/A"}
                    </TableCell>
                    <TableCell>{loan.purpose}</TableCell>
                    <TableCell>
                      <LoanStatusBadge status={loan.status} />
                    </TableCell>
                    <TableCell>{formatDate(loan.startDate)}</TableCell>
                    <TableCell>
                      <Link href={`/dashboard/b/loan/${loan.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <p className="text-muted-foreground">
                        You don&apos;t have any loans yet
                      </p>
                      <Link href="/dashboard/b/apply">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Apply for a Loan
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function LoanStatusBadge({ status }: { status: LoanStatus }) {
  switch (status) {
    case "active":
      return <Badge>Active</Badge>;
    case "paid":
      return <Badge variant="secondary">Paid</Badge>;
    case "defaulted":
      return <Badge variant="destructive">Defaulted</Badge>;
    case "pending":
      return <Badge variant="outline">Pending</Badge>;
    case "cancelled":
      return (
        <Badge variant="outline" className="bg-muted">
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
