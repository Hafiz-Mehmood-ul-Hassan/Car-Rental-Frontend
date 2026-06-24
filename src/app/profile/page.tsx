"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BASE_URL, { authHeaders } from "../../services/api";
import { Auth } from "../../lib/auth";

type ProfileUser = {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  isVerified?: boolean;
  isActive?: boolean;
  kycStatus?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/me`, { headers: authHeaders() });
        const data = await res.json();
        const profile = data.data || null;
        setUser(profile);
        setName(profile?.name || "");
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/me/update`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.data || user);
        setMessage("Profile updated successfully");
      } else {
        setMessage(data.message || "Profile update failed");
      }
    } catch (error) {
      console.log(error);
      setMessage("Server error");
    }

    setSaving(false);
  };

  const handleDeactivate = async () => {
    const confirmed = window.confirm(
      "Deactivate your account? You can sign in again only if an admin reactivates it."
    );

    if (!confirmed) return;

    setMessage("");
    setDeleting(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/me/delete`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      const data = await res.json();

      if (res.ok) {
        Auth.clear();
        setMessage("Account deactivated successfully");
        setTimeout(() => router.push("/login"), 1200);
      } else {
        setMessage(data.message || "Account deactivation failed");
      }
    } catch (error) {
      console.log(error);
      setMessage("Server error");
    }

    setDeleting(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-black p-6 text-white">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_26%),linear-gradient(180deg,_#050816_0%,_#0a1020_100%)] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard" className="text-sm text-cyan-300 hover:text-cyan-200">
          ← Back to dashboard
        </Link>

        <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Profile</p>
              <h1 className="mt-2 text-3xl font-bold">Account settings</h1>
            </div>
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
              {user?.role || "USER"}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoBox label="Email" value={user?.email || "Not loaded"} />
            <InfoBox label="KYC Status" value={(user?.kycStatus || "NOT_SUBMITTED").replaceAll("_", " ")} />
            <InfoBox label="Verified" value={user?.isVerified ? "Yes" : "No"} />
            <InfoBox label="Active" value={user?.isActive === false ? "No" : "Yes"} />
          </div>

          <form onSubmit={handleUpdate} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-cyan-400/40"
                placeholder="Your name"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Update profile"}
              </button>

              <button
                type="button"
                onClick={handleDeactivate}
                disabled={deleting}
                className="rounded-full border border-rose-500/30 bg-rose-500/10 px-5 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deactivating..." : "Deactivate account"}
              </button>
            </div>

            {message && <p className="text-sm text-cyan-200">{message}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 font-medium text-white">{value}</p>
    </div>
  );
}