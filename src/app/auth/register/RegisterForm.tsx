"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { BASE_URL } from "../../../services/api";
import {
  registerSchema,
  RegisterFormData,
} from "./validation";

interface RegisterFormProps {
  onSuccess: (email: string) => void;
}

type FormErrors = Partial<
  Record<keyof RegisterFormData, string>
>;

const initialForm: RegisterFormData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "CAR_OWNER",
};

export default function RegisterForm({
  onSuccess,
}: RegisterFormProps) {
  const [form, setForm] =
    useState<RegisterFormData>(initialForm);

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [apiError, setApiError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setApiError("");
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) return;

    setApiError("");
    setErrors({});

    const result =
      registerSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors: FormErrors = {};

      result.error.issues.forEach(
        (issue) => {
          const field =
            issue.path[0] as keyof RegisterFormData;

          fieldErrors[field] =
            issue.message;
        }
      );

      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${BASE_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name:
              result.data.name,
            email:
              result.data.email,
            password:
              result.data.password,
            role:
              result.data.role,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setApiError(
          data.message ??
            "Registration failed."
        );
        return;
      }

      onSuccess(result.data.email);
    } catch {
      setApiError(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Name */}

      <div>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Full Name"
          maxLength={50}
          className="w-full rounded-lg border border-zinc-700 bg-black p-3 text-white focus:border-blue-500 focus:outline-none"
        />

        {errors.name && (
          <p className="mt-1 text-sm text-red-500">
            {errors.name}
          </p>
        )}
      </div>

      {/* Email */}

      <div>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email Address"
          maxLength={100}
          className="w-full rounded-lg border border-zinc-700 bg-black p-3 text-white focus:border-blue-500 focus:outline-none"
        />

        {errors.email && (
          <p className="mt-1 text-sm text-red-500">
            {errors.email}
          </p>
        )}
      </div>

      {/* Password */}

      <div>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full rounded-lg border border-zinc-700 bg-black p-3 text-white focus:border-blue-500 focus:outline-none"
        />

        {errors.password && (
          <p className="mt-1 text-sm text-red-500">
            {errors.password}
          </p>
        )}
      </div>

      {/* Confirm Password */}

      <div>
        <input
          type="password"
          name="confirmPassword"
          value={
            form.confirmPassword
          }
          onChange={handleChange}
          placeholder="Confirm Password"
          className="w-full rounded-lg border border-zinc-700 bg-black p-3 text-white focus:border-blue-500 focus:outline-none"
        />

        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-500">
            {
              errors.confirmPassword
            }
          </p>
        )}
      </div>

      {/* Role */}

      <div>
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full rounded-lg border border-zinc-700 bg-black p-3 text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="CAR_OWNER">
            Car Owner
          </option>

          <option value="RENTER">
            Renter
          </option>
        </select>
      </div>

      {/* API Error */}

      {apiError && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400">
          {apiError}
        </div>
      )}

      {/* Button */}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Creating Account..."
          : "Create Account"}
      </button>
    </form>
  );
}