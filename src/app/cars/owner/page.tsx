"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Auth } from "../../../lib/auth";
import { authHeaders, BASE_URL } from "../../../services/api";

export default function OwnerCarsPage() {
  const router = useRouter();

  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionCarId, setActionCarId] = useState<number | null>(null);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const token = Auth.getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${BASE_URL}/cars/owner`, {
        headers: authHeaders(),
      });

      const data = await res.json();

      console.log("Owner cars fetched:", data);

      // ✅ NORMALIZE RESPONSE (ARRAY OR SINGLE OBJECT)
      let carsList = [];

      if (Array.isArray(data?.data)) {
        carsList = data.data;
      } else if (data?.data) {
        carsList = [data.data];
      } else {
        carsList = [];
      }

      setCars(carsList);
    } catch (err) {
      console.log(err);
      setCars([]);
    }

    setLoading(false);
  };

  const getImage = (car: any) => {
    const img = car?.images?.[0]?.imageUrl;

    if (img) {
      return `http://localhost:5000/${img.replace(/\\/g, "/")}`;
    }
    return "https://placehold.co/600x400?text=No+Image";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "text-green-400 bg-green-500/20";
      case "PENDING":
        return "text-yellow-400 bg-yellow-500/20";
      case "REJECTED":
        return "text-red-400 bg-red-500/20";
      default:
        return "text-white bg-zinc-700";
    }
  };

  const toggleAvailability = async (carId: number, available: boolean) => {
    setActionCarId(carId);
    try {
      const res = await fetch(`${BASE_URL}/cars/${carId}/availability`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ available }),
      });

      const data = await res.json();

      if (res.ok) {
        setCars((prev) =>
          prev.map((car) => (car.id === carId ? data.data : car))
        );
      } else {
        console.error(data.message || "Failed to update availability");
      }
    } catch (err) {
      console.error(err);
    }
    setActionCarId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading cars...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Cars</h1>
          <p className="text-zinc-400">Manage your listed cars</p>
        </div>

        <button
          onClick={() => router.push("/cars/create")}
          className="bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-lg"
        >
          + Add Car
        </button>
      </div>

      {/* EMPTY STATE */}
      {cars.length === 0 && (
        <div className="max-w-7xl mx-auto bg-zinc-900 border border-zinc-800 p-10 rounded-xl text-center">
          <h2 className="text-xl font-semibold">
            No Cars Found
          </h2>
          <p className="text-zinc-400 mt-2">
            Start by adding your first car
          </p>

          <button
            onClick={() => router.push("/cars/create")}
            className="mt-4 bg-blue-500 px-5 py-2 rounded-lg"
          >
            Add Car
          </button>
        </div>
      )}

      {/* GRID */}
      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <div
            key={car.id}
            className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
          >

            {/* IMAGE */}
            <img
              src={getImage(car)}
              alt={car.title}
              className="w-full h-52 object-cover"
            />

            {/* CONTENT */}
            <div className="p-5">

              {/* TITLE + STATUS */}
              <div className="flex justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    {car.title}
                  </h2>
                  <p className="text-zinc-400 text-sm">
                    {car.brand} • {car.model}
                  </p>
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded ${getStatusColor(
                    car.status
                  )}`}
                >
                  {car.status}
                </span>
              </div>

              {/* INFO */}
              <div className="mt-4 text-sm space-y-1">
                <p>📍 {car.location}</p>
                <p>💰 ${car.pricePerDay}/day</p>
                <p>
                  🚗 {car.isBooked ? "Booked" : "Available"}
                </p>
              </div>

              {/* ACTIONS */}
              <div className="mt-5 grid gap-2">
                {car.status === "APPROVED" ? (
                  <button
                    onClick={() => toggleAvailability(car.id, !car.isBooked)}
                    disabled={actionCarId === car.id}
                    className="w-full bg-amber-500 hover:bg-amber-600 py-2 rounded"
                  >
                    {actionCarId === car.id
                      ? "Updating..."
                      : car.isBooked
                      ? "Mark Available"
                      : "Hold Unavailable"}
                  </button>
                ) : null}

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      router.push(`/cars/owner/${car.id}`)
                    }
                    className="flex-1 bg-blue-500 hover:bg-blue-600 py-2 rounded"
                  >
                    Manage
                  </button>

                  <button
                    onClick={() =>
                      router.push(`/cars/edit/${car.id}`)
                    }
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-2 rounded"
                  >
                    Edit
                  </button>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
}