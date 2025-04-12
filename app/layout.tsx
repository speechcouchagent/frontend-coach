"use client";

import "@livekit/components-styles";
import "./globals.css";
import Link from "next/link";
import { Public_Sans } from "next/font/google";
import { UserProvider, useUserContext } from "./context/UserContext"; // adjust path
import { useState, useEffect } from "react";

const publicSans400 = Public_Sans({ weight: "400", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${publicSans400.className}`}>
      <body className="h-full bg-gray-50">
        {/* Provide user context to the entire app */}
        <UserProvider>
          <Header />
          <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}

/**
 * Header Navigation Component
 */
function Header() {
  const { email, setEmail } = useUserContext();

  function handleSignOut() {
    localStorage.removeItem("token");
    // also clear email from context
    setEmail("");
    window.location.href = "/home";
  }

  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Brand Logo/Name */}
        <Link href="/home" className="flex items-center text-gray-800 hover:opacity-75">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 text-teal-600"
          >
            <path d="M3 3h18v18H3z"></path>
          </svg>
          <span className="font-bold text-lg tracking-wide">COACHINTERVIEWS</span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex space-x-6">
          <Link href="/home" className="text-gray-700 hover:text-gray-900 font-medium">
            Home
          </Link>
          <Link href="/agent" className="text-gray-700 hover:text-gray-900 font-medium">
            Agent
          </Link>
          <Link href="/subscription" className="text-gray-700 hover:text-gray-900 font-medium">
            Subscription
          </Link>
          <Link href="/profile" className="text-gray-700 hover:text-gray-900 font-medium">
            Profile
          </Link>
        </nav>

        {/* Right side: either user email + sign out or login / signup */}
        <div className="flex items-center space-x-4">
          {email ? (
            <>
              <span className="text-gray-700 font-medium">{email}</span>
              <button
                onClick={handleSignOut}
                className="rounded border border-red-500 text-red-500 hover:bg-red-50 px-3 py-1 font-medium"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded border border-teal-600 text-teal-600 hover:bg-teal-50 px-3 py-1 font-medium"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="bg-teal-600 text-white hover:bg-teal-700 rounded px-3 py-1 font-medium"
              >
                Sign up for free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
