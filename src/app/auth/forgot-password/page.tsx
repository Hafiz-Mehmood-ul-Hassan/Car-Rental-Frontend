"use client";

import { useState } from "react";
import { BASE_URL } from "../../../services/api";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1);

  const [email, setEmail] = useState("");
  const [token, setToken] = useState(""); // stored internally
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // =========================
  // STEP 1: GET TOKEN FROM EMAIL
  // =========================
  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!data.success) {
        setMessage(data.message || "Email not found");
        setLoading(false);
        return;
      }

      // 🔥 IMPORTANT: token comes from response
      setToken(data.data.resetToken);

      setMessage("Token received. Set your new password now.");
      setStep(2);

    } catch (error) {
      setMessage("Server error");
    }

    setLoading(false);
  };

  // =========================
  // STEP 2: RESET PASSWORD
  // =========================
  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    // convert token and password to string just in case they are not
    const tokenStr = String(token);
    const passwordStr = String(password);
    console.log("RESETTING WITH TOKEN:", typeof tokenStr, "AND PASSWORD:", typeof passwordStr);
    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: tokenStr,
          password: passwordStr,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setMessage(data.message || "Reset failed");
        setLoading(false);
        return;
      }

      setMessage("Password reset successful 🎉");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);

    } catch (error) {
      setMessage("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

        {/* TITLE */}
        <h1 className="text-2xl font-bold text-center mb-2">
          Forgot Password
        </h1>

        <p className="text-center text-gray-400 mb-6">
          {step === 1
            ? "Enter your email"
            : "Enter your new password"}
        </p>

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={sendEmail} className="space-y-4">

            <input
              type="email"
              placeholder="Email address"
              className="w-full p-3 rounded-lg bg-black border border-zinc-700"
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 p-3 rounded-lg"
            >
              {loading ? "Sending..." : "Send Reset Request"}
            </button>

          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={resetPassword} className="space-y-4">

            <input
              type="password"
              placeholder="New password"
              className="w-full p-3 rounded-lg bg-black border border-zinc-700"
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 p-3 rounded-lg"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

          </form>
        )}

        {/* MESSAGE */}
        {message && (
          <p className="text-center text-sm text-gray-300 mt-4">
            {message}
          </p>
        )}

        {/* BACK */}
        <div className="text-center mt-6">
          <Link
            href="/login"
            className="text-blue-400 hover:underline text-sm"
          >
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}
