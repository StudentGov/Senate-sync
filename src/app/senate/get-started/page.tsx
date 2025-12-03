import { redirect } from "next/navigation";

export default function Page() {
  // Redirect old location to the new log-hours page
  redirect("/senate/log-hours");
}
