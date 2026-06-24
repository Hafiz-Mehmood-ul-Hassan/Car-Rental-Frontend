"use client";

import { useEffect, useState } from "react";
import { ADMIN_BASE, authHeaders } from "../../../services/api";

type AdminBooking = {
  id: number;
  status: string;
  totalPrice: number;
  startDate: string;
  endDate: string;
  user?: { name?: string; email?: string };
  car?: { title?: string };
  payment?: { status?: string };
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${ADMIN_BASE}/bookings`, { headers: authHeaders() });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Unable to load bookings.");
          return;
        }
        setBookings(data.data || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load bookings.");
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Admin</p>
              <h1 className="mt-2 text-3xl font-bold text-white">All Bookings</h1>
              <p className="mt-2 text-slate-400">Review every reservation, payment state, and booking details.</p>
            </div>
            <span className="rounded-3xl bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200 ring-1 ring-cyan-500/20">
              {bookings.length} booking{bookings.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center text-slate-300">Loading bookings...</div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-8 text-center text-rose-100">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/80 p-10 text-center text-slate-400">
            No bookings found.
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="grid gap-4 rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-lg shadow-black/20 sm:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Booking #{booking.id}</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">{booking.car?.title || "Car booking"}</h2>
                  <p className="mt-3 text-sm text-slate-400">{new Date(booking.startDate).toLocaleDateString()} → {new Date(booking.endDate).toLocaleDateString()}</p>
                  <p className="mt-2 text-sm text-slate-400">Renter: {booking.user?.name || "Unknown"} • {booking.user?.email || ""}</p>
                  <p className="mt-2 text-sm text-slate-400">Total: PKR {booking.totalPrice.toFixed(0)}</p>
                </div>
                <div className="space-y-3">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                    <p className="text-slate-400">Booking status</p>
                    <p className="mt-2 text-white">{booking.status.replaceAll("_", " ")}</p>
                  </div>
                  <div className="rounded-3xl border border-cyan-500/10 bg-cyan-500/5 p-4 text-sm text-slate-300">
                    <p className="text-slate-400">Payment status</p>
                    <p className="mt-2 text-white">{booking.payment?.status || "Not started"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
