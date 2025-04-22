"use client";

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
import { z } from "zod";

/**
 * Schema for validating the form input data
 */
const formDataSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

/**
 * Schema for validating the server action response
 * Uses discriminated union to handle success and error cases
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
 * Minimal registration form component
 *
 * This component:
 * 1. Collects user's first and last name
 * 2. Handles form submission with validation
 * 3. Shows loading state during submission
 * 4. Displays error messages if submission fails
 *
 * @component
 * @param {Object} props - The component props
 * @param {Function} props.handleSubmit - The function to handle form submission
 * @returns {JSX.Element} The form component
 * @example
 * ```tsx
 * <Form handleSubmit={handleRegistration} />
 * ```
 */
export default function Form({
  handleSubmit,
}: {
  handleSubmit: (formData: FormData) => Promise<ResponseData>;
}) {
  const [loading, submitFn, state] = useServerAction(
    handleSubmit,
    { success: false, error: "" },
    responseSchema
  );
  const error = state?.success === false ? state.error : "";

  /**
   * Validates form data before submission
   * @param {FormData} formData - The form data to validate
   * @returns {boolean} Whether the form data is valid
   */
  const validateFormData = (formData: FormData): boolean => {
    try {
      formDataSchema.parse({
        firstName: formData.get("firstName")?.toString(),
        lastName: formData.get("lastName")?.toString(),
      });
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  minLength={1}
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  minLength={1}
                  maxLength={50}
                />
              </div>
            </div>

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
