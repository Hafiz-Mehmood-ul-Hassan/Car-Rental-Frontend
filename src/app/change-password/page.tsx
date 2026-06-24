"use client";

import { useState } from "react";
import { Auth } from "../../lib/auth";
import { BASE_URL, authHeaders } from "../../services/api";

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMessage("");

    if (form.newPassword !== form.confirmPassword) {
      setMessage("New password and confirm password do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/change-password`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ oldPassword: form.currentPassword, newPassword: form.newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Password changed successfully");
        Auth.clear();
        setTimeout(() => (window.location.href = "/login"), 1000);
      } else {
        setMessage(data.message || "Change password failed");
      }
    } catch (err) {
      console.log(err);
      setMessage("Server error");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black p-4 text-white">
      <form onSubmit={handleSubmit} className="w-[420px] bg-zinc-900 p-6 rounded-xl space-y-4">
        <h1 className="text-2xl font-bold">Change Password</h1>

        <input name="currentPassword" type="password" placeholder="Current password" className="w-full p-2 rounded bg-black" value={form.currentPassword} onChange={handleChange} />
        <input name="newPassword" type="password" placeholder="New password" className="w-full p-2 rounded bg-black" value={form.newPassword} onChange={handleChange} />
        <input name="confirmPassword" type="password" placeholder="Confirm new password" className="w-full p-2 rounded bg-black" value={form.confirmPassword} onChange={handleChange} />

        <button type="submit" disabled={loading} className="w-full bg-blue-600 p-2 rounded">{loading ? 'Saving...' : 'Save'}</button>

        {message && <p className="text-sm mt-2">{message}</p>}
      </form>
    </div>
  );
}
