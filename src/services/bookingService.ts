import { BASE_URL, authHeaders } from "./api";

export const createBooking = async (payload: any) => {
  const res = await fetch(`${BASE_URL}/bookings`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return res.json();
};

export const getMyBookings = async () => {
  const res = await fetch(`${BASE_URL}/bookings/me`, {
    method: "GET",
    headers: authHeaders(),
  });

  return res.json();
};

export const getOwnerBookings = async () => {
  const res = await fetch(`${BASE_URL}/bookings/owner`, {
    method: "GET",
    headers: authHeaders(),
  });

  return res.json();
};

export const requestReturn = async (bookingId: number) => {
  const res = await fetch(`${BASE_URL}/bookings/${bookingId}/request-return`, {
    method: "PATCH",
    headers: authHeaders(),
  });

  return res.json();
};

export const acceptReturn = async (bookingId: number) => {
  const res = await fetch(`${BASE_URL}/bookings/${bookingId}/accept-return`, {
    method: "PATCH",
    headers: authHeaders(),
  });

  return res.json();
};
