import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function HomePage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session_id");

  if (session?.value) {
    redirect("/settings");
  }
  redirect("/login");
}
