"use client";

import { sendOTP } from "@/actions/auth/sendOTP";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useServerAction } from "@/lib/useServerAction";
import { useEffect, useState } from "react";
import { z } from "zod";

/**
 * Schema for validating the server action response
 */
const responseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    message: z.string(),
  }),
  z.object({
    success: z.literal(false),
    error: z.string(),
  }),
]);

type ResponseData = z.infer<typeof responseSchema>;

/**
 * Verification form component for OTP verification
 *
 * This component:
 * 1. Displays a form for entering the verification code
 * 2. Handles form submission with validation
 * 3. Provides a resend code functionality with cooldown
 * 4. Shows loading states and error messages
 *
 * @component
 * @param {Object} props - The component props
 * @param {Function} props.handleSubmit - The function to handle form submission
 * @param {string} props.identifier - The email or phone number where the code was sent
 * @returns {JSX.Element} The verification form component
 * @example
 * ```tsx
 * <Form
 *   handleSubmit={handleVerification}
 *   identifier="user@example.com"
 * />
 * ```
 */
export default function Form({
  handleSubmit,
  identifier,
}: {
  handleSubmit: (formData: FormData) => Promise<ResponseData>;
  identifier: string;
}) {
  const [loading, submitFn, state] = useServerAction(
    handleSubmit,
    { success: false, error: "" },
    responseSchema
  );
  const error = state?.success === false ? state.error : "";

  const [resendLoading, resendFn] = useServerAction(
    sendOTP,
    { success: false, message: "" },
    z.object({
      success: z.boolean(),
      message: z.string().optional(),
      status: z.string().optional(),
    })
  );

  const [cooldown, setCooldown] = useState(true);
  const [timeLeft, setTimeLeft] = useState(120);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    if (timeLeft === 0) {
      setCooldown(false);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown, timeLeft]);

  const handleResend = async () => {
    const formData = new FormData();
    formData.append("identifier", identifier);
    formData.append("method", "email");
    await resendFn(formData);
    setCooldown(true);
    setTimeLeft(120);
  };

  return (
    <form action={submitFn}>
      <main className="flex-1 py-12 px-4 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Verify your account</CardTitle>
            <CardDescription>
              Enter the verification code sent to {identifier}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="Enter your verification code"
                  required
                  maxLength={6}
                  pattern="\d{6}"
                  title="Please enter a 6-digit code"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={resendLoading || cooldown}
            >
              {cooldown
                ? `Resend code in ${timeLeft}s`
                : resendLoading
                  ? "Sending..."
                  : "Resend code"}
            </Button>
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
          </CardFooter>
        </Card>
      </main>
    </form>
  );
}
