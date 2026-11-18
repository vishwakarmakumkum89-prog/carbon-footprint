import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import CalculatorClient from "@/components/CalculatorClient";

export default async function CalculatorPage() {
  const session = await getSession();
  if (!session) redirect("/");
  return <CalculatorClient />;
}
