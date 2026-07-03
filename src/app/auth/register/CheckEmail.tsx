"use client";

import Link from "next/link";
import { Mail } from "lucide-react";

interface CheckEmailProps {
  email: string;
}

export default function CheckEmail({
  email,
}: CheckEmailProps) {
  return (

      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/10">
          <Mail className="h-8 w-8 text-blue-500" />
        </div>

        {/* Heading */}
        <h1 className="text-center text-3xl font-bold text-white">
          Check Your Email
        </h1>

        <p className="mt-3 text-center text-sm text-zinc-400">
          We've sent a verification link to:
        </p>

        {/* Email */}
        <div className="mt-4 rounded-lg border border-zinc-700 bg-black p-3 text-center">
          <span className="break-all font-medium text-white">
            {email}
          </span>
        </div>

        {/* Description */}
        <p className="mt-6 text-center text-sm leading-6 text-zinc-400">
          Please open your inbox and click the verification link to activate
          your account.
        </p>

        <p className="mt-2 text-center text-xs text-zinc-500">
          The verification link will expire after a limited time.
        </p>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm font-medium text-zinc-500"
          >
            Resend Email (Coming Soon)
          </button>

          <Link
            href="/auth/login"
            className="block w-full rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
          >
            Back to Login
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-zinc-500">
          Didn't receive the email? Check your spam folder before requesting a
          new verification email.
        </p>
      </div>
  );
}