"use client";

import { useEffect, useState } from "react";
import { authHeaders, ADMIN_BASE } from "../../services/api";
import Link from "next/link";

type StatCard = {
  key: string;
  label: string;
  count: number;
  href: string;
  accent?: string;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        dashboardRes,
        kycRes,
        carRes,
        paymentsRes,
        usersRes,
        bookingsRes,
      ] = await Promise.all([
        fetch(`${ADMIN_BASE}/dashboard`, { headers: authHeaders() }),
        fetch(`${ADMIN_BASE}/kyc/pending`, { headers: authHeaders() }),
        fetch(`${ADMIN_BASE}/cars/pending`, { headers: authHeaders() }),
        fetch(`${ADMIN_BASE}/payments/pending`, { headers: authHeaders() }),
        fetch(`${ADMIN_BASE}/users`, { headers: authHeaders() }),
        fetch(`${ADMIN_BASE}/bookings`, { headers: authHeaders() }),
      ]);

      const [
        dashboardData,
        kycData,
        carData,
        paymentsData,
        usersData,
        bookingsData,
      ] = await Promise.all([
        dashboardRes.json().catch(() => ({ data: {} })),
        kycRes.json().catch(() => ({ data: [] })),
        carRes.json().catch(() => ({ data: [] })),
        paymentsRes.json().catch(() => ({ data: [] })),
        usersRes.json().catch(() => ({ data: [] })),
        bookingsRes.json().catch(() => ({ data: [] })),
      ]);

      setStats({
        kycPending: kycData.data?.length || 0,
        carsPending: carData.data?.length || 0,
        paymentsPending: paymentsData.data?.length || 0,

        usersTotal:
          dashboardData.data?.totalUsers ??
          (Array.isArray(usersData.data) ? usersData.data.length : 0),

        bookingsTotal:
          dashboardData.data?.totalBookings ??
          (Array.isArray(bookingsData.data) ? bookingsData.data.length : 0),

        returnRequestsPending:
          dashboardData.data?.pendingReturnRequests || 0,

        reviewsTotal:
          dashboardData.data?.totalReviews || 0,
      });
    } catch (err) {
      console.error("Failed to fetch admin stats", err);
    }
  };

  const cards: StatCard[] = [
    {
      key: "kycPending",
      label: "Pending KYC",
      count: stats.kycPending || 0,
      href: "/admin/kyc",
      accent: "text-yellow-400",
    },
    {
      key: "carsPending",
      label: "Pending Cars",
      count: stats.carsPending || 0,
      href: "/admin/cars",
      accent: "text-sky-400",
    },
    {
      key: "paymentsPending",
      label: "Pending Payments",
      count: stats.paymentsPending || 0,
      href: "/admin/payments",
      accent: "text-amber-400",
    },
    {
      key: "returnRequestsPending",
      label: "Return Requests",
      count: stats.returnRequestsPending || 0,
      href: "/admin/bookings",
      accent: "text-fuchsia-400",
    },
    {
      key: "usersTotal",
      label: "Users",
      count: stats.usersTotal || 0,
      href: "/admin/users",
      accent: "text-green-300",
    },
    {
      key: "bookingsTotal",
      label: "Bookings",
      count: stats.bookingsTotal || 0,
      href: "/admin/bookings",
      accent: "text-cyan-300",
    },
    {
      key: "reviewsTotal",
      label: "Reviews",
      count: stats.reviewsTotal || 0,
      href: "/admin/reviews",
      accent: "text-pink-400",
    },
  ];

  return (
    <div className="p-6 text-white">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>

          <nav className="flex gap-3 flex-wrap">
            <Link
              href="/admin/kyc"
              className="px-3 py-2 rounded bg-zinc-900 hover:bg-zinc-800"
            >
              KYC
            </Link>

            <Link
              href="/admin/cars"
              className="px-3 py-2 rounded bg-zinc-900 hover:bg-zinc-800"
            >
              Cars
            </Link>

            <Link
              href="/admin/bookings"
              className="px-3 py-2 rounded bg-zinc-900 hover:bg-zinc-800"
            >
              Bookings
            </Link>

            <Link
              href="/admin/payments"
              className="px-3 py-2 rounded bg-zinc-900 hover:bg-zinc-800"
            >
              Payments
            </Link>

            <Link
              href="/admin/users"
              className="px-3 py-2 rounded bg-zinc-900 hover:bg-zinc-800"
            >
              Users
            </Link>

            <Link
              href="/admin/reviews"
              className="px-3 py-2 rounded bg-zinc-900 hover:bg-zinc-800"
            >
              Reviews
            </Link>
          </nav>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card) => (
            <Link
              key={card.key}
              href={card.href}
              className="block bg-zinc-900 p-6 rounded-xl border border-zinc-800 hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm text-zinc-400">{card.label}</h3>
                  <div
                    className={`mt-3 text-3xl font-bold ${card.accent}`}
                  >
                    {card.count}
                  </div>
                </div>

                <div className="text-zinc-500 text-xl">→</div>
              </div>
            </Link>
          ))}
        </section>

        <section className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <h2 className="text-lg font-semibold mb-3">
            Quick Actions
          </h2>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/kyc"
              className="px-4 py-2 rounded bg-cyan-600 text-black"
            >
              Review KYCs
            </Link>

            <Link
              href="/admin/cars"
              className="px-4 py-2 rounded bg-sky-600 text-black"
            >
              Review Cars
            </Link>

            <Link
              href="/admin/payments"
              className="px-4 py-2 rounded bg-amber-500 text-black"
            >
              Payments
            </Link>

            <Link
              href="/admin/users"
              className="px-4 py-2 rounded bg-emerald-500 text-black"
            >
              Manage Users
            </Link>

            <Link
              href="/admin/reviews"
              className="px-4 py-2 rounded bg-pink-500 text-black"
            >
              Manage Reviews
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}