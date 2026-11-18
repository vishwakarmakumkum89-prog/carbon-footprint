import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AchievementsClient from "@/components/AchievementsClient";

export default async function AchievementsPage() {
  const session = await getSession();
  if (!session) redirect("/");
  return <AchievementsClient />;
}
