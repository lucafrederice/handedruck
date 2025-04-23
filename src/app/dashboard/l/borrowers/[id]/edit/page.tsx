import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BorrowerForm from "@/components/borrower-form";
import { getBorrower } from "@/actions/lender/borrower";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DASH_L_BORROWERS_ID_PATH } from "../path";
import { Decimal } from "@prisma/client/runtime/library";

type PrismaBorrower = {
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
  loans: {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
    amount: Decimal;
    interestRate: Decimal;
    termMonths: number;
    status: "pending" | "active" | "paid" | "defaulted" | "cancelled";
    approvedByUs: boolean;
    approvedByCustomer: boolean;
    startDate: Date | null;
    endDate: Date | null;
    purpose: string | null;
    notes: string | null;
  }[];
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBorrowerPage({ params }: PageProps) {
  const resolvedParams = await params;
  const result = await getBorrower(parseInt(resolvedParams.id));

  if (!result.borrower) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Borrower not found</p>
      </div>
    );
  }

  const borrower = result.borrower as PrismaBorrower;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link href={DASH_L_BORROWERS_ID_PATH(resolvedParams.id)}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Borrower</h1>
          <p className="text-muted-foreground">
            Update borrower information and details
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Borrower Information</CardTitle>
        </CardHeader>
        <CardContent>
          <BorrowerForm
            borrower={{
              id: borrower.id,
              firstName: borrower.firstName || "",
              lastName: borrower.lastName || "",
              email: borrower.email || "",
              phone: borrower.phone,
              address: borrower.address,
              creditScore: borrower.creditScore,
              createdAt: borrower.createdAt,
              updatedAt: borrower.updatedAt,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
