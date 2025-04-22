import { getBorrower } from "@/actions/lender/borrower";
import { notFound } from "next/navigation";
import BorrowerForm from "@/components/borrower-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DASH_L_BORROWERS_ID_PATH } from "../path";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBorrowerPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { borrower, error } = await getBorrower(parseInt(resolvedParams.id));

  if (error || !borrower) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link href={DASH_L_BORROWERS_ID_PATH(resolvedParams.id)}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Edit Borrower</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Borrower Details</CardTitle>
        </CardHeader>
        <CardContent>
          <BorrowerForm borrower={borrower} />
        </CardContent>
      </Card>
    </div>
  );
}
