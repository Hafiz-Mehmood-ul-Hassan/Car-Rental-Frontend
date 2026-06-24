"use client";

import { useEffect, useState } from "react";
import { BASE_URL } from "../../services/api";
import Link from "next/link";

interface Car {
  id: number;
  title: string;
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  location: string;
  description: string;
  images?: {
    imageUrl: string;
  }[];
}

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const carsPerPage = 6;

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const res = await fetch(`${BASE_URL}/cars/public`);

      const data = await res.json();

      console.log("PUBLIC CARS:", data);

      // IF BACKEND RETURNS ARRAY
      if (Array.isArray(data.data)) {
        setCars(data.data);
      }

      // IF BACKEND RETURNS SINGLE OBJECT
      else if (data.data) {
        setCars([data.data]);
      }

    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  // PAGINATION LOGIC
  const indexOfLastCar = currentPage * carsPerPage;
  const indexOfFirstCar = indexOfLastCar - carsPerPage;

  const currentCars = cars.slice(
    indexOfFirstCar,
    indexOfLastCar
  );

  const totalPages = Math.ceil(
    cars.length / carsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading Cars...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold">
            Available Cars
          </h1>

          <p className="text-zinc-400 mt-2">
            Browse all available rental cars
          </p>
        </div>

        {/* CAR GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {currentCars.map((car) => (
            <div
              key={car.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
            >
              <img
                src={
                  car.images?.[0]?.imageUrl
                    ? `http://localhost:5000/${car.images[0].imageUrl.replace(/\\/g, "/")}`
                    : "/placeholder-car.png"
                }
                alt={car.title}
                className="w-full h-48 object-cover rounded"
              />
              {/* CONTENT */}
              <div className="p-5">

                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold">
                    {car.title}
                  </h2>

                  <span className="text-blue-400 font-bold">
                    ${car.pricePerDay}/day
                  </span>
                </div>

                <p className="text-zinc-400 text-sm mb-2">
                  {car.brand} • {car.model} • {car.year}
                </p>

                <p className="text-zinc-500 text-sm mb-4">
                  📍 {car.location}
                </p>

                <p className="text-zinc-300 text-sm line-clamp-2 mb-5">
                  {car.description}
                </p>

                {/* BOOK BUTTON */}
                <Link href={`/booking/${car.id}`}>
                  <button className="w-full bg-blue-500 hover:bg-blue-600 py-2 rounded-lg transition">
                    Book Now
                  </button>
                </Link>

              </div>
            </div>
          ))}

        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-center gap-3 mt-10">

          <button
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage((prev) => prev - 1)
            }
            className="px-4 py-2 rounded bg-zinc-800 disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-zinc-300">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => prev + 1)
            }
            className="px-4 py-2 rounded bg-zinc-800 disabled:opacity-40"
          >
            Next
          </button>

        </div>

      </div>
    </div>
  );
}