"use client";

import { useEffect, useState } from "react";
import BASE_URL, { authHeaders, ADMIN_BASE } from "../../../services/api";
import path from "path/win32";

interface Payment {
  id: number;
  bookingId: number;
  amount: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  receiptUrl?: string;
  status: string;
  createdAt: string;
  booking?: {
    car?: { title?: string };
  };
}

interface Payout {
  id: number;
  ownerId: number;
  bookingId: number;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  status: string;
  createdAt: string;
  owner: {
    id: number;
    name: string;
    email: string;
  };
  booking: {
    car?: { title?: string };
  };
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [payoutLoading, setPayoutLoading] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  useEffect(() => {
    fetchPayments();
    fetchPayouts();
  }, []);
  
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ADMIN_BASE}/payments/pending`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) {
        setPayments(data.data || []);
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const fetchPayouts = async () => {
    try {
      const res = await fetch(`${ADMIN_BASE}/payouts/pending`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) {
        setPayouts(data.data || []);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const doAction = async (id: number, action: "approve" | "reject") => {
    setActionLoading(id);
    try {
      const res = await fetch(`${ADMIN_BASE}/payments/${id}/${action}`, {
        method: "PATCH",
        headers: authHeaders(),
      });

      if (res.ok) {
        fetchPayments();
        fetchPayouts();
      } else {
        const data = await res.json();
        alert(data.message || "Action failed");
      }
    } catch (err) {
      console.log(err);
      alert("Server error");
    }
    setActionLoading(null);
  };

  const markPayoutPaid = async (id: number) => {
    setPayoutLoading(id);
    try {
      const res = await fetch(`${ADMIN_BASE}/payouts/${id}/mark-paid`, {
        method: "PATCH",
        headers: authHeaders(),
      });

      if (res.ok) {
        fetchPayouts();
      } else {
        const data = await res.json();
        alert(data.message || "Payout update failed");
      }
    } catch (err) {
      console.log(err);
      alert("Server error");
    }
    setPayoutLoading(null);
  };
  
  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Pending Payments</h1>
              <p className="mt-2 text-slate-400">Review pending receipts and approve or reject manual payments from renters.</p>
            </div>
            <span className="rounded-3xl bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200 ring-1 ring-cyan-500/20">
              {payments.length} pending
            </span>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Owner Payouts</h2>
              <p className="mt-2 text-slate-400">Mark owner earnings as paid after you give the payout manually.</p>
            </div>
            <span className="rounded-3xl bg-amber-500/10 px-4 py-2 text-sm text-amber-200 ring-1 ring-amber-500/20">
              {payouts.length} pending payout{payouts.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {payouts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/80 p-10 text-center text-slate-400">
              No owner payouts pending yet. Approve a completed booking payment first to create one.
            </div>
          ) : (
            payouts.map((payout) => (
              <div key={payout.id} className="grid gap-4 rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-lg shadow-black/20 sm:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Booking #{payout.bookingId}</p>
                      <h3 className="mt-1 text-xl font-semibold text-white">{payout.booking?.car?.title || "Car booking"}</h3>
                    </div>
                    <StatusPill status={payout.status} />
                  </div>
                  <p className="text-sm text-slate-400">Owner: {payout.owner.name} • {payout.owner.email}</p>
                  <p className="text-sm text-slate-400">Gross: PKR {payout.grossAmount.toFixed(0)} • Fee: PKR {payout.platformFee.toFixed(0)}</p>
                  <p className="text-sm text-slate-400">Net amount to owner: PKR {payout.netAmount.toFixed(0)}</p>
                  <p className="text-sm text-slate-400">Created: {new Date(payout.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-col justify-between gap-3">
                  <button
                    onClick={() => markPayoutPaid(payout.id)}
                    disabled={payoutLoading === payout.id}
                    className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700"
                  >
                    {payoutLoading === payout.id ? "Updating..." : "Mark payout paid"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center text-slate-300">Loading pending payments...</div>
        ) : payments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/80 p-10 text-center text-slate-400">
            No pending payment requests currently.
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="grid gap-4 rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-lg shadow-black/20 sm:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Booking #{payment.bookingId}</p>
                      <h2 className="mt-1 text-xl font-semibold text-white">{payment.booking?.car?.title || "Car booking"}</h2>
                    </div>
                    <StatusPill status={payment.status} />
                  </div>
                  <p className="text-sm text-slate-400">User: {payment.user.name} • {payment.user.email}</p>
                  <p className="text-sm text-slate-400">Amount: PKR {payment.amount.toFixed(0)}</p>
                  <p className="text-sm text-slate-400">Submitted: {new Date(payment.createdAt).toLocaleString()}</p>
                  {payment.receiptUrl && (
                    <a href={`${BASE_URL.replace(/\/api\/?$/, "")}/${payment.receiptUrl?.replace(/^\//, "")}`} target="_blank" rel="noreferrer" className="text-cyan-300 hover:text-cyan-200">
                      View receipt
                    </a>
                  )}
                </div>
                <div className="flex flex-col justify-between gap-3">
                  <button
                    onClick={() => doAction(payment.id, "approve")}
                    disabled={actionLoading === payment.id}
                    className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700"
                  >
                    {actionLoading === payment.id ? "Approving..." : "Approve Payment"}
                  </button>
                  <button
                    onClick={() => doAction(payment.id, "reject")}
                    disabled={actionLoading === payment.id}
                    className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-slate-700"
                  >
                    {actionLoading === payment.id ? "Rejecting..." : "Reject Payment"}
                  </button>
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
  const color = normalized === "PENDING" ? "bg-amber-500/10 text-amber-200 ring-amber-500/20" : normalized === "SUCCESS" ? "bg-emerald-500/10 text-emerald-200 ring-emerald-500/20" : normalized === "FAILED" ? "bg-rose-500/10 text-rose-200 ring-rose-500/20" : "bg-slate-500/10 text-slate-200 ring-slate-500/20";

  return (
    <span className={`inline-flex rounded-full border px-4 py-2 text-sm font-medium ring-1 ${color}`}>
      {label}
    </span>
  );
}
