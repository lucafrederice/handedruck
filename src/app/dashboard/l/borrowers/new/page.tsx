import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BorrowerForm from "@/components/borrower-form";
import { DASH_L_BORROWERS_PATH } from "../page";

export default function NewBorrowerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link href={DASH_L_BORROWERS_PATH}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Add New Borrower</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Borrower Details</CardTitle>
        </CardHeader>
        <CardContent>
          <BorrowerForm />
        </CardContent>
      </Card>
    </div>
  );
}

export const DASH_L_BORROWERS_NEW_PATH = `/dashboard/l/borrowers/new`;
