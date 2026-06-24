"use client";

import { useEffect, useState } from "react";
import { authHeaders, BASE_URL } from "../../services/api";

type Booking = {
  id: number;
  status: string;
  totalPrice: number;
  startDate: string;
  endDate: string;
  car?: { title?: string };
  payment?: { status: string; receiptUrl?: string };
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/bookings/me`, { headers: authHeaders() });
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

  const requestReturn = async (bookingId: number) => {
    try {
      const res = await fetch(`${BASE_URL}/bookings/${bookingId}/request-return`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Unable to request return.");
        return;
      }
      setBookings((current) => current.map((booking) => (booking.id === bookingId ? data.data : booking)));
    } catch (err) {
      console.error(err);
      setError("Unable to request return.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">My Bookings</p>
              <h1 className="mt-2 text-3xl font-bold text-white">Your recent reservations</h1>
              <p className="mt-2 text-slate-400">Track booking status, upload receipts, and review pending payments.</p>
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
            No bookings found yet. Start by finding a car and creating a booking.
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="grid gap-4 rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-lg shadow-black/20 sm:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Booking #{booking.id}</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">{booking.car?.title || "Car booking"}</h2>
                  <p className="mt-3 text-sm text-slate-400">{new Date(booking.startDate).toLocaleDateString()} → {new Date(booking.endDate).toLocaleDateString()}</p>
                  <p className="mt-2 text-sm text-slate-400">Total price: PKR {booking.totalPrice.toFixed(0)}</p>
                  <p className="mt-1 text-sm text-slate-400">Payment status: {booking.payment?.status || "Not started"}</p>
                  {booking.payment?.receiptUrl && (
                    <a
                      href={`${BASE_URL.replace(/\/api\/?$/, "")}/${booking.payment.receiptUrl.replace(/^\//, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block text-cyan-300 hover:text-cyan-200"
                    >
                      View receipt
                    </a>
                  )}
                </div>
                <div className="flex flex-col justify-between gap-4">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                    <p className="text-slate-400">Next step</p>
                    {booking.status === "PAYMENT_PENDING" ? (
                      <p className="mt-2">Upload your payment receipt and wait for confirmation.</p>
                    ) : booking.status === "ACTIVE" ? (
                      <p className="mt-2">Use the car, then mark it as returned when finished.</p>
                    ) : booking.status === "RETURN_REQUESTED" ? (
                      <p className="mt-2">Return requested. Wait for the owner to accept it.</p>
                    ) : booking.status === "COMPLETED" ? (
                      <p className="mt-2">Booking completed. Thank you for riding with us.</p>
                    ) : (
                      <p className="mt-2">No active actions available for this booking.</p>
                    )}
                  </div>
                  <div className="rounded-3xl border border-cyan-500/10 bg-cyan-500/5 p-4 text-sm text-slate-300">
                    <p className="text-slate-400">Booking status</p>
                    <p className="mt-2 text-white">{booking.status.replaceAll("_", " ")}</p>
                  </div>
                  {booking.status === "ACTIVE" && (
                    <button
                      onClick={() => requestReturn(booking.id)}
                      className="mt-3 w-full rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
                    >
                      Mark as returned
                    </button>
                  )}
                  {booking.status === "RETURN_REQUESTED" && (
                    <div className="mt-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                      Return requested. Waiting for owner confirmation.
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
