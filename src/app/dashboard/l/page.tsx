import { redirect } from "next/navigation";
import { DASH_L_LOANS_PATH } from "./loans/path";
export default function Home() {
  redirect(DASH_L_LOANS_PATH);
}
