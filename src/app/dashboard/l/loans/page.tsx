import Link from "next/link";
import { getLoans } from "@/actions/lender/loan";
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
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { type Loan } from "@/types";
import { DASH_L_LOANS_NEW_PATH } from "./new/page";

export default async function LoansPage() {
  const { loans, error } = await getLoans();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loans</h1>
          <p className="text-muted-foreground">
            Manage and track all your active loans
          </p>
        </div>
        <Link href={DASH_L_LOANS_NEW_PATH}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Loan
          </Button>
        </Link>
      </div>

      {error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">Error: {error}</div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Loans</CardTitle>
            <CardDescription>A list of all loans in the system</CardDescription>
          </CardHeader>
          <CardContent>
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans && loans.length > 0 ? (
                  loans.map((loan: Loan) => (
                    <TableRow key={loan.id}>
                      <TableCell>{loan.id}</TableCell>
                      <TableCell>
                        {loan.user
                          ? `${loan.user.firstName} ${loan.user.lastName}`
                          : "Unknown"}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(Number(loan.amount))}
                      </TableCell>
                      <TableCell>{loan.interestRate}%</TableCell>
                      <TableCell>{loan.termMonths} months</TableCell>
                      <TableCell>
                        <LoanStatusBadge status={loan.status} />
                      </TableCell>
                      <TableCell>
                        {loan.startDate
                          ? new Date(loan.startDate).toLocaleDateString()
                          : "Not started"}
                      </TableCell>
                      <TableCell>
                        <Link href={`/loans/${loan.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No loans found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LoanStatusBadge({ status }: { status: string }) {
  let variant:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | null
    | undefined;

  switch (status) {
    case "active":
      variant = "default";
      break;
    case "paid":
      variant = "secondary";
      break;
    case "defaulted":
      variant = "destructive";
      break;
    case "pending":
      variant = "outline";
      break;
    default:
      variant = "outline";
  }

  return <Badge variant={variant}>{status}</Badge>;
}

export const DASH_L_LOANS_PATH = "/dashboard/l/loans";
