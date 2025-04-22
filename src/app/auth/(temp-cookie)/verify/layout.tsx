import { getTempUser } from "@/actions/auth/getTempUser";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { AUTH_REGISTER_PATH } from "../../register/path";
import { AUTH_MINIMAL_REGISTRATION_PATH } from "../minimal-registration/path";

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

  // Check if user has complete name data
  if (!user.firstName || !user.lastName) {
    redirect(AUTH_MINIMAL_REGISTRATION_PATH);
  }

  return <>{children}</>;
}
