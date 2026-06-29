"use client";

import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="max-w-md rounded-3xl border border-amber-500/20 bg-amber-500/10 p-8 text-center">
        <h1 className="text-2xl font-semibold">Payment cancelled</h1>
        <p className="mt-3 text-slate-300">Your booking is still pending payment. You can try again anytime.</p>
        <Link href="/bookings" className="mt-6 inline-block rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950">
          Back to bookings
        </Link>
      </div>
    </div>
  );
}
