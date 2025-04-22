// import { type Prisma } from "@prisma/client";

// type Borrower = {
//   id: number;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string | null;
//   address: string | null;
//   creditScore: number | null;
//   createdAt: Date;
//   updatedAt: Date;
// };

// type Loan = {
//   id: number;
//   borrowerId: number;
//   amount: Prisma.Decimal;
//   interestRate: Prisma.Decimal;
//   termMonths: number;
//   status: "pending" | "active" | "paid" | "defaulted" | "cancelled";
//   startDate: Date | null;
//   endDate: Date | null;
//   purpose: string | null;
//   notes: string | null;
//   createdAt: Date;
//   updatedAt: Date;
// };

// type Payment = {
//   id: number;
//   loanId: number;
//   amount: Prisma.Decimal;
//   paymentDate: Date;
//   status: "pending" | "completed" | "failed" | "cancelled";
//   notes: string | null;
//   createdAt: Date;
//   updatedAt: Date;
// };

// // Mock borrowers data
// export const mockBorrowers: Borrower[] = [
//   {
//     id: 1,
//     firstName: "John",
//     lastName: "Doe",
//     email: "john.doe@example.com",
//     phone: "555-123-4567",
//     address: "123 Main St, Anytown, USA",
//     creditScore: 720,
//     createdAt: new Date("2023-01-15T08:00:00Z"),
//     updatedAt: new Date("2023-01-15T08:00:00Z"),
//   },
//   {
//     id: 2,
//     firstName: "Jane",
//     lastName: "Smith",
//     email: "jane.smith@example.com",
//     phone: "555-987-6543",
//     address: "456 Oak Ave, Somewhere, USA",
//     creditScore: 680,
//     createdAt: new Date("2023-02-20T10:30:00Z"),
//     updatedAt: new Date("2023-02-20T10:30:00Z"),
//   },
//   {
//     id: 3,
//     firstName: "Michael",
//     lastName: "Johnson",
//     email: "michael.johnson@example.com",
//     phone: "555-456-7890",
//     address: "789 Pine Rd, Elsewhere, USA",
//     creditScore: 750,
//     createdAt: new Date("2023-03-10T14:15:00Z"),
//     updatedAt: new Date("2023-03-10T14:15:00Z"),
//   },
//   {
//     id: 4,
//     firstName: "Sarah",
//     lastName: "Williams",
//     email: "sarah.williams@example.com",
//     phone: "555-789-0123",
//     address: "321 Cedar Ln, Nowhere, USA",
//     creditScore: 700,
//     createdAt: new Date("2023-04-05T09:45:00Z"),
//     updatedAt: new Date("2023-04-05T09:45:00Z"),
//   },
//   {
//     id: 5,
//     firstName: "David",
//     lastName: "Brown",
//     email: "david.brown@example.com",
//     phone: "555-234-5678",
//     address: "654 Maple Dr, Anywhere, USA",
//     creditScore: 630,
//     createdAt: new Date("2023-05-12T11:20:00Z"),
//     updatedAt: new Date("2023-05-12T11:20:00Z"),
//   },
// ];

// // Mock loans data
// export const mockLoans: Loan[] = [
//   {
//     id: 1,
//     borrowerId: 1,
//     amount: new Prisma.Decimal("10000.00"),
//     interestRate: new Prisma.Decimal("5.25"),
//     termMonths: 36,
//     status: "active",
//     startDate: new Date("2023-02-01T00:00:00Z"),
//     endDate: new Date("2026-02-01T00:00:00Z"),
//     purpose: "Home renovation",
//     notes: "Approved after verification of income and credit score",
//     createdAt: new Date("2023-01-20T14:30:00Z"),
//     updatedAt: new Date("2023-01-25T10:15:00Z"),
//   },
//   {
//     id: 2,
//     borrowerId: 2,
//     amount: new Prisma.Decimal("5000.00"),
//     interestRate: new Prisma.Decimal("6.50"),
//     termMonths: 24,
//     status: "active",
//     startDate: new Date("2023-03-15T00:00:00Z"),
//     endDate: new Date("2025-03-15T00:00:00Z"),
//     purpose: "Education expenses",
//     notes: "Student loan for graduate studies",
//     createdAt: new Date("2023-03-01T09:45:00Z"),
//     updatedAt: new Date("2023-03-10T16:20:00Z"),
//   },
//   {
//     id: 3,
//     borrowerId: 3,
//     amount: new Prisma.Decimal("25000.00"),
//     interestRate: new Prisma.Decimal("4.75"),
//     termMonths: 60,
//     status: "active",
//     startDate: new Date("2023-04-01T00:00:00Z"),
//     endDate: new Date("2028-04-01T00:00:00Z"),
//     purpose: "Business expansion",
//     notes: "Secured with business assets",
//     createdAt: new Date("2023-03-20T11:30:00Z"),
//     updatedAt: new Date("2023-03-28T14:10:00Z"),
//   },
//   {
//     id: 4,
//     borrowerId: 4,
//     amount: new Prisma.Decimal("7500.00"),
//     interestRate: new Prisma.Decimal("7.00"),
//     termMonths: 12,
//     status: "paid",
//     startDate: new Date("2023-05-01T00:00:00Z"),
//     endDate: new Date("2024-05-01T00:00:00Z"),
//     purpose: "Debt consolidation",
//     notes: "Early repayment completed",
//     createdAt: new Date("2023-04-15T10:00:00Z"),
//     updatedAt: new Date("2023-04-25T15:45:00Z"),
//   },
//   {
//     id: 5,
//     borrowerId: 5,
//     amount: new Prisma.Decimal("15000.00"),
//     interestRate: new Prisma.Decimal("6.25"),
//     termMonths: 48,
//     status: "pending",
//     startDate: null,
//     endDate: null,
//     purpose: "Vehicle purchase",
//     notes: "Awaiting final approval",
//     createdAt: new Date("2023-05-20T13:15:00Z"),
//     updatedAt: new Date("2023-05-20T13:15:00Z"),
//   },
//   {
//     id: 6,
//     borrowerId: 1,
//     amount: new Prisma.Decimal("3000.00"),
//     interestRate: new Prisma.Decimal("8.00"),
//     termMonths: 6,
//     status: "defaulted",
//     startDate: new Date("2022-10-01T00:00:00Z"),
//     endDate: new Date("2023-04-01T00:00:00Z"),
//     purpose: "Emergency expenses",
//     notes: "Missed last 3 payments",
//     createdAt: new Date("2022-09-15T09:30:00Z"),
//     updatedAt: new Date("2023-03-10T16:45:00Z"),
//   },
// ];

