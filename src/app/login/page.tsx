"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Auth } from "../../lib/auth";
import { BASE_URL } from "../../services/api";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      const payload = data.data ?? data;

      if (res.ok) {
        setMessage("Login successful 🎉");

        const token = payload?.token;
        const authUser = {
          role: payload?.role,
          kycStatus: payload?.kycStatus ?? payload?.KYCStatus ?? "NOT_SUBMITTED",
        };

        if (!token) {
          setMessage("Login succeeded, but token was missing");
          return;
        }

        // store via central Auth helper
        Auth.set(token, authUser);
        document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24}; samesite=lax`;

        // console.log("USER INFO:", authUser);
        
        if (authUser.role === "ADMIN") {
          router.push("/admin");
          window.location.reload();
        } else {
          console.log("Redirecting to dashboard...");
          router.push("/dashboard");
          window.location.reload();
        }
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (error) {
      console.log(error);
      setMessage("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-lg">
        
        {/* TITLE */}
        <h1 className="text-3xl font-bold text-center mb-2">
          Welcome Back
        </h1>

        <p className="text-center text-gray-400 mb-6">
          Login to continue to your dashboard
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4"
        method="POST">

          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Email"
            className="w-full p-3 rounded-lg bg-black border border-zinc-700 focus:outline-none focus:border-blue-500"
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-black border border-zinc-700 focus:outline-none focus:border-blue-500"
            onChange={handleChange}
          />

          {/* FORGOT PASSWORD */}
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-400 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 transition p-3 rounded-lg font-semibold"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* REGISTER */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Don’t have an account?{" "}
          <Link
            href="/register"
            className="text-blue-400 hover:underline"
          >
            Register
          </Link>
        </p>

        {/* MESSAGE */}
        {message && (
          <p className="text-center mt-4 text-sm text-gray-300">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}