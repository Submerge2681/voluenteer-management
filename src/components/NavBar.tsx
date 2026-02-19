import { createClient } from "@/lib/supabase/server";

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

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
      <a href="/" className="font-semibold text-gray-900 hover:opacity-75 transition-opacity">
        [Logo]
      </a>

      <div className="flex items-center gap-6 text-sm text-gray-600">
        {isAdmin && (
          <a href="/admin/events" className="transition-colors py-1 px-4 text-red-500 border border-red-500 hover:text-red-700 hover:border-red-700">
            Admin
          </a>
        )}
        <a href="/" className="hover:text-gray-900 transition-colors">Home</a>
        <a href="/events" className="hover:text-gray-900 transition-colors">Events</a>
        <a href="/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</a>
        <details className="relative group">
        <summary className="flex items-center gap-2 cursor-pointer list-none px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors select-none">
          Profile
          <svg
            className="w-4 h-4 transition-transform duration-200 group-open:rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>

        <ul className="absolute right-0 mt-1 w-44 rounded-md border border-gray-200 bg-white shadow-md py-1 z-10">
          {user ? (
            <>
              <li>
                <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  My Profile
                </a>
              </li>
              <li className="border-t border-gray-100 mt-1 pt-1">
                <a href="/auth/signout" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors">
                  Sign out
                </a>
              </li>
            </>
          ) : (
            <li>
              <a href="/auth/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                Sign in
              </a>
            </li>
          )}
        </ul>
      </details>
      </div>
    </nav>
  );
}