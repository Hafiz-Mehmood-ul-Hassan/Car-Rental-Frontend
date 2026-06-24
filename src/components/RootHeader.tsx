"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Auth } from "../lib/auth";
// import { usePathname } from "next/navigation";

export default function RootHeader() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = Auth.getToken();
    const stored = Auth.getUser();

    setIsLoggedIn(Boolean(token));
    setUser(stored);
  }, [router]);

  const logout = () => {
    Auth.clear();
    document.cookie = "token=; path=/; max-age=0; samesite=lax";
    setUser(null);
    setIsLoggedIn(false);
    router.push("/login");
  };

  return (
    <header className="border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="text-2xl font-bold">
          CarRent
        </Link>

        {/* NAV */}
        <nav className="flex items-center gap-4">

          <Link href="/" className="hover:text-blue-400">
            Home
          </Link>

          <Link href="/cars" className="hover:text-blue-400">
            Cars
          </Link>

          {/* AUTH STATE */}
          {isLoggedIn ? (
            <>
              <Link
                href={user?.role === "ADMIN" ? "/admin" : "/dashboard"}
                className="hover:text-blue-400"
              >
                {user?.role === "ADMIN" ? "Admin Dashboard" : "Dashboard"}
              </Link>

              <span className="text-zinc-400">
                {user?.role || "USER"}
              </span>

              <button
                onClick={logout}
                className="bg-red-500 px-3 py-1 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hover:text-blue-400"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="hover:text-blue-400"
              >
                Register
              </Link>
            </>
          )}

        </nav>
      </div>
    </header>
  );
}