import { verifyOTP } from "@/actions/auth/verifyOTP";
import Form from "./form";
import { readTempIdCookie } from "@/actions/auth/cookies/tempIdCookie/readTempIdCookie";
import { z } from "zod";

/**
 * Schema for validating the OTP code input
 */
const codeSchema = z.string().min(1, "Code is required");

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

export default async function Page() {
  /**
   * Handles form submission with Zod validation
   * @param {FormData} formData - The form data containing the OTP code
   * @returns {Promise<z.infer<typeof responseSchema>>} The validation result
   */
  async function handleSubmit(formData: FormData) {
    "use server";

    // Validate the code using Zod
    const code = codeSchema.parse(formData.get("code")?.toString());

    // Verify the OTP
    const res = await verifyOTP({ code });

    // Validate and return the response
    if (res.success) {
      return responseSchema.parse({
        success: true,
        message: res.message || "Verification successful",
      });
    } else {
      return responseSchema.parse({
        success: false,
        error: res.message || "Verification failed",
      });
    }
  }

  const tempId = await readTempIdCookie();

  return (
    <>
      <Form handleSubmit={handleSubmit} identifier={tempId?.identifier || ""} />
    </>
  );
}
