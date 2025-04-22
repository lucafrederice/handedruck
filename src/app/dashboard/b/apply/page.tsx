"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Calculator, Check } from "lucide-react";
import {
  formatCurrency,
  calculateMonthlyPayment,
  calculateTotalInterest,
} from "@/lib/loan-utils";
import { toast } from "sonner";
import { createLoanApplication } from "@/actions/borrower/loan";

const formSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  purpose: z.string().min(1, "Purpose is required"),
  termMonths: z.string().min(1, "Term is required"),
  additionalInfo: z.string().optional(),
});

export const DASH_B_APPLY_PATH = "/dashboard/b/apply";

export default function LoanApplicationPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loanDetails, setLoanDetails] = useState<{
    amount: number;
    purpose: string;
    termMonths: number;
    interestRate: number;
    monthlyPayment: number;
    totalInterest: number;
    totalRepayment: number;
    additionalInfo?: string;
  } | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      purpose: "",
      termMonths: "36",
      additionalInfo: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (step === 1) {
      // Calculate loan details for preview
      const amount = Number.parseFloat(values.amount);
      const termMonths = Number.parseInt(values.termMonths);
      const interestRate = 5.99; // Fixed interest rate

      const monthlyPayment = calculateMonthlyPayment(
        amount,
        interestRate,
        termMonths
      );
      const totalInterest = calculateTotalInterest(
        amount,
        monthlyPayment,
        termMonths
      );

      setLoanDetails({
        amount,
        purpose: values.purpose,
        termMonths,
        interestRate,
        monthlyPayment,
        totalInterest,
        totalRepayment: amount + totalInterest,
        additionalInfo: values.additionalInfo,
      });

      setStep(2);
      return;
    }

    // Final submission
    setIsSubmitting(true);

    try {
      if (!loanDetails) {
        throw new Error("Loan details not found");
      }

      const result = await createLoanApplication({
        amount: loanDetails.amount,
        interestRate: loanDetails.interestRate,
        termMonths: loanDetails.termMonths,
        purpose: loanDetails.purpose,
        notes: loanDetails.additionalInfo,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success(
        "Your loan application has been submitted successfully. We'll review it shortly."
      );

      router.push("/dashboard/b");
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Apply for a Loan</h1>
        <p className="text-muted-foreground">
          Complete the form below to apply for a new loan
        </p>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 1
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {step > 1 ? <Check className="h-5 w-5" /> : "1"}
          </div>
          <div
            className={`h-1 w-16 ${step >= 2 ? "bg-primary" : "bg-muted"}`}
          ></div>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 2
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {step > 2 ? <Check className="h-5 w-5" /> : "2"}
          </div>
          <div
            className={`h-1 w-16 ${step >= 3 ? "bg-primary" : "bg-muted"}`}
          ></div>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 3
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            3
          </div>
        </div>
        <div className="text-sm font-medium">Step {step} of 3</div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Loan Details</CardTitle>
                <CardDescription>
                  Tell us about the loan you&apos;re applying for
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Amount</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="1000"
                          placeholder="10000"
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the amount you wish to borrow (minimum $1,000)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Purpose</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a purpose for your loan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Home renovation">
                            Home renovation
                          </SelectItem>
                          <SelectItem value="Education expenses">
                            Education expenses
                          </SelectItem>
                          <SelectItem value="Debt consolidation">
                            Debt consolidation
                          </SelectItem>
                          <SelectItem value="Vehicle purchase">
                            Vehicle purchase
                          </SelectItem>
                          <SelectItem value="Medical expenses">
                            Medical expenses
                          </SelectItem>
                          <SelectItem value="Business expenses">
                            Business expenses
                          </SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="termMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Term</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a loan term" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="12">12 months (1 year)</SelectItem>
                          <SelectItem value="24">
                            24 months (2 years)
                          </SelectItem>
                          <SelectItem value="36">
                            36 months (3 years)
                          </SelectItem>
                          <SelectItem value="48">
                            48 months (4 years)
                          </SelectItem>
                          <SelectItem value="60">
                            60 months (5 years)
                          </SelectItem>
                          <SelectItem value="72">
                            72 months (6 years)
                          </SelectItem>
                          <SelectItem value="84">
                            84 months (7 years)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Information</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide any additional information that might help us process your application"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/b")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button type="submit">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 2 && loanDetails && (
            <Card>
              <CardHeader>
                <CardTitle>Review Loan Details</CardTitle>
                <CardDescription>
                  Please review your loan details before submitting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Loan Amount
                    </p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(loanDetails.amount)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Loan Purpose
                    </p>
                    <p className="text-lg font-semibold">
                      {loanDetails.purpose}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Loan Term
                    </p>
                    <p className="text-lg font-semibold">
                      {loanDetails.termMonths} months
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Interest Rate
                    </p>
                    <p className="text-lg font-semibold">
                      {loanDetails.interestRate}%
                    </p>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg mt-6">
                  <div className="flex items-center mb-4">
                    <Calculator className="h-5 w-5 mr-2 text-primary" />
                    <h3 className="font-semibold">Loan Calculation</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Monthly Payment
                      </p>
                      <p className="text-xl font-bold">
                        {formatCurrency(loanDetails.monthlyPayment)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Interest
                      </p>
                      <p className="text-xl font-bold">
                        {formatCurrency(loanDetails.totalInterest)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Repayment
                      </p>
                      <p className="text-xl font-bold">
                        {formatCurrency(loanDetails.totalRepayment)}
                      </p>
                    </div>
                  </div>
                </div>

                {loanDetails.additionalInfo && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Additional Information
                    </p>
                    <p className="text-sm">{loanDetails.additionalInfo}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </form>
      </Form>
    </div>
  );
}
