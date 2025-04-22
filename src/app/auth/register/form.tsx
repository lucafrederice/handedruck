"use client";

import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail } from "lucide-react";
import { useServerAction } from "@/lib/useServerAction";
import { authMethod } from "@/actions/auth/constants";
import { PhoneInput } from "@/components/phone-input";
import { z } from "zod";
import { HANDLE_SUBMIT_FN } from "@/contants";

/**
 * Schema for validating the server action response
 */
const responseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

/**
 * Registration form component that handles user authentication method selection and input.
 *
 * This component:
 * 1. Provides tabs for selecting between email and phone authentication
 * 2. Renders appropriate input fields based on the selected method
 * 3. Handles form submission with validation
 * 4. Shows loading state during submission
 * 5. Displays error messages if submission fails
 *
 * @component
 * @param {Object} props - The component props
 * @param {HANDLE_SUBMIT_FN} props.handleSubmit - The function to handle form submission
 * @returns {JSX.Element} The rendered form component
 * @example
 * ```tsx
 * <Form handleSubmit={handleRegistration} />
 * ```
 */
export default function Form({
  handleSubmit,
}: {
  handleSubmit: HANDLE_SUBMIT_FN;
}) {
  const [loading, submitFn, state] = useServerAction<typeof responseSchema>(
    handleSubmit,
    { success: false, message: "" },
    responseSchema
  );
  const error = state?.message || "";
  const [activeTab, setActiveTab] = useState<string>(authMethod.email);

  /**
   * Validates form data before submission
   * @param {FormData} formData - The form data to validate
   * @returns {boolean} Whether the form data is valid
   */
  const validateFormData = (formData: FormData): boolean => {
    try {
      const data = {
        method: formData.get("method") as string,
        email: formData.get("email")?.toString(),
        phone: formData.get("phone")?.toString(),
      };

      // Validate based on selected method
      if (data.method === authMethod.email) {
        if (!data.email) {
          throw new Error("Email is required");
        }
        if (!data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          throw new Error("Invalid email format");
        }
      } else if (data.method === authMethod.phone) {
        if (!data.phone) {
          throw new Error("Phone number is required");
        }
        if (!data.phone.match(/^\+?[1-9]\d{1,14}$/)) {
          throw new Error("Invalid phone number format");
        }
      }
      return true;
    } catch (error) {
      console.error("Form validation failed:", error);
      return false;
    }
  };

  /**
   * Handles form submission with validation
   * @param {FormData} formData - The form data to submit
   */
  const handleFormSubmit = async (formData: FormData) => {
    if (!validateFormData(formData)) {
      return;
    }
    submitFn(formData);
  };

  return (
    <form action={handleFormSubmit}>
      <main className="flex-1 py-12 px-4 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Sign in
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to manage your lendings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue={authMethod.email}
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value={authMethod.email}>Email</TabsTrigger>
                <TabsTrigger value={authMethod.phone}>Phone</TabsTrigger>
              </TabsList>
              <TabsContent value={authMethod.email} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="your.email@example.com"
                      className="pl-10"
                      required={activeTab === authMethod.email}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value={authMethod.phone} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <PhoneInput name="phone" />
                </div>
              </TabsContent>
            </Tabs>

            <input type="hidden" value={activeTab} name="method" />
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Continue"}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </form>
  );
}
