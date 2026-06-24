"use client";

import { useEffect, useState } from "react";
import { authHeaders, BASE_URL } from "../../../services/api";

type OwnerBooking = {
  id: number;
  status: string;
  totalPrice: number;
  startDate: string;
  endDate: string;
  car?: { title?: string };
  user?: { name?: string; email?: string };
  earning?: { netAmount: number; status: string } | null;
};

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/bookings/owner`, { headers: authHeaders() });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Unable to load owner bookings.");
          return;
        }
        setBookings(data.data || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load owner bookings.");
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  const acceptReturn = async (bookingId: number) => {
    try {
      const res = await fetch(`${BASE_URL}/bookings/${bookingId}/accept-return`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Unable to accept return.");
        return;
      }
      setBookings((current) => current.map((booking) => (booking.id === bookingId ? data.data : booking)));
    } catch (err) {
      console.error(err);
      setError("Unable to accept return.");
    }
  };

  const stats = bookings.reduce(
    (acc, booking) => {
      acc.total += booking.earning?.netAmount || 0;
      if (booking.earning?.status === "AVAILABLE") {
        acc.available += booking.earning.netAmount;
      } else {
        acc.pending += booking.earning?.netAmount || 0;
      }
      return acc;
    },
    { total: 0, pending: 0, available: 0 }
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Owner dashboard</p>
              <h1 className="mt-2 text-3xl font-bold text-white">Bookings for your cars</h1>
              <p className="mt-2 text-slate-400">Review active rentals, earnings, and receipt approvals.</p>
            </div>
            <span className="rounded-3xl bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200 ring-1 ring-cyan-500/20">
              {bookings.length} booking{bookings.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <SummaryCard label="Net earnings" value={`PKR ${stats.total.toFixed(0)}`} />
          <SummaryCard label="Available balance" value={`PKR ${stats.available.toFixed(0)}`} />
          <SummaryCard label="Pending payout" value={`PKR ${stats.pending.toFixed(0)}`} />
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center text-slate-300">Loading owner bookings...</div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-8 text-center text-rose-100">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/80 p-10 text-center text-slate-400">
            No owner bookings found yet. Your cars will appear here once riders book them.
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="grid gap-4 rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-lg shadow-black/20 sm:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Booking #{booking.id}</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">{booking.car?.title || "Car rental"}</h2>
                  <p className="mt-3 text-sm text-slate-400">{new Date(booking.startDate).toLocaleDateString()} → {new Date(booking.endDate).toLocaleDateString()}</p>
                  <p className="mt-2 text-sm text-slate-400">Renter: {booking.user?.name || "Unknown"} • {booking.user?.email || ""}</p>
                  <p className="mt-2 text-sm text-slate-400">Net earning: PKR {(booking.earning?.netAmount || 0).toFixed(0)}</p>
                </div>
                <div className="flex flex-col justify-between gap-4">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                    <p className="text-slate-400">Payment status</p>
                    <p className="mt-2 text-white">{booking.status.replaceAll("_", " ")}</p>
                  </div>
                  <div className="rounded-3xl border border-cyan-500/10 bg-cyan-500/5 p-4 text-sm text-slate-300">
                    <p className="text-slate-400">Earning state</p>
                    <p className="mt-2 text-white">{booking.earning?.status || "N/A"}</p>
                  </div>
                  {booking.status === "ACTIVE" && (
                    <div className="mt-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                      Renter is using the car now. Wait for return request before completing.
                    </div>
                  )}
                  {booking.status === "RETURN_REQUESTED" && (
                    <button
                      onClick={() => acceptReturn(booking.id)}
                      className="mt-3 w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                    >
                      Accept return and complete booking
                    </button>
                  )}
                  {booking.status === "COMPLETED" && (
                    <div className="mt-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                      Booking completed. The car is now available again.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}
