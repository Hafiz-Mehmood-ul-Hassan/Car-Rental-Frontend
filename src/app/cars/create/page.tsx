"use client";

import { useState } from "react";
import { authHeaders, BASE_URL } from "../../../services/api";
import { Auth } from "../../../lib/auth";

export default function CreateCarPage() {
  const [form, setForm] = useState({
    title: "",
    brand: "",
    model: "",
    year: "",
    pricePerDay: "",
    location: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const token = Auth.getToken();


    try {
      const res = await fetch(`${BASE_URL}/cars`, {
          method: "POST",
          headers: {
            ...authHeaders(),
          },
          body: JSON.stringify({
            title: form.title,
            brand: form.brand,
            model: form.model,
            year: Number(form.year),
            pricePerDay: Number(form.pricePerDay),
            location: form.location,
            description: form.description,
          }),
        }
      );

      const data = await res.json();

      console.log("CAR RESPONSE:", data);

      if (res.ok) {
        setMessage("Car created successfully 🎉");

        setForm({
          title: "",
          brand: "",
          model: "",
          year: "",
          pricePerDay: "",
          location: "",
          description: "",
        });
        // Redirect to image upload page after short delay
        setTimeout(() => {
          window.location.href = `/cars/${data.data.id}/upload-images`;
        }, 1000);
      } else {
        setMessage(data.message || "Failed to create car");
      }
    } catch (error) {
      console.log(error);
      setMessage("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-800 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-[500px] bg-black p-6 rounded-xl shadow space-y-3"
      >
        <h1 className="text-2xl font-bold text-center">
          Add New Car
        </h1>

        <input
          name="title"
          placeholder="Car Title"
          className="w-full border p-2 rounded"
          onChange={handleChange}
          value={form.title}
        />

        <input
          name="brand"
          placeholder="Brand"
          className="w-full border p-2 rounded"
          onChange={handleChange}
          value={form.brand}
        />

        <input
          name="model"
          placeholder="Model"
          className="w-full border p-2 rounded"
          onChange={handleChange}
          value={form.model}
        />

        <input
          name="year"
          type="number"
          placeholder="Year"
          className="w-full border p-2 rounded"
          onChange={handleChange}
          value={form.year}
        />

        <input
          name="pricePerDay"
          type="number"
          placeholder="Price Per Day"
          className="w-full border p-2 rounded"
          onChange={handleChange}
          value={form.pricePerDay}
        />

        <input
          name="location"
          placeholder="Location"
          className="w-full border p-2 rounded"
          onChange={handleChange}
          value={form.location}
        />

        <textarea
          name="description"
          placeholder="Description"
          className="w-full border p-2 rounded"
          onChange={handleChange}
          value={form.description}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          {loading ? "Creating..." : "Create Car"}
        </button>

        {message && (
          <p className="text-center text-sm mt-2">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}