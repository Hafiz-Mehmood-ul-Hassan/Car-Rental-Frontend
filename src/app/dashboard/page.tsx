"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import BASE_URL, { authHeaders } from "../../services/api";

type User = {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  isVerified?: boolean;
  isActive?: boolean;
  kycStatus?: string;
};

type Booking = {
  id: number;
  status: string;
  totalPrice: number;
  startDate: string;
  endDate: string;
  car?: { title?: string };
  payment?: { status: string };
  earning?: { netAmount: number; status: string } | null;
};

type ActionCard = {
  title: string;
  description: string;
  href: string;
  accent: string;
  show?: boolean;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<{ status: string }[]>([]);
  const [paymentsCount, setPaymentsCount] = useState(0);
  const [ownerEarnings, setOwnerEarnings] = useState({ total: 0, pending: 0, available: 0 });

  useEffect(() => {
    const getMe = async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/me`, {
          method: "GET",
          headers: authHeaders(),
        });

        const data = await res.json();
        setUser(data.data || null);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    getMe();
  }, []);

  useEffect(() => {
    if (!user?.role) return;

    const fetchRoleData = async () => {
      if (user.role === "RENTER") {
        await Promise.all([fetchBookings(), fetchPayments()]);
      }

      if (user.role === "CAR_OWNER") {
        await fetchOwnerBookings();
      }
    };

    fetchRoleData();
  }, [user]);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${BASE_URL}/bookings/me`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setBookings(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await fetch(`${BASE_URL}/payments/me`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) {
        const paymentsData: { status: string }[] = Array.isArray(data.data) ? data.data : [];
        setPayments(paymentsData);
        setPaymentsCount(paymentsData.filter((payment) => payment.status === "PENDING").length);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOwnerBookings = async () => {
    try {
      const res = await fetch(`${BASE_URL}/bookings/owner`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) {
        const ownerBookings: Booking[] = data.data || [];
        setBookings(ownerBookings);
        const totals = ownerBookings.reduce(
          (acc, booking) => {
            const net = booking.earning?.netAmount || 0;
            acc.total += net;
            if (booking.earning?.status === "AVAILABLE") {
              acc.available += net;
            } else {
              acc.pending += net;
            }
            return acc;
          },
          { total: 0, pending: 0, available: 0 }
        );
        setOwnerEarnings(totals);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const kycStatus = (user?.kycStatus || "NOT_SUBMITTED").toUpperCase();
  const isKycApproved = kycStatus === "APPROVED";
  const isOwner = user?.role === "CAR_OWNER";

  const actions: ActionCard[] = useMemo(
    () => [
      {
        title: isKycApproved ? "KYC Approved" : "Complete KYC",
        description: isKycApproved
          ? "Your identity is verified and core renter/owner actions are unlocked."
          : "Submit CNIC, selfie, and address details to unlock the platform.",
        href: "/kyc",
        accent: isKycApproved ? "from-emerald-500 to-teal-500" : "from-sky-500 to-cyan-500",
      },
      {
        title: "Profile Center",
        description: "Update your account details or deactivate your account when needed.",
        href: "/profile",
        accent: "from-zinc-700 to-zinc-500",
      },
      {
        title: "Change Password",
        description: "Keep your login secure with an updated password.",
        href: "/change-password",
        accent: "from-indigo-500 to-violet-500",
      },
      {
        title: "Payments",
        description: "View payment history and receipt uploads.",
        href: "/payments",
        accent: "from-amber-500 to-orange-500",
      },
      {
        title: "Find Cars",
        description: "Browse approved cars and start a booking flow.",
        href: "/cars",
        accent: "from-fuchsia-500 to-pink-500",
      },
      {
        title: "My Bookings",
        description: "View your booking history and payment status.",
        href: "/bookings",
        accent: "from-blue-500 to-cyan-500",
      },
      {
        title: "Add a Car",
        description: "Create a listing, upload media, and submit it for review.",
        href: "/cars/create",
        accent: "from-lime-500 to-emerald-500",
        show: isOwner && isKycApproved,
      },
      {
        title: "My Cars",
        description: "Manage your own listings, images, and documents.",
        href: "/cars/owner",
        accent: "from-slate-700 to-slate-500",
        show: isOwner && isKycApproved,
      },
      {
        title: "Owner Rentals",
        description: "Review bookings and net earnings from your cars.",
        href: "/bookings/owner",
        accent: "from-emerald-500 to-lime-500",
        show: isOwner && isKycApproved,
      },
    ],
    [isKycApproved, isOwner]
  );

  const visibleActions = actions.filter((action) => action.show !== false);

  const statusPill =
    kycStatus === "APPROVED"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : kycStatus === "PENDING"
      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
      : kycStatus === "REJECTED"
      ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
      : "bg-slate-500/15 text-slate-300 border-slate-500/30";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_24%),linear-gradient(180deg,_#050816_0%,_#0b1020_48%,_#070b14_100%)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="grid gap-8 p-6 md:grid-cols-[1.4fr_0.9fr] md:p-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Your user account hub
              </div>

              <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Welcome{user?.name ? `, ${user.name}` : ""}.
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                This dashboard groups the main user features together so the next step is obvious: finish KYC, update your profile,
                book a car, check payments, or manage your own listings if you are an approved owner.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/cars"
                  className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                >
                  Explore Cars
                </Link>
                <Link
                  href="/kyc"
                  className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
                >
                  {isKycApproved ? "View KYC" : "Complete KYC"}
                </Link>
                <Link
                  href="/profile"
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Open Profile
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-inner shadow-black/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Account status</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{user?.role || "USER"}</h2>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusPill}`}>
                  {kycStatus.replaceAll("_", " ")}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <StatRow label="Email" value={user?.email || "Loading..."} />
                <StatRow label="Verified" value={user?.isVerified ? "Yes" : "No"} />
                <StatRow label="Active" value={user?.isActive === false ? "No" : "Yes"} />
                <StatRow label="Role" value={user?.role || "USER"} />
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">What this account can do</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  {isOwner && isKycApproved
                    ? "Create listings, upload car images and documents, and manage your own cars."
                    : isKycApproved
                    ? "Browse cars, book vehicles, manage KYC, and handle payments."
                    : "Complete KYC first to unlock booking and owner features."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="KYC Status" value={kycStatus.replaceAll("_", " ")} hint="Identity verification" />
          <MetricCard title="Account Type" value={user?.role || "USER"} hint="Your current role" />
          <MetricCard title="Profile" value={user?.isVerified ? "Verified" : "Unverified"} hint="Account trust state" />
          <MetricCard title="Access" value={user?.isActive === false ? "Blocked" : "Active"} hint="Login availability" />
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Quick actions</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Everything the user can do</h2>
            </div>
            <Link href="/cars" className="text-sm font-medium text-cyan-300 hover:text-cyan-200">
              Go to cars →
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="group rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
              >
                <div className={`h-1.5 w-20 rounded-full bg-gradient-to-r ${action.accent}`} />
                <h3 className="mt-4 text-lg font-semibold text-white">{action.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{action.description}</p>
                <div className="mt-5 text-sm font-medium text-cyan-300 transition group-hover:text-cyan-200">
                  Open action →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {user?.role === "RENTER" && (
          <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Renter overview</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Your bookings and payments</h2>
              </div>
              <div className="text-sm text-slate-300">
                {bookings.length} booking{bookings.length === 1 ? "" : "s"} • {paymentsCount} payment{paymentsCount === 1 ? "" : "s"}
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <SummaryCard label="Active bookings" value={String(bookings.filter((b) => b.status === "PAYMENT_PENDING" || b.status === "CONFIRMED" || b.status === "ACTIVE").length)} />
              <SummaryCard label="Pending receipts" value={String(paymentsCount)} />
              <SummaryCard label="Total payments" value={String(payments.length)} />
            </div>

            <div className="mt-6 space-y-3">
              {bookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-400">{booking.car?.title || "Booking"}</p>
                      <p className="text-sm text-slate-300">
                        {new Date(booking.startDate).toLocaleDateString()} → {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
                      {booking.status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
                    <span>Total</span>
                    <span>PKR {booking.totalPrice.toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {user?.role === "CAR_OWNER" && (
          <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Owner overview</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Your earnings and rentals</h2>
              </div>
              <div className="text-sm text-slate-300">
                {bookings.length} booking{bookings.length === 1 ? "" : "s"} • PKR {ownerEarnings.total.toFixed(0)} earned
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <SummaryCard label="Total earnings" value={`PKR ${ownerEarnings.total.toFixed(0)}`} />
              <SummaryCard label="Available" value={`PKR ${ownerEarnings.available.toFixed(0)}`} />
              <SummaryCard label="Pending" value={`PKR ${ownerEarnings.pending.toFixed(0)}`} />
            </div>

            <div className="mt-6 space-y-3">
              {bookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-400">{booking.car?.title || "Rental"}</p>
                      <p className="text-sm text-slate-300">
                        {new Date(booking.startDate).toLocaleDateString()} → {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
                      {booking.status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-400 sm:grid-cols-3">
                    <div>
                      <p className="text-slate-400">Gross</p>
                      <p className="text-white">PKR {booking.totalPrice.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Net</p>
                      <p className="text-white">PKR {(booking.earning?.netAmount || 0).toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Earned</p>
                      <p className="text-white">{booking.earning?.status || "N/A"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-400">User flow</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Recommended next steps</h2>

            <div className="mt-6 space-y-4">
              <FlowItem
                title="1. Complete KYC"
                description="Submit your documents so booking and owner actions stay unlocked."
                done={isKycApproved}
                href="/kyc"
              />
              <FlowItem
                title="2. Explore cars"
                description="Browse approved vehicles and go to booking from the car listings."
                done={false}
                href="/cars"
              />
              <FlowItem
                title="3. Check payments"
                description="Open payment history and receipt upload history from one place."
                done={false}
                href="/payments"
              />
              <FlowItem
                title="4. Manage profile"
                description="Update your profile data or deactivate your account from the profile page."
                done={false}
                href="/profile"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/90 to-slate-900/40 p-6">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Account tools</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Fast access</h2>

            <div className="mt-6 grid gap-3">
              <MiniLink href="/profile" label="Profile center" description="Update or deactivate account" />
              <MiniLink href="/change-password" label="Change password" description="Security settings" />
              <MiniLink href="/payments" label="My payments" description="Receipts and statuses" />
              <MiniLink href="/cars" label="Browse rentals" description="Find a car to book" />
              <MiniLink href="/kyc" label="KYC center" description="Identity verification" />
              {isOwner && isKycApproved && (
                <MiniLink href="/cars/create" label="Create car listing" description="Owner workflow" />
              )}
              {isOwner && isKycApproved && (
                <MiniLink href="/cars/owner" label="My cars" description="Manage listings" />
              )}
            </div>
          </div>
        </section>

        {!loading && !user && (
          <div className="mt-8 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-100">
            Failed to load your account data. Please refresh the page or sign in again.
          </div>
        )}
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}

function MetricCard({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20 backdrop-blur-xl">
      <p className="text-sm text-slate-400">{title}</p>
      <div className="mt-3 text-2xl font-semibold text-white">{value}</div>
      <p className="mt-2 text-sm text-slate-500">{hint}</p>
    </div>
  );
}

function FlowItem({
  title,
  description,
  done,
  href,
}: {
  title: string;
  description: string;
  done: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10"
    >
      <div className={`mt-1 h-3 w-3 rounded-full ${done ? "bg-emerald-400" : "bg-slate-500"}`} />
      <div>
        <h3 className="font-medium text-white">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-300">{description}</p>
      </div>
    </Link>
  );
}

function MiniLink({ label, description, href }: { label: string; description: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
    >
      <div>
        <div className="font-medium text-white">{label}</div>
        <div className="text-sm text-slate-400">{description}</div>
      </div>
      <span className="text-cyan-300">→</span>
    </Link>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}