import { BASE_URL, authHeaders } from "./api";

export const createStripeCheckout = async (bookingId: number) => {
  const res = await fetch(`${BASE_URL}/payments/create`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ bookingId }),
  });

  const payload = await res.json().catch(() => null);

  if (!res.ok || !payload?.success) {
    throw new Error(payload?.message || "Failed to start Stripe checkout");
  }

  return payload.data || payload;
};

export const verifyStripeSession = async (sessionId: string) => {
  const res = await fetch(`${BASE_URL}/payments/verify-session/${encodeURIComponent(sessionId)}`, {
    method: "GET",
    headers: authHeaders(),
  });

  const payload = await res.json().catch(() => null);

  if (!res.ok || !payload?.success) {
    throw new Error(payload?.message || "Failed to verify Stripe payment");
  }

  return payload.data || payload;
};
