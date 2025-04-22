import { getLoan } from "@/actions/lender/loan";
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Edit,
  User,
  Calendar,
  DollarSign,
  Percent,
  Clock,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
  calculateMonthlyPayment,
  calculateTotalInterest,
} from "@/lib/utils";
import DeleteLoanButton from "@/components/delete-loan-button";
import PaymentForm from "@/components/payment-form";
import { type Payment } from "@/types";
import { DASH_L_LOANS_PATH } from "../page";
import { DASH_L_LOANS_ID_EDIT_PATH } from "./edit/page";

export default async function LoanDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number.parseInt(params.id);
  const { loan, error } = await getLoan(id);

  if (error || !loan) {
    notFound();
  }

  const payments = loan.payments as Payment[];

  const monthlyPayment = calculateMonthlyPayment(
    Number(loan.amount),
    Number(loan.interestRate),
    loan.termMonths
  );

  const totalInterest = calculateTotalInterest(
    Number(loan.amount),
    monthlyPayment,
    loan.termMonths
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href={DASH_L_LOANS_PATH}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Loan #{loan.id}</h1>
          <Badge className="ml-2">{loan.status}</Badge>
        </div>
        <div className="flex space-x-2">
          <Link href={DASH_L_LOANS_ID_EDIT_PATH(loan.id.toString())}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <DeleteLoanButton id={id} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Loan Details</CardTitle>
            <CardDescription>Basic information about this loan</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex items-center">
                <dt className="flex items-center text-sm font-medium text-muted-foreground w-1/3">
                  <User className="mr-2 h-4 w-4" />
                  Borrower
                </dt>
                <dd className="text-sm">
                  {loan.borrower ? (
                    <Link
                      href={`/borrowers/${loan.borrower.id}`}
                      className="font-medium hover:underline"
                    >
                      {loan.borrower.firstName} {loan.borrower.lastName}
                    </Link>
                  ) : (
                    "Unknown"
                  )}
                </dd>
              </div>
              <div className="flex items-center">
                <dt className="flex items-center text-sm font-medium text-muted-foreground w-1/3">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Amount
                </dt>
                <dd className="text-sm font-medium">
                  {formatCurrency(Number(loan.amount))}
                </dd>
              </div>
              <div className="flex items-center">
                <dt className="flex items-center text-sm font-medium text-muted-foreground w-1/3">
                  <Percent className="mr-2 h-4 w-4" />
                  Interest Rate
                </dt>
                <dd className="text-sm">{loan.interestRate}%</dd>
              </div>
              <div className="flex items-center">
                <dt className="flex items-center text-sm font-medium text-muted-foreground w-1/3">
                  <Clock className="mr-2 h-4 w-4" />
                  Term
                </dt>
                <dd className="text-sm">{loan.termMonths} months</dd>
              </div>
              <div className="flex items-center">
                <dt className="flex items-center text-sm font-medium text-muted-foreground w-1/3">
                  <Calendar className="mr-2 h-4 w-4" />
                  Start Date
                </dt>
                <dd className="text-sm">{formatDate(loan.startDate)}</dd>
              </div>
              <div className="flex items-center">
                <dt className="flex items-center text-sm font-medium text-muted-foreground w-1/3">
                  <Calendar className="mr-2 h-4 w-4" />
                  End Date
                </dt>
                <dd className="text-sm">{formatDate(loan.endDate)}</dd>
              </div>
              <div className="flex items-center">
                <dt className="flex items-center text-sm font-medium text-muted-foreground w-1/3">
                  Purpose
                </dt>
                <dd className="text-sm">{loan.purpose || "Not specified"}</dd>
              </div>
              <div className="flex items-start">
                <dt className="flex items-center text-sm font-medium text-muted-foreground w-1/3 pt-1">
                  Notes
                </dt>
                <dd className="text-sm">{loan.notes || "No notes"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loan Summary</CardTitle>
            <CardDescription>Financial overview of this loan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Principal Amount
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(Number(loan.amount))}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Monthly Payment
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(monthlyPayment)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Interest
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(totalInterest)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Repayment
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(Number(loan.amount) + totalInterest)}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <h3 className="font-medium mb-2">Payment Progress</h3>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{
                      width: `${
                        payments && payments.length > 0
                          ? (payments.filter(
                              (p: Payment) => p.status === "completed"
                            ).length /
                              loan.termMonths) *
                            100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {payments && payments.length > 0
                    ? `${payments.filter((p: Payment) => p.status === "completed").length} of ${loan.termMonths} payments completed`
                    : "No payments made yet"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="add-payment">Add Payment</TabsTrigger>
        </TabsList>
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All payments made for this loan</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments && payments.length > 0 ? (
                    payments.map((payment: Payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.id}</TableCell>
                        <TableCell>
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(Number(payment.amount))}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              payment.status === "completed"
                                ? "default"
                                : payment.status === "pending"
                                  ? "outline"
                                  : "destructive"
                            }
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{payment.notes || "No notes"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No payments recorded
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="add-payment">
          <Card>
            <CardHeader>
              <CardTitle>Add New Payment</CardTitle>
              <CardDescription>
                Record a new payment for this loan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentForm loanId={id} suggestedAmount={monthlyPayment} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const DASH_L_LOANS_ID_PATH = (id: string) => `/dashboard/l/loans/${id}`;
