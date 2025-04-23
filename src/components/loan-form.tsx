"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldValues } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { createLoan, updateLoan } from "@/actions/lender/loan";
import { toast } from "sonner";
import { DASH_L_LOANS_ID_PATH } from "@/app/dashboard/l/loans/[id]/path";
import { DASH_L_LOANS_PATH } from "@/app/dashboard/l/loans/path";
const formSchema = z.object({
  userId: z.string().min(1, "Borrower is required"),
  amount: z.string().min(1, "Amount is required"),
  interestRate: z.string().min(1, "Interest rate is required"),
  termMonths: z.string().min(1, "Term is required"),
  status: z.enum(["pending", "active", "paid", "defaulted", "cancelled"], {
    required_error: "Status is required",
  }),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
  purpose: z.string().optional(),
  notes: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

interface Borrower {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface Loan {
  id: number;
  borrowerId: number;
  amount: string;
  interestRate: string;
  termMonths: number;
  status: "pending" | "active" | "paid" | "defaulted" | "cancelled";
  startDate: Date | null;
  endDate: Date | null;
  purpose: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface LoanFormProps {
  borrowers: Borrower[];
  loan?: Loan;
}

export default function LoanForm({ borrowers, loan }: LoanFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const isEditing = !!loan;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: loan ? loan.borrowerId.toString() : "",
      amount: loan ? loan.amount.toString() : "",
      interestRate: loan ? loan.interestRate.toString() : "",
      termMonths: loan ? loan.termMonths.toString() : "",
      status: loan ? loan.status : "pending",
      startDate: loan?.startDate ? new Date(loan.startDate) : null,
      endDate: loan?.endDate ? new Date(loan.endDate) : null,
      purpose: loan?.purpose || "",
      notes: loan?.notes || "",
    },
  });

  // Watch for changes in startDate and termMonths
  const startDate = form.watch("startDate");
  const termMonths = form.watch("termMonths");

  useEffect(() => {
    if (startDate && termMonths) {
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + parseInt(termMonths));
      form.setValue("endDate", endDate);
    }
  }, [startDate, termMonths, form]);

  const onSubmit = async (values: FormSchema) => {
    setIsSubmitting(true);
    try {
      // Parse the formatted values
      const amount = parseFloat(values.amount.replace(/[^0-9.-]+/g, ""));
      const interestRate =
        parseFloat(values.interestRate.replace(/[^0-9.-]+/g, "")) / 100; // Convert percentage to decimal

      const loanData = {
        userId: Number.parseInt(values.userId),
        amount,
        interestRate,
        termMonths: Number.parseInt(values.termMonths),
        status: values.status,
        startDate: values.startDate || undefined,
        endDate: values.endDate || undefined,
        purpose: values.purpose || undefined,
        notes: values.notes || undefined,
      };

      let result;
      if (isEditing && loan) {
        result = await updateLoan(loan.id, loanData);
      } else {
        result = await createLoan(loanData);
      }

      if (result.error) {
        toast("Error", {
          description: result.error,
        });
      } else {
        toast("Success", {
          description: isEditing
            ? "Loan has been updated successfully"
            : "Loan has been created successfully",
        });
        router.push(
          isEditing
            ? DASH_L_LOANS_ID_PATH(loan?.id.toString())
            : DASH_L_LOANS_PATH
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
        <FormField
          control={form.control}
          name="userId"
          render={({ field }: { field: FieldValues }) => (
            <FormItem>
              <FormLabel>Borrower</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a borrower" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {borrowers.map((borrower) => (
                    <SelectItem
                      key={borrower.id}
                      value={borrower.id.toString()}
                    >
                      {borrower.firstName} {borrower.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }: { field: FieldValues }) => (
              <FormItem>
                <FormLabel>Loan Amount</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="$0.00"
                    onChange={(e) => {
                      // Remove non-numeric characters except decimal point
                      const value = e.target.value.replace(/[^0-9.]/g, "");
                      // Ensure only one decimal point
                      const parts = value.split(".");
                      if (parts.length > 2) {
                        parts.pop();
                      }
                      const formattedValue = parts.join(".");
                      field.onChange(formattedValue);
                    }}
                    onBlur={(e) => {
                      // Format as currency on blur
                      const value = e.target.value;
                      if (value) {
                        const numericValue = parseFloat(value);
                        if (!isNaN(numericValue)) {
                          const formattedValue = new Intl.NumberFormat(
                            "en-US",
                            {
                              style: "currency",
                              currency: "USD",
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          ).format(numericValue);
                          field.onChange(formattedValue);
                        }
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="interestRate"
            render={({ field }: { field: FieldValues }) => (
              <FormItem>
                <FormLabel>Interest Rate (%)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="0.00%"
                    onChange={(e) => {
                      // Remove non-numeric characters except decimal point
                      const value = e.target.value.replace(/[^0-9.]/g, "");
                      // Ensure only one decimal point
                      const parts = value.split(".");
                      if (parts.length > 2) {
                        parts.pop();
                      }
                      const formattedValue = parts.join(".");
                      field.onChange(formattedValue);
                    }}
                    onBlur={(e) => {
                      // Format as percentage on blur
                      const value = e.target.value;
                      if (value) {
                        const numericValue = parseFloat(value);
                        if (!isNaN(numericValue)) {
                          const formattedValue = new Intl.NumberFormat(
                            "en-US",
                            {
                              style: "percent",
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          ).format(numericValue / 100);
                          field.onChange(formattedValue);
                        }
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="termMonths"
            render={({ field }: { field: FieldValues }) => (
              <FormItem>
                <FormLabel>Term (Months)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="12" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }: { field: FieldValues }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select loan status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="defaulted">Defaulted</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }: { field: FieldValues }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }: { field: FieldValues }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="purpose"
          render={({ field }: { field: FieldValues }) => (
            <FormItem>
              <FormLabel>Purpose</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Purpose of the loan" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }: { field: FieldValues }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional notes about this loan"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(DASH_L_LOANS_PATH)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
                ? "Update Loan"
                : "Create Loan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
