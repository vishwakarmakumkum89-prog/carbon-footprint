import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LeaderboardClient from "@/components/LeaderboardClient";

export default async function LeaderboardPage() {
  const session = await getSession();
  if (!session) redirect("/");
  return <LeaderboardClient />;
}
