"use client";

import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-black text-white">

      {/* SIDEBAR */}
      <aside className="w-64 border-r border-zinc-800 p-5">

        <h1 className="text-xl font-bold mb-8">
          Admin Panel
        </h1>

        <nav className="flex flex-col gap-4 text-sm">

          <Link href="/admin" className="hover:text-blue-400">
            📊 Dashboard
          </Link>

          <Link href="/admin/kyc" className="hover:text-blue-400">
            🪪 KYC Requests
          </Link>

          <Link href="/admin/cars" className="hover:text-blue-400">
            🚗 Car Approvals
          </Link>

          <Link href="/" className="text-red-400 mt-6">
            Exit
          </Link>

        </nav>

      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6">
        {children}
      </main>

    </div>
  );
}