// // Mock payments data
// export const mockPayments: Payment[] = [
//   {
//     id: 1,
//     loanId: 1,
//     amount: new Prisma.Decimal("305.00"),
//     paymentDate: new Date("2023-03-01T00:00:00Z"),
//     status: "completed",
//     notes: "On-time payment",
//     createdAt: new Date("2023-03-01T10:15:00Z"),
//     updatedAt: new Date("2023-03-01T10:15:00Z"),
//   },
//   {
//     id: 2,
//     loanId: 1,
//     amount: new Prisma.Decimal("305.00"),
//     paymentDate: new Date("2023-04-01T00:00:00Z"),
//     status: "completed",
//     notes: "On-time payment",
//     createdAt: new Date("2023-04-01T09:30:00Z"),
//     updatedAt: new Date("2023-04-01T09:30:00Z"),
//   },
//   {
//     id: 3,
//     loanId: 2,
//     amount: new Prisma.Decimal("223.00"),
//     paymentDate: new Date("2023-04-15T00:00:00Z"),
//     status: "completed",
//     notes: "On-time payment",
//     createdAt: new Date("2023-04-15T14:45:00Z"),
//     updatedAt: new Date("2023-04-15T14:45:00Z"),
//   },
//   {
//     id: 4,
//     loanId: 3,
//     amount: new Prisma.Decimal("470.00"),
//     paymentDate: new Date("2023-05-01T00:00:00Z"),
//     status: "completed",
//     notes: "On-time payment",
//     createdAt: new Date("2023-05-01T11:20:00Z"),
//     updatedAt: new Date("2023-05-01T11:20:00Z"),
//   },
//   {
//     id: 5,
//     loanId: 4,
//     amount: new Prisma.Decimal("7875.00"),
//     paymentDate: new Date("2023-06-01T00:00:00Z"),
//     status: "completed",
//     notes: "Full repayment",
//     createdAt: new Date("2023-06-01T15:10:00Z"),
//     updatedAt: new Date("2023-06-01T15:10:00Z"),
//   },
//   {
//     id: 6,
//     loanId: 1,
//     amount: new Prisma.Decimal("305.00"),
//     paymentDate: new Date("2023-05-01T00:00:00Z"),
//     status: "completed",
//     notes: "On-time payment",
//     createdAt: new Date("2023-05-01T10:30:00Z"),
//     updatedAt: new Date("2023-05-01T10:30:00Z"),
//   },
//   {
//     id: 7,
//     loanId: 2,
//     amount: new Prisma.Decimal("223.00"),
//     paymentDate: new Date("2023-05-15T00:00:00Z"),
//     status: "completed",
//     notes: "On-time payment",
//     createdAt: new Date("2023-05-15T13:45:00Z"),
//     updatedAt: new Date("2023-05-15T13:45:00Z"),
//   },
//   {
//     id: 8,
//     loanId: 3,
//     amount: new Prisma.Decimal("470.00"),
//     paymentDate: new Date("2023-06-01T00:00:00Z"),
//     status: "pending",
//     notes: "Scheduled payment",
//     createdAt: new Date("2023-05-25T09:15:00Z"),
//     updatedAt: new Date("2023-05-25T09:15:00Z"),
//   },
// ];

// // Helper function to get a loan with its borrower
// export function getLoanWithBorrower(loanId: number) {
//   const loan = mockLoans.find((loan) => loan.id === loanId);
//   if (!loan) return null;

//   const borrower = mockBorrowers.find(
//     (borrower) => borrower.id === loan.borrowerId
//   );
//   return { ...loan, borrower };
// }

// // Helper function to get payments for a loan
// export function getPaymentsForLoan(loanId: number) {
//   return mockPayments.filter((payment) => payment.loanId === loanId);
// }

// // Helper function to get loans for a borrower
// export function getLoansForBorrower(borrowerId: number) {
//   return mockLoans.filter((loan) => loan.borrowerId === borrowerId);
// }
