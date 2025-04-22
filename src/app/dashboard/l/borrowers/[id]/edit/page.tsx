import { getBorrower } from "@/actions/lender/borrower";
import { notFound } from "next/navigation";
import BorrowerForm from "@/components/borrower-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DASH_L_BORROWERS_ID_PATH } from "../page";

export default async function EditBorrowerPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number.parseInt(params.id);
  const { borrower, error } = await getBorrower(id);

  if (error || !borrower) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link href={DASH_L_BORROWERS_ID_PATH(id.toString())}>
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

export const DASH_L_BORROWERS_ID_EDIT_PATH = (id: string) =>
  `${DASH_L_BORROWERS_ID_PATH(id)}/edit`;
