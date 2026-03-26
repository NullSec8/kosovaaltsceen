import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export default async function LoginPage() {
  const user = await getAuthenticatedUser();

  if (user) {
    redirect("/admin");
  }

  return (
    <div className="py-10">
      <LoginForm />
    </div>
  );
}
