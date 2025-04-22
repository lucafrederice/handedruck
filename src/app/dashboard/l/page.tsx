import { redirect } from "next/navigation";
import { DASH_L_LOANS_PATH } from "./loans/page";
export const DASH_L_PATH = "/dashboard/l";
export default function Home() {
  redirect(DASH_L_LOANS_PATH);
}
