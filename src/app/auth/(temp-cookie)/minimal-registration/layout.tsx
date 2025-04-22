import { getTempUser } from "@/actions/auth/getTempUser";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { AUTH_REGISTER_PATH } from "../../register/page";
import { AUTH_VERIFY_PATH } from "../verify/page";
import { z } from "zod";

/**
 * Schema for validating the temporary user data
 */
const tempUserSchema = z
  .object({
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
  })
  .nullable();

/**
 * Layout component for minimal registration page
 *
 * This layout:
 * 1. Checks if user exists and redirects to registration if not
 * 2. Validates user data using Zod
 * 3. Redirects to verification if user already has name data
 * 4. Renders the minimal registration form if conditions are met
 *
 * @component
 * @param {Object} props - The component props
 * @param {ReactNode} props.children - The child components to render
 * @returns {JSX.Element} The layout component
 * @example
 * ```tsx
 * <Layout>
 *   <MinimalRegistrationForm />
 * </Layout>
 * ```
 */
export default async function Layout({ children }: { children: ReactNode }) {
  const user = await getTempUser();

  // Validate user data
  const validatedUser = tempUserSchema.parse(user);

  // Redirect if no user exists
  if (!validatedUser) {
    redirect(AUTH_REGISTER_PATH);
  }

  // Redirect if user already has name data
  if (validatedUser.firstName && validatedUser.lastName) {
    redirect(AUTH_VERIFY_PATH);
  }

  return <>{children}</>;
}
