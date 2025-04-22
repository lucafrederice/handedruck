import Link from "next/link";
import { getBorrowers } from "@/actions/lender/borrower";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Mail, Phone, CreditCard } from "lucide-react";
import { type Borrower } from "@/types";
import { DASH_L_BORROWERS_NEW_PATH } from "./new/path";
import { DASH_L_BORROWERS_ID_PATH } from "./[id]/path";

export default async function BorrowersPage() {
  const { borrowers, error } = await getBorrowers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Borrowers</h1>
          <p className="text-muted-foreground">
            Manage your borrower information
          </p>
        </div>
        <Link href={DASH_L_BORROWERS_NEW_PATH}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Borrower
          </Button>
        </Link>
      </div>

      {error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">Error: {error}</div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Borrowers</CardTitle>
            <CardDescription>
              A list of all borrowers in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Credit Score</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {borrowers && borrowers.length > 0 ? (
                  borrowers.map((borrower: Borrower) => (
                    <TableRow key={borrower.id}>
                      <TableCell>{borrower.id}</TableCell>
                      <TableCell className="font-medium">
                        {borrower.firstName} {borrower.lastName}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <span className="flex items-center text-sm">
                            <Mail className="mr-2 h-3 w-3" />
                            {borrower.email}
                          </span>
                          {borrower.phone && (
                            <span className="flex items-center text-sm">
                              <Phone className="mr-2 h-3 w-3" />
                              {borrower.phone}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span
                            className={
                              borrower.creditScore &&
                              borrower.creditScore >= 700
                                ? "text-green-600 dark:text-green-400"
                                : borrower.creditScore &&
                                    borrower.creditScore >= 650
                                  ? "text-yellow-600 dark:text-yellow-400"
                                  : "text-red-600 dark:text-red-400"
                            }
                          >
                            {borrower.creditScore || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={DASH_L_BORROWERS_ID_PATH(
                            borrower.id.toString()
                          )}
                        >
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No borrowers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
