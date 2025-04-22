import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getLoans } from "@/actions/lender/loan";
import { formatCurrency } from "@/lib/utils";
import { type Loan } from "@/types";

export default async function ReportsPage() {
  const { loans, error } = await getLoans();

  // Calculate summary statistics
  const totalLoans = loans ? loans.length : 0;
  const activeLoans = loans
    ? loans.filter((loan: Loan) => loan.status === "active").length
    : 0;
  const totalLent = loans
    ? loans.reduce((sum: number, loan: Loan) => sum + Number(loan.amount), 0)
    : 0;
  const outstandingBalance = loans
    ? loans
        .filter(
          (loan: Loan) => loan.status === "active" || loan.status === "pending"
        )
        .reduce((sum: number, loan: Loan) => sum + Number(loan.amount), 0)
    : 0;

  // Calculate status distribution
  const statusCounts = loans
    ? loans.reduce(
        (counts: Record<string, number>, loan: Loan) => {
          counts[loan.status] = (counts[loan.status] || 0) + 1;
          return counts;
        },
        {} as Record<string, number>
      )
    : {};

  // Calculate amount distribution by status
  const statusAmounts = loans
    ? loans.reduce(
        (amounts: Record<string, number>, loan: Loan) => {
          amounts[loan.status] =
            (amounts[loan.status] || 0) + Number(loan.amount);
          return amounts;
        },
        {} as Record<string, number>
      )
    : {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          View loan portfolio analytics and statistics
        </p>
      </div>

      {error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">Error: {error}</div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Loans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalLoans}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Loans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{activeLoans}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Lent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(totalLent)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Outstanding Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(outstandingBalance)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Loan Status Distribution</CardTitle>
                <CardDescription>Number of loans by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(Object.entries(statusCounts) as [string, number][]).map(
                    ([status, count]) => (
                      <div key={status} className="flex items-center">
                        <div className="w-1/3 text-sm font-medium capitalize">
                          {status}
                        </div>
                        <div className="w-2/3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  status === "active"
                                    ? "bg-primary"
                                    : status === "paid"
                                      ? "bg-green-500"
                                      : status === "defaulted"
                                        ? "bg-destructive"
                                        : "bg-amber-500"
                                }`}
                                style={{
                                  width: `${(count / totalLoans) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loan Amount Distribution</CardTitle>
                <CardDescription>Total amount by loan status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(Object.entries(statusAmounts) as [string, number][]).map(
                    ([status, amount]) => (
                      <div key={status} className="flex items-center">
                        <div className="w-1/3 text-sm font-medium capitalize">
                          {status}
                        </div>
                        <div className="w-2/3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  status === "active"
                                    ? "bg-primary"
                                    : status === "paid"
                                      ? "bg-green-500"
                                      : status === "defaulted"
                                        ? "bg-destructive"
                                        : "bg-amber-500"
                                }`}
                                style={{
                                  width: `${(amount / totalLent) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {formatCurrency(amount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
