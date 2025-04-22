import { getTempUser } from "@/actions/auth/getTempUser";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { AUTH_REGISTER_PATH } from "../../register/page";
import { AUTH_MINIMAL_REGISTRATION_PATH } from "../minimal-registration/page";
import { z } from "zod";

/**
 * Schema for validating temporary user data
 * Ensures the user has both firstName and lastName when present
 */
const tempUserSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
  })
  .partial()
  .refine(
    (data) => {
      // If any name field is present, both must be present
      if (data.firstName || data.lastName) {
        return data.firstName && data.lastName;
      }
      return true;
    },
    {
      message:
        "Both first name and last name are required when either is present",
    }
  );

/**
 * Layout component for the OTP verification page
 *
 * This component:
 * 1. Checks if a temporary user exists
 * 2. Redirects to registration if no user exists
 * 3. Redirects to minimal registration if user data is incomplete
 * 4. Renders the verification form if all checks pass
 *
 * @component
 * @param {Object} props - The component props
 * @param {ReactNode} props.children - The child components to render
 * @returns {JSX.Element} The layout component
 * @example
 * ```tsx
 * <Layout>
 *   <VerificationForm />
 * </Layout>
 * ```
 */
export default async function Layout({ children }: { children: ReactNode }) {
  const user = await getTempUser();

  // Redirect if no user exists
  if (!user) {
    redirect(AUTH_REGISTER_PATH);
  }

  try {
    // Validate user data using Zod
    const validatedUser = tempUserSchema.parse(user);

    // Check if user has complete name data
    if (!validatedUser.firstName || !validatedUser.lastName) {
      redirect(AUTH_MINIMAL_REGISTRATION_PATH);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("User data validation failed:", error.errors);
      redirect(AUTH_MINIMAL_REGISTRATION_PATH);
    }
    // For other errors, redirect to registration
    redirect(AUTH_REGISTER_PATH);
  }

  return <>{children}</>;
}
