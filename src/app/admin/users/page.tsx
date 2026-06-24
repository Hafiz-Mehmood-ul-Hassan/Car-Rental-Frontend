"use client";

import { useEffect, useState } from "react";
import { ADMIN_BASE, authHeaders } from "../../../services/api";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  phone?: string;
};


        console.error("Update failed");

  export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editRole, setEditRole] = useState<string>("");
    const [editPhone, setEditPhone] = useState<string>("");

    useEffect(() => {
      void fetchUsers();
    }, []);

    const fetchUsers = async (q = "") => {
      setLoading(true);
      try {
        const url = q ? `${ADMIN_BASE}/users?search=${encodeURIComponent(q)}` : `${ADMIN_BASE}/users`;
        const res = await fetch(url, { headers: authHeaders() });
        const body = await res.json();
        setUsers(body.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const startEdit = (u: User) => {
      setEditingId(u.id);
      setEditRole(u.role);
      setEditPhone(u.phone || "");
    };

    const cancelEdit = () => {
      setEditingId(null);
      setEditRole("");
      setEditPhone("");
    };

    const saveEdit = async (id: number) => {
      try {
        const res = await fetch(`${ADMIN_BASE}/users/${id}`, {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ role: editRole, phone: editPhone }),
        });

        if (!res.ok) {
          console.error("Update failed");
          return;
        }

        await fetchUsers(search);
        cancelEdit();
      } catch (err) {
        console.error(err);
      }
    };

    const toggleActive = async (u: User) => {
      try {
        const res = await fetch(`${ADMIN_BASE}/users/${u.id}`, {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ isActive: !u.isActive }),
        });

        if (res.ok) {
          await fetchUsers(search);
        }
      } catch (err) {
        console.error(err);
      }
    };

    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_26%),linear-gradient(180deg,_#050816_0%,_#0b1020_100%)] p-6 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Admin</p>
              <h1 className="mt-2 text-3xl font-bold">User Management</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Search, review, block/unblock, and update user roles from one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <a href="/admin" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10">Dashboard</a>
              <a href="/admin/kyc" className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-cyan-100 hover:bg-cyan-400/20">KYC</a>
              <a href="/admin/cars" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10">Cars</a>
              <a href="/admin/payments" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10">Payments</a>
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-3 sm:flex-row">
            <input
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-cyan-400/40 sm:max-w-md"
            />
            <button onClick={() => void fetchUsers(search)} className="rounded-full bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300">
              Search
            </button>
            <button onClick={() => { setSearch(""); void fetchUsers(); }} className="rounded-full border border-white/10 bg-white/5 px-5 py-3 hover:bg-white/10">
              Clear
            </button>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-white/5 text-sm text-slate-400">
                  <tr>
                    <th className="px-5 py-4">Name</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Active</th>
                    <th className="px-5 py-4">Phone</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="px-5 py-8 text-slate-300">Loading...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-8 text-slate-300">No users found</td></tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="border-t border-white/10 align-top hover:bg-white/5">
                        <td className="px-5 py-4 font-medium text-white">{u.name}</td>
                        <td className="px-5 py-4 text-sm text-slate-300">{u.email}</td>
                        <td className="px-5 py-4">
                          {editingId === u.id ? (
                            <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className="rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 outline-none">
                              <option value="RENTER">RENTER</option>
                              <option value="CAR_OWNER">CAR_OWNER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          ) : (
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-200">{u.role}</span>
                          )}
                        </td>
                        <td className="px-5 py-4">{u.isActive ? <span className="text-emerald-300">Yes</span> : <span className="text-rose-300">No</span>}</td>
                        <td className="px-5 py-4">
                          {editingId === u.id ? (
                            <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-40 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 outline-none" placeholder="Phone" />
                          ) : (
                            <span className="text-slate-300">{u.phone || "-"}</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {editingId === u.id ? (
                            <div className="flex flex-wrap gap-2">
                              <button onClick={() => void saveEdit(u.id)} className="rounded-full bg-emerald-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300">Save</button>
                              <button onClick={cancelEdit} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">Cancel</button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              <button onClick={() => startEdit(u)} className="rounded-full bg-cyan-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300">Edit</button>
                              <button onClick={() => void toggleActive(u)} className={`rounded-full px-3 py-2 text-sm font-semibold ${u.isActive ? "bg-rose-500 text-white hover:bg-rose-400" : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"}`}>
                                {u.isActive ? "Block" : "Unblock"}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
