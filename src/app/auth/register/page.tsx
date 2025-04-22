import { redirect } from "next/navigation";
import { AUTH_MINIMAL_REGISTRATION_PATH } from "../(temp-cookie)/minimal-registration/page";
import Form from "./form";
import { AUTH_VERIFY_PATH } from "../(temp-cookie)/verify/page";
import { register } from "@/actions/auth/register";
import { authMethod, REGISTRATION_STATUS } from "@/actions/auth/constants";
import { HANDLE_SUBMIT_FN } from "@/constants";
import { sendOTP } from "@/actions/auth/sendOTP";
import { z } from "zod";

export const AUTH_REGISTER_PATH = "/auth/register";

// Define schemas for validation
const formDataSchema = z.object({
  email: z.string().email().optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/)
    .optional(), // E.164 format
  method: z.enum([authMethod.email, authMethod.phone]),
});

const registrationResponseSchema = z.object({
  status: z.enum([
    REGISTRATION_STATUS.MINIMAL_REGISTRATION_COMPLETED,
    REGISTRATION_STATUS.MINIMAL_REGISTRATION_INCOMPLETED,
  ]),
  message: z.string().optional(),
});

const handleSubmitResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

/**
 * Registration page component that handles user registration.
 *
 * @component
 * @returns {Promise<JSX.Element>} The rendered registration page
 */
export default async function Page() {
  /**
   * Handles form submission for user registration.
   *
   * @param {FormData} formData - The form data containing email, phone, and method
   * @returns {Promise<HandleSubmitResponse | void>} The response or redirect
   */
  const handleSubmit: HANDLE_SUBMIT_FN = async (formData) => {
    "use server";

    try {
      // Validate form data
      const validatedData = formDataSchema.parse({
        email: formData.get("email")?.toString(),
        phone: formData.get("phone")?.toString(),
        method: formData.get("method")?.toString(),
      });

      let res;

      if (validatedData.method === authMethod.email) {
        if (!validatedData.email) {
          return handleSubmitResponseSchema.parse({
            success: false,
            message: "Email is required.",
          });
        }

        res = await register({
          identifier: validatedData.email,
          method: validatedData.method,
        });
      }

      if (validatedData.method === authMethod.phone) {
        if (!validatedData.phone) {
          return handleSubmitResponseSchema.parse({
            success: false,
            message: "Phone is required.",
          });
        }

        res = await register({
          identifier: validatedData.phone,
          method: validatedData.method,
        });
      }

      // Validate registration response
      const validatedResponse = registrationResponseSchema.parse(res);

      if (
        validatedResponse.status ===
        REGISTRATION_STATUS.MINIMAL_REGISTRATION_COMPLETED
      ) {
        await sendOTP();
        return redirect(AUTH_VERIFY_PATH);
      }

      if (
        validatedResponse.status ===
        REGISTRATION_STATUS.MINIMAL_REGISTRATION_INCOMPLETED
      ) {
        return redirect(AUTH_MINIMAL_REGISTRATION_PATH);
      }

      return handleSubmitResponseSchema.parse({
        success: false,
        message: validatedResponse.message || "",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return handleSubmitResponseSchema.parse({
          success: false,
          message: error.errors[0].message,
        });
      }
      return handleSubmitResponseSchema.parse({
        success: false,
        message: "An unexpected error occurred.",
      });
    }
  };

  return (
    <>
      <Form handleSubmit={handleSubmit} />
    </>
  );
}
