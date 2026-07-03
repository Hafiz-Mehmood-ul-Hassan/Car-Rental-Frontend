"use client";

import { useState } from "react";
import RegisterForm from "./RegisterForm";
import CheckEmail from "./CheckEmail";

export default function RegisterPage() {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-10">
      {email ? (
        <CheckEmail email={email} />
      ) : (
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">
              Create Account
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Join our car rental platform
            </p>
          </div>

          <RegisterForm onSuccess={setEmail} />

          <div className="mt-8 border-t border-zinc-800 pt-6 text-center">
            <p className="text-sm text-zinc-400">
              Already have an account?{" "}
              <a
                href="/auth/login"
                className="font-medium text-blue-500 hover:text-blue-400"
              >
                Login
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}