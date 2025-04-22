import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { AUTH_MINIMAL_REGISTRATION_PATH } from "../(temp-cookie)/minimal-registration/page";
import { getTempUser } from "@/actions/auth/getTempUser";
import { AUTH_VERIFY_PATH } from "../(temp-cookie)/verify/page";
import { z } from "zod";

// Define schema for user data
const userSchema = z
  .object({
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
  })
  .nullable();

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

  // Validate user data
  const validatedUser = userSchema.parse(user);

  if (validatedUser) {
    if (validatedUser.firstName && validatedUser.lastName) {
      redirect(AUTH_VERIFY_PATH);
    }
    if (!validatedUser.firstName && !validatedUser.lastName) {
      redirect(AUTH_MINIMAL_REGISTRATION_PATH);
    }
  }

  return <>{children}</>;
}
