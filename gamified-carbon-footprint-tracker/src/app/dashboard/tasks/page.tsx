import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import TasksClient from "@/components/TasksClient";

export default async function TasksPage() {
  const session = await getSession();
  if (!session) redirect("/");
  return <TasksClient />;
}
