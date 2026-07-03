"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BASE_URL } from "../../../../services/api";

type Status = "idle" | "loading" | "success" | "error";

export default function RegisterVerificationPage() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const handleVerify = async () => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
        console.log("URL /verification/verify", `${BASE_URL}/verification/verify`);
      const response = await fetch(
        `${BASE_URL}/verification/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(
          data.message || "Verification failed."
        );
        return;
      }

      setStatus("success");
      setMessage(
        data.message ||
          "Your email has been verified successfully."
      );
    } catch {
      setStatus("error");
      setMessage(
        "Unable to connect to the server."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">

        {/* Initial */}
        {status === "idle" && (
          <>
            <h1 className="text-3xl font-bold text-white text-center">
              Verify Your Email
            </h1>

            <p className="mt-4 text-center text-zinc-400">
              Click the button below to verify your email
              address and activate your account.
            </p>

            <button
              onClick={handleVerify}
              className="mt-8 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Verify Email
            </button>
          </>
        )}

        {/* Loading */}
        {status === "loading" && (
          <>
            <div className="flex justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>

            <h2 className="mt-6 text-center text-2xl font-bold text-white">
              Verifying...
            </h2>

            <p className="mt-3 text-center text-zinc-400">
              Please wait while we verify your account.
            </p>

            <button
              disabled
              className="mt-8 w-full cursor-not-allowed rounded-lg bg-blue-600 py-3 font-semibold text-white opacity-60"
            >
              Verifying...
            </button>
          </>
        )}

        {/* Success */}
        {status === "success" && (
          <>
            <div className="text-center text-6xl">
              ✅
            </div>

            <h2 className="mt-4 text-center text-2xl font-bold text-green-400">
              Email Verified
            </h2>

            <p className="mt-4 text-center text-zinc-300">
              {message}
            </p>

            <Link
              href="/auth/login"
              className="mt-8 block w-full rounded-lg bg-green-600 py-3 text-center font-semibold text-white transition hover:bg-green-700"
            >
              Go to Login
            </Link>
          </>
        )}

        {/* Error */}
        {status === "error" && (
          <>
            <div className="text-center text-6xl">
              ❌
            </div>

            <h2 className="mt-4 text-center text-2xl font-bold text-red-400">
              Verification Failed
            </h2>

            <p className="mt-4 text-center text-zinc-300">
              {message}
            </p>

            <Link
              href="/auth/register"
              className="mt-8 block w-full rounded-lg bg-red-600 py-3 text-center font-semibold text-white transition hover:bg-red-700"
            >
              Back to Register
            </Link>
          </>
        )}

      </div>
    </div>
  );
}