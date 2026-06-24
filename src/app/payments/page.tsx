"use client";

import { useEffect, useState } from "react";
import { authHeaders, BASE_URL } from "../../services/api";

type Payment = {
  id: number;
  bookingId: number;
  amount: number;
  status: string;
  receiptUrl?: string;
  createdAt: string;
  booking?: { car?: { title?: string } };
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/payments/me`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setPayments(data.data || []);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Payments</h1>
              <p className="mt-2 text-slate-400">
                Track your payment receipts, booking references, and approval status in one place.
              </p>
            </div>
            <span className="rounded-3xl bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200 ring-1 ring-cyan-500/20">
              {payments.length} payment{payments.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center text-slate-300">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/80 p-10 text-center text-slate-400">
            No payments found yet. Complete a booking first and upload your receipt.
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="grid gap-4 rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-lg shadow-black/20 sm:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Booking #{payment.bookingId}</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">{payment.booking?.car?.title || "Car booking"}</h2>
                  <p className="mt-2 text-sm text-slate-400">Amount paid: PKR {payment.amount.toFixed(0)}</p>
                  <p className="mt-1 text-sm text-slate-400">Created: {new Date(payment.createdAt).toLocaleDateString()}</p>
                  {payment.receiptUrl && (
                    <a href={payment.receiptUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-cyan-300 hover:text-cyan-200">
                      View receipt
                    </a>
                  )}
                </div>
                <div className="flex flex-col justify-between gap-4">
                  <StatusPill status={payment.status} />
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                    <p className="text-slate-400">Need help?</p>
                    <p className="mt-2">Contact support if your payment is not approved within 24 hours.</p>
                  </div>
                  <div className="rounded-3xl border border-cyan-500/10 bg-cyan-500/5 p-4 text-sm text-slate-300">
                    <p className="text-slate-400">Payment destination</p>
                    <p className="mt-2">Send the payment to the account details provided on the booking receipt upload page.</p>
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

function StatusPill({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  const label = normalized.replaceAll("_", " ");
  const color = normalized === "PENDING" ? "bg-amber-500/15 text-amber-200 ring-amber-500/20" : normalized === "SUCCESS" ? "bg-emerald-500/15 text-emerald-200 ring-emerald-500/20" : normalized === "FAILED" ? "bg-rose-500/15 text-rose-200 ring-rose-500/20" : "bg-slate-500/15 text-slate-200 ring-slate-500/20";

  return (
    <span className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-medium ring-1 ${color}`}>
      {label}
    </span>
  );
}
