import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { getTempUser } from "@/actions/auth/getTempUser";
import { AUTH_MINIMAL_REGISTRATION_PATH } from "../(temp-cookie)/minimal-registration/path";
import { AUTH_VERIFY_PATH } from "../(temp-cookie)/verify/path";

/**
 * Layout component for the registration page that handles user redirection based on registration status.
 *
 * @component
 * @param {Object} props - The component props
 * @param {ReactNode} props.children - The child components to render
 * @returns {Promise<JSX.Element>} The rendered layout
 */
export default async function Layout({ children }: { children: ReactNode }) {
  const user = await getTempUser();

  if (user) {
    if (user.firstName && user.lastName) {
      redirect(AUTH_VERIFY_PATH);
    }
    if (!user.firstName && !user.lastName) {
      redirect(AUTH_MINIMAL_REGISTRATION_PATH);
    }
  }

  return <>{children}</>;
}
