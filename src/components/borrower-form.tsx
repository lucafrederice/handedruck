"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldValues } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createBorrower, updateBorrower } from "@/actions/lender/borrower";
import { toast } from "sonner";
import { DASH_L_BORROWERS_PATH } from "@/app/dashboard/l/borrowers/path";
import { DASH_L_BORROWERS_ID_PATH } from "@/app/dashboard/l/borrowers/[id]/path";
// Define the form schema
const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  creditScore: z.string().optional(),
});

// Define types
type FormSchema = z.infer<typeof formSchema>;

interface Borrower {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  creditScore: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface BorrowerFormProps {
  borrower?: Borrower;
}

export default function BorrowerForm({ borrower }: BorrowerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const isEditing = !!borrower;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: borrower?.firstName || "",
      lastName: borrower?.lastName || "",
      email: borrower?.email || "",
      phone: borrower?.phone || "",
      address: borrower?.address || "",
      creditScore: borrower?.creditScore?.toString() || "",
    },
  });

  const onSubmit = async (values: FormSchema) => {
    setIsSubmitting(true);
    try {
      const borrowerData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone || undefined,
        address: values.address || undefined,
        creditScore: values.creditScore
          ? parseInt(values.creditScore, 10)
          : undefined,
      };

      let result;
      if (isEditing && borrower) {
        result = await updateBorrower(borrower.id, borrowerData);
      } else {
        result = await createBorrower(borrowerData);
      }

      if (result.error) {
        toast("Error", {
          description: result.error,
        });
      } else {
        toast("Success", {
          description: isEditing
            ? "Borrower has been updated successfully"
            : "Borrower has been created successfully",
        });
        router.push(
          isEditing
            ? DASH_L_BORROWERS_ID_PATH(borrower?.id?.toString())
            : DASH_L_BORROWERS_PATH
        );
      }
    } catch (err) {
      console.error(err);
      toast("Error", {
        description: "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }: { field: FieldValues }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="John" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }: { field: FieldValues }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Doe" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }: { field: FieldValues }) => (
            <FormItem>
              <FormLabel>
                Email <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="john.doe@example.com"
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }: { field: FieldValues }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="555-123-4567" />
              </FormControl>
              <FormDescription>Optional</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }: { field: FieldValues }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="123 Main St, Anytown, USA"
                  className="resize-none"
                />
              </FormControl>
              <FormDescription>Optional</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="creditScore"
          render={({ field }: { field: FieldValues }) => (
            <FormItem>
              <FormLabel>Credit Score</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="300"
                  max="850"
                  placeholder="700"
                />
              </FormControl>
              <FormDescription>
                Optional - Score between 300 and 850
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(DASH_L_BORROWERS_PATH)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
                ? "Update Borrower"
                : "Create Borrower"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
