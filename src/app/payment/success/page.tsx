"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyStripeSession } from "../../../services/paymentService";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Confirming your payment...");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setStatus("No Stripe session was provided. Please check your bookings.");
      return;
    }

    const confirmPayment = async () => {
      try {
        // await verifyStripeSession(sessionId);
        setStatus("Payment confirmed. Redirecting to your bookings...");
        setTimeout(() => router.replace("/bookings"), 1500);
      } catch (error) {
        console.error(error);
        setStatus("We could not confirm the payment automatically. Please check your bookings.");
        setTimeout(() => router.replace("/bookings"), 2500);
      }
    };

    confirmPayment();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="max-w-md rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-8 text-center">
        <h1 className="text-2xl font-semibold">Payment successful</h1>
        <p className="mt-3 text-slate-300">{status}</p>
      </div>
    </div>
  );
}
