"use client";

import { useState } from "react";
import { BASE_URL } from "../../services/api";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CAR_OWNER",
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

    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("User registered successfully 🎉");

        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        setMessage(data.message || "Registration failed");
      }
    } catch (error) {
      setMessage("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-lg">

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-center mb-2">
          Create Account
        </h1>

        <p className="text-center text-gray-400 mb-6">
          Join our car rental platform
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4" method="POST">

          <input
            name="name"
            placeholder="Full Name"
            className="w-full p-3 rounded-lg bg-black border border-zinc-700 focus:outline-none focus:border-blue-500"
            onChange={handleChange}
            required
          />

          <input
            name="email"
            placeholder="Email Address"
            type="email"
            className="w-full p-3 rounded-lg bg-black border border-zinc-700 focus:outline-none focus:border-blue-500"
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password (min 6 chars)"
            className="w-full p-3 rounded-lg bg-black border border-zinc-700 focus:outline-none focus:border-blue-500"
            onChange={handleChange}
            required
          />

          {/* ROLE SELECT */}
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-black border border-zinc-700 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="CAR_OWNER">Car Owner</option>
            <option value="RENTER">Renter</option>
          </select>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 transition p-3 rounded-lg font-semibold"
          >
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>

        {/* MESSAGE */}
        {message && (
          <p className="text-center text-sm text-gray-300 mt-4">
            {message}
          </p>
        )}

        {/* FOOTER */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-blue-400 hover:underline">
            Login
          </a>
        </p>

      </div>
    </div>
  );
}