export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(date: Date | null): string {
  if (!date) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function calculateMonthlyPayment(
  principal: number,
  interestRate: number,
  termMonths: number
): number {
  const monthlyRate = interestRate / 100 / 12;
  const numerator =
    principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths);
  const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
  return numerator / denominator;
}

export function calculateTotalInterest(
  principal: number,
  monthlyPayment: number,
  termMonths: number
): number {
  return monthlyPayment * termMonths - principal;
}

export function calculateRemainingBalance(
  loan: {
    amount: number;
    interestRate: number;
    termMonths: number;
    startDate: Date | null;
  },
  payments: {
    amount: number;
    paymentDate: Date;
    status: string;
  }[]
): number {
  if (!loan.startDate) return loan.amount;

  const completedPayments = payments.filter((p) => p.status === "completed");
  const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0);
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

  return loan.amount + totalInterest - totalPaid;
}

export function calculatePaymentProgress(
  loan: {
    termMonths: number;
  },
  payments: {
    status: string;
  }[]
): number {
  const completedPayments = payments.filter(
    (p) => p.status === "completed"
  ).length;
  return (completedPayments / loan.termMonths) * 100;
}
