"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ClientNav({ isAdmin, user }: { isAdmin: boolean; user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Prevent background scrolling when the mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    // Cleanup on unmount
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const isHomePage = pathname === "/";

  return (
    <>
      {/* 3. Blur the entire screen when the hamburger button is pressed */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-white/30 backdrop-blur-md z-40 md:hidden transition-all"
          onClick={() => setIsOpen(false)} // Clicking the blur closes the menu
        />
      )}

      {/* Navbar wrapper needs a higher z-index than the blur backdrop */}
      <nav 
        className={`flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white z-50 transition-all ${
          isHomePage ? "relative" : "sticky top-0"
        }`}
      >
        <a href="/" className="font-semibold text-gray-900 hover:opacity-75 transition-opacity">
          [Logo]
        </a>

        {/* 2. Hamburger button that turns into an X */}
        <button
          className="md:hidden p-2 text-gray-600 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            // 'X' Icon
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Hamburger Icon
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* 1. Hide nav items in hamburger menu below md screen size */}
        <div className={`
          absolute top-full left-0 w-full bg-white border-b border-gray-200 p-6 flex-col gap-6 shadow-xl
          md:static md:w-auto md:bg-transparent md:border-none md:p-0 md:flex-row md:flex md:items-center md:shadow-none md:gap-6 text-sm text-gray-600
          ${isOpen ? "flex" : "hidden"}
        `}>
          {isAdmin && (
            <a href="/admin/events" className="transition-colors py-1 px-4 text-red-500 border border-red-500 hover:text-red-700 hover:border-red-700 w-fit">
              Admin
            </a>
          )}
          <a href="/" className="hover:text-gray-900 transition-colors w-fit">Home</a>
          <a href="/events" className="hover:text-gray-900 transition-colors w-fit">Events</a>
          {user && (
            <a href="/dashboard" className="hover:text-gray-900 transition-colors w-fit">Dashboard</a>
          )}
          
          <details className="relative group md:ml-2">
            <summary className="flex items-center gap-2 cursor-pointer list-none px-3 py-1.5 -ml-3 md:ml-0 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors select-none w-fit">
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

            {/* Adjust dropdown positioning so it doesn't overflow off-screen on mobile */}
            <ul className="absolute left-0 md:left-auto md:right-0 mt-2 w-44 rounded-md border border-gray-200 bg-white shadow-md py-1 z-10">
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
    </>
  );
}