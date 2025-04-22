import { getBorrower } from "@/actions/lender/borrower";
import { notFound } from "next/navigation";
import Link from "next/link";
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
import { ArrowLeft, Edit, Mail, Phone, MapPin, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import DeleteBorrowerButton from "@/components/delete-borrower-button";
import { type Loan } from "@/types";
import { DASH_L_BORROWERS_PATH } from "../page";
import { DASH_L_BORROWERS_ID_EDIT_PATH } from "./edit/page";
export const DASH_L_BORROWERS_ID_PATH = (id: string) =>
  `${DASH_L_BORROWERS_PATH}/${id}`;

export default async function BorrowerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number.parseInt(params.id);
  const { borrower, error } = await getBorrower(id);

  if (error || !borrower) {
    notFound();
  }

  const loans = borrower.loans as Loan[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href={DASH_L_BORROWERS_PATH}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            {borrower.firstName} {borrower.lastName}
          </h1>
        </div>
        <div className="flex space-x-2">
          <Link href={DASH_L_BORROWERS_ID_EDIT_PATH(id.toString())}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <DeleteBorrowerButton id={id} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Borrower Details</CardTitle>
            <CardDescription>
              Personal information and contact details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex items-center">
                <dt className="flex items-center text-sm font-medium text-muted-foreground w-1/3">
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </dt>
                <dd className="text-sm">{borrower.email}</dd>
              </div>
              <div className="flex items-center">
                <dt className="flex items-center text-sm font-medium text-muted-foreground w-1/3">
                  <Phone className="mr-2 h-4 w-4" />
                  Phone
                </dt>
                <dd className="text-sm">{borrower.phone || "Not provided"}</dd>
              </div>
              <div className="flex items-start">
                <dt className="flex items-center text-sm font-medium text-muted-foreground w-1/3 pt-1">
                  <MapPin className="mr-2 h-4 w-4" />
                  Address
                </dt>
                <dd className="text-sm">
                  {borrower.address || "Not provided"}
                </dd>
              </div>
              <div className="flex items-center">
                <dt className="flex items-center text-sm font-medium text-muted-foreground w-1/3">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Credit Score
                </dt>
                <dd className="text-sm">
                  <span
                    className={
                      borrower.creditScore && borrower.creditScore >= 700
                        ? "text-green-600 dark:text-green-400 font-medium"
                        : borrower.creditScore && borrower.creditScore >= 650
                          ? "text-yellow-600 dark:text-yellow-400 font-medium"
                          : "text-red-600 dark:text-red-400 font-medium"
                    }
                  >
                    {borrower.creditScore || "Not available"}
                  </span>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loan Summary</CardTitle>
            <CardDescription>
              Overview of borrower&apos;s loan activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Loans
                  </p>
                  <p className="text-2xl font-bold">
                    {loans ? loans.length : 0}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Loans
                  </p>
                  <p className="text-2xl font-bold">
                    {loans
                      ? loans.filter((loan: Loan) => loan.status === "active")
                          .length
                      : 0}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Borrowed
                  </p>
                  <p className="text-2xl font-bold">
                    {loans
                      ? formatCurrency(
                          loans.reduce(
                            (sum: number, loan: Loan) =>
                              sum + Number(loan.amount),
                            0
                          )
                        )
                      : formatCurrency(0)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Outstanding Balance
                  </p>
                  <p className="text-2xl font-bold">
                    {loans
                      ? formatCurrency(
                          loans
                            .filter(
                              (loan: Loan) =>
                                loan.status === "active" ||
                                loan.status === "pending"
                            )
                            .reduce(
                              (sum: number, loan: Loan) =>
                                sum + Number(loan.amount),
                              0
                            )
                        )
                      : formatCurrency(0)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loans</CardTitle>
          <CardDescription>
            All loans associated with this borrower
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
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
                    <TableCell>{formatCurrency(Number(loan.amount))}</TableCell>
                    <TableCell>{loan.interestRate}%</TableCell>
                    <TableCell>{loan.termMonths} months</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          loan.status === "active"
                            ? "default"
                            : loan.status === "paid"
                              ? "secondary"
                              : loan.status === "defaulted"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {loan.status}
                      </Badge>
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
                  <TableCell colSpan={7} className="text-center">
                    No loans found for this borrower
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
