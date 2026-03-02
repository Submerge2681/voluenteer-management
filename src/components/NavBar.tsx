import { createClient } from "@/lib/supabase/server";
import ClientNav from "./ClientNav"; // Ensure this path matches where you saved the client component

export default async function NavBar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = data?.role === "admin" || data?.role === "super_admin";
  }

  // To prevent passing non-serializable data from Server to Client, 
  // we can narrow down the user object or just pass a boolean.
  return <ClientNav isAdmin={isAdmin} user={user ? { id: user.id } : null} />;
}