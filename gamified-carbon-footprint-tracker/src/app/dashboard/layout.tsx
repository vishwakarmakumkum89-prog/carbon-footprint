import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar user={session} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar user={session} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
