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
  }).format(new Date(date));
}

export function calculateMonthlyPayment(
  principal: number,
  annualInterestRate: number,
  termMonths: number
): number {
  // Convert annual interest rate to monthly rate and decimal form
  const monthlyRate = annualInterestRate / 100 / 12;

  // Calculate monthly payment using the loan payment formula
  if (monthlyRate === 0) {
    // If interest rate is 0, simply divide principal by term
    return principal / termMonths;
  }

  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  return payment;
}

export function calculateTotalInterest(
  principal: number,
  monthlyPayment: number,
  termMonths: number
): number {
  const totalPayments = monthlyPayment * termMonths;
  return totalPayments - principal;
}
