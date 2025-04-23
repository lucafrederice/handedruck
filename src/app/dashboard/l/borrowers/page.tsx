import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBorrowers } from "@/actions/lender/borrower";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Decimal } from "@prisma/client/runtime/library";

type LoanStatus = "pending" | "active" | "paid" | "defaulted" | "cancelled";

type Loan = {
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

type Borrower = {
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
  loans: Loan[];
};

export default async function BorrowersPage() {
  const { borrowers, error } = await getBorrowers();

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Borrowers</h1>
          <p className="text-muted-foreground">Manage and view all borrowers</p>
        </div>
        <Link href="/dashboard/l/borrowers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Borrower
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Borrowers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Credit Score</TableHead>
                <TableHead>Loans</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {borrowers && borrowers.length > 0 ? (
                borrowers.map((borrower: Borrower) => (
                  <TableRow key={borrower.id}>
                    <TableCell>{borrower.id}</TableCell>
                    <TableCell className="font-medium">
                      {borrower.firstName} {borrower.lastName}
                    </TableCell>
                    <TableCell>{borrower.email}</TableCell>
                    <TableCell>{borrower.phone || "Not provided"}</TableCell>
                    <TableCell>
                      <span
                        className={
                          borrower.creditScore && borrower.creditScore >= 700
                            ? "text-green-600 dark:text-green-400 font-medium"
                            : borrower.creditScore &&
                                borrower.creditScore >= 650
                              ? "text-yellow-600 dark:text-yellow-400 font-medium"
                              : "text-red-600 dark:text-red-400 font-medium"
                        }
                      >
                        {borrower.creditScore || "Not available"}
                      </span>
                    </TableCell>
                    <TableCell>{borrower.loans.length}</TableCell>
                    <TableCell>
                      <Link href={`/dashboard/l/borrowers/${borrower.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No borrowers found
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
