import { redirect } from "next/navigation";

export default function SecurityScoreRedirect() {
  redirect("/dashboard/security-score");
}
