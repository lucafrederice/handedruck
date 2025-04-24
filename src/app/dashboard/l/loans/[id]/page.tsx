import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getLoan } from "@/actions/lender/loan";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { DASH_L_LOANS_PATH } from "../path";
import {
  formatCurrency,
  formatDate,
  calculateMonthlyPayment,
  calculateTotalInterest,
  calculateRemainingBalance,
  calculatePaymentProgress,
} from "@/lib/loan-utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaymentForm from "@/components/payment-form";
import { Badge } from "@/components/ui/badge";
import { AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Alert } from "@/components/ui/alert";
import { approveLoan, declineLoan } from "@/actions/borrower/loan";

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
  const { loan, error } = await getLoan(parseInt(resolvedParams.id));

  if (error || !loan) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Loan not found</p>
      </div>
    );
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
  const remainingBalance = calculateRemainingBalance(loan, payments);
  const paymentProgress = calculatePaymentProgress(loan, payments);

  const needsApproval = loan.status === "pending" && !loan.approvedByUs;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={DASH_L_LOANS_PATH}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Loan #{loan.id}
            </h1>
            <Badge className="ml-2">{loan.status}</Badge>
          </div>
          <p className="text-muted-foreground">View and manage loan details</p>
        </div>
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
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex items-center">
                <dt className="w-1/3 text-sm font-medium text-muted-foreground">
                  Amount
                </dt>
                <dd className="text-sm font-medium">
                  {formatCurrency(loan.amount)}
                </dd>
              </div>
              <div className="flex items-center">
                <dt className="w-1/3 text-sm font-medium text-muted-foreground">
                  Interest Rate
                </dt>
                <dd className="text-sm">{loan.interestRate}%</dd>
              </div>
              <div className="flex items-center">
                <dt className="w-1/3 text-sm font-medium text-muted-foreground">
                  Term
                </dt>
                <dd className="text-sm">{loan.termMonths} months</dd>
              </div>
              <div className="flex items-center">
                <dt className="w-1/3 text-sm font-medium text-muted-foreground">
                  Start Date
                </dt>
                <dd className="text-sm">{formatDate(loan.startDate)}</dd>
              </div>
              <div className="flex items-center">
                <dt className="w-1/3 text-sm font-medium text-muted-foreground">
                  End Date
                </dt>
                <dd className="text-sm">{formatDate(loan.endDate)}</dd>
              </div>
              <div className="flex items-center">
                <dt className="w-1/3 text-sm font-medium text-muted-foreground">
                  Purpose
                </dt>
                <dd className="text-sm">{loan.purpose || "Not specified"}</dd>
              </div>
              <div className="flex items-start">
                <dt className="w-1/3 text-sm font-medium text-muted-foreground pt-1">
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
                      payments.filter(
                        (payment) => payment.status === "completed"
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
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="add-payment">Add Payment</TabsTrigger>
        </TabsList>
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">Payment #{payment.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(payment.paymentDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {payment.status.charAt(0).toUpperCase() +
                            payment.status.slice(1)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No payments recorded</p>
              )}
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
              <PaymentForm loanId={loan.id} suggestedAmount={monthlyPayment} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
