import { redirect } from "next/navigation";
import { completeMinimalRegistration } from "@/actions/auth/completeMinimalRegistration";
import Form from "./form";
import { sendOTP } from "@/actions/auth/sendOTP";
import { z } from "zod";
import { AUTH_VERIFY_PATH } from "../verify/path";

/**
 * Schema for validating the form data
 */
const formDataSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

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

/**
 * Minimal registration page component
 *
 * This page:
 * 1. Collects user's first and last name
 * 2. Validates the input using Zod
 * 3. Completes minimal registration
 * 4. Sends OTP and redirects to verification if successful
 *
 * @component
 * @returns {JSX.Element} The minimal registration page
 * @example
 * ```tsx
 * <Page />
 * ```
 */
export default async function Page() {
  /**
   * Handles form submission with Zod validation
   * @param {FormData} formData - The form data containing first and last name
   * @returns {Promise<z.infer<typeof responseSchema>>} The validation result
   */
  async function handleSubmit(formData: FormData) {
    "use server";

    // Validate form data using Zod
    const validatedData = formDataSchema.parse({
      firstName: formData.get("firstName")?.toString(),
      lastName: formData.get("lastName")?.toString(),
    });

    // Complete registration
    const res = await completeMinimalRegistration({
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
    });

    if (res.success) {
      const sendOTPResponse = await sendOTP();
      if (sendOTPResponse.success) {
        redirect(AUTH_VERIFY_PATH);
      }
    }

    return responseSchema.parse({
      success: false,
      error: "An unknown error happened.",
    });
  }

  return <Form handleSubmit={handleSubmit} />;
}
