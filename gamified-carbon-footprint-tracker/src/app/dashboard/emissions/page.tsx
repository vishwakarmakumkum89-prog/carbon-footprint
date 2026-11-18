import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import EmissionsClient from "@/components/EmissionsClient";

export default async function EmissionsPage() {
  const session = await getSession();
  if (!session) redirect("/");
  return <EmissionsClient />;
}
