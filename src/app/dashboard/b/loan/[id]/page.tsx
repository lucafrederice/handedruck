import Link from "next/link";
import {
  formatCurrency,
  formatDate,
  calculateMonthlyPayment,
  calculateTotalInterest,
  calculateRemainingBalance,
  calculatePaymentProgress,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Percent,
  Clock,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getUserLoan, approveLoan, declineLoan } from "@/actions/borrower/loan";

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

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function LoanPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { loan, error } = await getUserLoan(parseInt(resolvedParams.id));

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Loan not found</p>
      </div>
    );
  }

  const monthlyPayment = calculateMonthlyPayment(
    loan.amount,
    loan.interestRate,
    loan.termMonths
  );
  const totalInterest = calculateTotalInterest(
    loan.amount,
    monthlyPayment,
    loan.termMonths
  );
  const remainingBalance = calculateRemainingBalance(loan, loan.payments);
  const paymentProgress = calculatePaymentProgress(loan, loan.payments);

  const needsApproval = loan.status === "pending" && !loan.approvedByCustomer;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/b">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Loan #{loan.id}</h1>
          <Badge className="ml-2">
            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
          </Badge>
        </div>
        {loan.status === "active" && <Button>Make a Payment</Button>}
      </div>

      {needsApproval && (
        <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
          <AlertTitle className="flex items-center text-amber-600 dark:text-amber-400">
            This loan requires your approval
          </AlertTitle>
          <AlertDescription>
            <p className="mb-4">
              We&apos;ve approved your loan application. Please review the
              details and confirm if you&apos;d like to proceed.
            </p>
            <div className="flex space-x-2">
              <form
                action={async () => {
                  "use server";
                  await approveLoan(loan.id);
                }}
              >
                <Button className="bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Accept Loan
                </Button>
              </form>
              <form
                action={async () => {
                  "use server";
                  await declineLoan(loan.id);
                }}
              >
                <Button
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Decline
                </Button>
              </form>
            </div>
          </AlertDescription>
        </Alert>
      )}

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
                  <DollarSign className="mr-2 h-4 w-4" />
                  Amount
                </dt>
                <dd className="text-sm font-medium">
                  {formatCurrency(loan.amount)}
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
                    {formatCurrency(loan.amount)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Monthly Payment
                  </p>
                  <p className="text-2xl font-bold">
                    {loan.status !== "pending"
                      ? formatCurrency(monthlyPayment)
                      : "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Interest
                  </p>
                  <p className="text-2xl font-bold">
                    {loan.status !== "pending"
                      ? formatCurrency(totalInterest)
                      : "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {loan.status === "paid"
                      ? "Total Paid"
                      : "Remaining Balance"}
                  </p>
                  <p className="text-2xl font-bold">
                    {loan.status !== "pending"
                      ? formatCurrency(
                          loan.status === "paid"
                            ? loan.amount + totalInterest
                            : remainingBalance
                        )
                      : "N/A"}
                  </p>
                </div>
              </div>

              {loan.status !== "pending" && (
                <div className="mt-6 pt-4 border-t">
                  <h3 className="font-medium mb-2">Payment Progress</h3>
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: `${paymentProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {
                      loan.payments.filter(
                        (p: {
                          status:
                            | "pending"
                            | "completed"
                            | "failed"
                            | "cancelled";
                        }) => p.status === "completed"
                      ).length
                    }{" "}
                    of {loan.termMonths} payments completed
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
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
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loan.payments.length > 0 ? (
                    loan.payments.map((payment: Payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>#{payment.id}</TableCell>
                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          <PaymentStatusBadge status={payment.status} />
                        </TableCell>
                        <TableCell>{payment.notes || "No notes"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        No payments recorded for this loan
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Loan Documents</CardTitle>
              <CardDescription>
                Important documents related to your loan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Loan Agreement</p>
                      <p className="text-sm text-muted-foreground">
                        PDF • Uploaded on {formatDate(loan.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Payment Schedule</p>
                      <p className="text-sm text-muted-foreground">
                        PDF • Uploaded on {formatDate(loan.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>

                {loan.status !== "pending" && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Loan Statement</p>
                        <p className="text-sm text-muted-foreground">
                          PDF • Generated on {formatDate(new Date())}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  switch (status) {
    case "completed":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
        >
          Completed
        </Badge>
      );
    case "pending":
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"
        >
          Pending
        </Badge>
      );
    case "failed":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
        >
          Failed
        </Badge>
      );
    case "cancelled":
      return (
        <Badge
          variant="outline"
          className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800"
        >
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
