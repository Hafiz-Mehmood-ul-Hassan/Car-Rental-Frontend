"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Auth } from "../../../lib/auth";
import { authHeaders, BASE_URL } from "../../../services/api";
import { createStripeCheckout } from "../../../services/paymentService";

interface Car {
  id: number;
  title: string;
  brand: string;
  model: string;
  year: number;
  location: string;
  pricePerDay: number;
  description: string;
  images?: { imageUrl: string }[];
}

const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

const PAYMENT_DESTINATION = {
  name: "Cure Logics Rentals",
  bank: "Bank Alfalah",
  accountNumber: "1234 5678 9012 3456",
  iban: "PK00 CABL 1234 5678 9012 3456",
  jazzCash: "0300-1234567",
};

const calculateDays = (start: string, end: string) => {
  const from = new Date(start);
  const to = new Date(end);
  const diff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
};

export default function BookingPage() {
  const params = useParams();
  const carId = Number(params.id);

  const [car, setCar] = useState<Car | null>(null);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string>("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");

  const totalDays = useMemo(
    () => (pickupDate && returnDate ? calculateDays(pickupDate, returnDate) : 0),
    [pickupDate, returnDate]
  );

  const totalPrice = useMemo(
    () => (car ? car.pricePerDay * totalDays : 0),
    [car, totalDays]
  );

  useEffect(() => {
    if (carId) {
      fetchCar();
    }
  }, [carId]);

  const fetchCar = async () => {
    try {
      const res = await fetch(`${BASE_URL}/cars/public/${carId}`);
      const payload = await res.json();
      setCar(payload.data);
    } catch (error) {
      console.error(error);
      setMessage("Unable to load car details.");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    const token = Auth.getToken();
    if (!token) {
      setMessage("Please login first to complete booking.");
      return;
    }

    if (!pickupDate || !returnDate) {
      setMessage("Please choose both pickup and return dates.");
      return;
    }

    if (totalDays <= 0) {
      setMessage("Return date must be after pickup date.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/bookings`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          carId,
          startDate: pickupDate,
          endDate: returnDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Booking failed. Please try again.");
        return;
      }

      const newBookingId =
        data.data?.id || data.data?.bookingId || data.data?.booking?.id;

      if (newBookingId) {
        setBookingId(String(newBookingId));
      }

      setBookingSuccess(true);
      setMessage("Booking created successfully. You can pay now with Stripe.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to create booking. Try again later.");
    }
  };

  const handleStripePayment = async () => {
    setPaymentMessage("");

    if (!bookingId) {
      setPaymentMessage("Booking ID is missing.");
      return;
    }

    const token = Auth.getToken();
    if (!token) {
      setPaymentMessage("Please login first.");
      return;
    }

    setPaymentLoading(true);

    try {
      const data = await createStripeCheckout(Number(bookingId));
      if (data?.url) {
        window.location.href = data.url;
      } else {
        setPaymentMessage(data?.message || "Unable to start Stripe payment.");
      }
    } catch (error) {
      console.error(error);
      setPaymentMessage("Stripe payment failed.");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading booking details...
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Car not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050506] text-white px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="rounded-[32px] border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-400/80">
                Instant booking
              </p>
              <h1 className="mt-3 text-4xl font-semibold text-white">
                {car.title}
              </h1>
              <p className="mt-3 max-w-2xl text-zinc-400">
                Rent this {car.brand} {car.model} ({car.year}) in {car.location}.
                Confirm your dates, then upload your payment receipt to complete the booking.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black/40 p-5 text-right">
              <p className="text-sm text-zinc-400">Price per day</p>
              <p className="mt-2 text-3xl font-semibold text-cyan-300">
                {formatCurrency(car.pricePerDay)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.7fr_1.3fr]">
          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl shadow-black/20">
            <div className="overflow-hidden rounded-3xl bg-zinc-900">
              <img
                src={`http://localhost:5000/${car.images?.[0]?.imageUrl?.replace(/\\/g, "/")}`}
                alt={car.title}
                className="h-72 w-full object-cover"
              />
            </div>

            <div className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-zinc-800 bg-black/40 p-4">
                  <p className="text-sm text-zinc-400">Location</p>
                  <p className="mt-2 text-lg font-medium text-white">{car.location}</p>
                </div>
                <div className="rounded-3xl border border-zinc-800 bg-black/40 p-4">
                  <p className="text-sm text-zinc-400">Year</p>
                  <p className="mt-2 text-lg font-medium text-white">{car.year}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-800 bg-black/40 p-6">
                <p className="text-sm text-zinc-400">About the car</p>
                <p className="mt-3 text-zinc-300">{car.description}</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl shadow-black/20">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white">Book your dates</h2>
              <p className="mt-2 text-sm text-zinc-400">
                The booking will be created in payment pending state. After upload, an admin will review your receipt.
              </p>
            </div>

            {!bookingSuccess ? (
              <form className="space-y-5" onSubmit={handleBooking}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm text-zinc-400">Pickup date</span>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(event) => setPickupDate(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none ring-1 ring-white/5 transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm text-zinc-400">Return date</span>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(event) => setReturnDate(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none ring-1 ring-white/5 transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                    />
                  </label>
                </div>

                <div className="rounded-3xl border border-zinc-800 bg-black/30 p-4">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Rental days</span>
                    <span>{totalDays || "-"}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-white">
                    <span className="font-medium">Estimated total</span>
                    <span className="text-xl font-semibold">
                      {totalDays > 0 ? formatCurrency(totalPrice) : "-"}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-cyan-500 px-5 py-4 text-base font-semibold text-black transition hover:bg-cyan-400"
                >
                  Confirm Booking
                </button>

                {message && (
                  <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {message}
                  </p>
                )}
              </form>
            ) : (
              <div className="space-y-5">
                <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                  <p className="text-sm text-emerald-200">Booking ID</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{bookingId}</p>
                </div>

                <div className="rounded-3xl border border-zinc-800 bg-black/30 p-5">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Rental duration</span>
                    <span>{totalDays} days</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-zinc-400">
                    <span>Daily rate</span>
                    <span>{formatCurrency(car.pricePerDay)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-white">
                    <span className="font-medium">Total to pay</span>
                    <span className="font-semibold">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>

                <div className="rounded-3xl border border-zinc-800 bg-black/30 p-5">
                  <p className="text-sm text-zinc-400">Pay securely with Stripe</p>

                  <div className="mt-4 rounded-3xl border border-cyan-500/10 bg-cyan-500/5 p-4 text-sm text-zinc-300">
                    <p className="text-zinc-400">Booking ID</p>
                    <p className="mt-2 text-white">{bookingId}</p>
                    <p className="mt-3 text-xs text-zinc-500">You will be redirected to Stripe Checkout to complete the payment safely.</p>
                  </div>

                  <button
                    onClick={handleStripePayment}
                    disabled={paymentLoading}
                    className="mt-4 w-full rounded-2xl bg-emerald-500 px-5 py-4 text-base font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {paymentLoading ? "Preparing checkout..." : "Pay with Stripe"}
                  </button>

                  {paymentMessage && (
                    <p className="mt-4 text-sm text-zinc-300">{paymentMessage}</p>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
