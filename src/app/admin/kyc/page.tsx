"use client";

import { useEffect, useMemo, useState } from "react";
import { ADMIN_BASE, authHeaders, BASE_URL } from "../../../services/api";

type KycRecord = {
  id: number;
  userId: number;
  fullName: string;
  cnic: string;
  address: string;
  phone: string;
  cnicFront?: string;
  cnicBack?: string;
  selfie?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewNote?: string | null;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    isVerified: boolean;
  };
};

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

export default function KycAdminPage() {
  const [kycList, setKycList] = useState<KycRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [note, setNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    void fetchKyc();
  }, []);

  const fetchKyc = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ADMIN_BASE}/kyc`, { headers: authHeaders() });
      const data = await res.json();
      setKycList(data.data || []);
      if (!selectedId && data.data?.length) {
        setSelectedId(data.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedKyc = useMemo(
    () => kycList.find((item) => item.id === selectedId) || null,
    [kycList, selectedId]
  );

  const filteredList = useMemo(() => {
    if (statusFilter === "ALL") return kycList;
    return kycList.filter((item) => item.status === statusFilter);
  }, [kycList, statusFilter]);

  const updateStatus = async (id: number, status: "APPROVED" | "REJECTED") => {
    setActionLoading(true);
    try {
      const res = await fetch(`${ADMIN_BASE}/kyc/${id}/status`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status, reviewNote: status === "REJECTED" ? note : undefined }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "Failed to update KYC status");
      }

      setNote("");
      await fetchKyc();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const statusPill = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "border-amber-400/30 bg-amber-400/10 text-amber-200",
      APPROVED: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
      REJECTED: "border-rose-400/30 bg-rose-400/10 text-rose-200",
    };

    return styles[status] || "border-white/10 bg-white/5 text-slate-200";
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_24%),linear-gradient(180deg,_#050816_0%,_#0a1020_100%)] p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Admin</p>
            <h1 className="mt-2 text-3xl font-bold">KYC Control Center</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Review every KYC request, inspect documents, and approve or reject users with notes.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <a href="/admin" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10">Dashboard</a>
            <a href="/admin/users" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10">Users</a>
            <a href="/admin/cars" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10">Cars</a>
            <a href="/admin/payments" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10">Payments</a>
          </div>
        </header>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total" value={kycList.length} tone="text-cyan-300" />
          <MetricCard label="Pending" value={kycList.filter((item) => item.status === "PENDING").length} tone="text-amber-300" />
          <MetricCard label="Approved" value={kycList.filter((item) => item.status === "APPROVED").length} tone="text-emerald-300" />
          <MetricCard label="Rejected" value={kycList.filter((item) => item.status === "REJECTED").length} tone="text-rose-300" />
        </section>

        <section className="mb-6 flex flex-wrap gap-2">
          {(["ALL", "PENDING", "APPROVED", "REJECTED"] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                statusFilter === status
                  ? "bg-cyan-400 text-slate-950"
                  : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              {status}
            </button>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <aside className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="border-b border-white/10 p-4">
              <h2 className="text-lg font-semibold">KYC Requests</h2>
              <p className="text-sm text-slate-400">{filteredList.length} request(s) in current filter</p>
            </div>

            <div className="max-h-[70vh] divide-y divide-white/10 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-slate-300">Loading...</div>
              ) : filteredList.length === 0 ? (
                <div className="p-4 text-slate-300">No KYC records found</div>
              ) : (
                filteredList.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full px-4 py-4 text-left transition hover:bg-white/5 ${selectedId === item.id ? "bg-white/10" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-white">{item.fullName}</div>
                        <div className="text-sm text-slate-400">{item.user?.email || `User #${item.userId}`}</div>
                        <div className="mt-2 text-xs text-slate-500">CNIC: {item.cnic}</div>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusPill(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>

          <main className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
            {!selectedKyc ? (
              <div className="text-slate-300">Select a KYC request to see details.</div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Selected request</p>
                    <h2 className="mt-2 text-2xl font-bold text-white">{selectedKyc.fullName}</h2>
                    <p className="mt-2 text-sm text-slate-300">Submitted by {selectedKyc.user?.name || "Unknown user"} ({selectedKyc.user?.email || "no email"})</p>
                  </div>

                  <div className={`rounded-2xl border px-4 py-3 text-sm ${statusPill(selectedKyc.status)}`}>
                    Current status: <span className="font-semibold">{selectedKyc.status}</span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <InfoCard label="CNIC" value={selectedKyc.cnic} />
                  <InfoCard label="Phone" value={selectedKyc.phone} />
                  <InfoCard label="Address" value={selectedKyc.address} />
                  <InfoCard label="User ID" value={`#${selectedKyc.userId}`} />
                  <InfoCard label="Account Verified" value={selectedKyc.user?.isVerified ? "Yes" : "No"} />
                  <InfoCard label="Account Active" value={selectedKyc.user?.isActive ? "Yes" : "No"} />
                </div>

                <section>
                  <h3 className="text-lg font-semibold text-white">Submitted documents</h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <DocLink label="CNIC Front" href={selectedKyc.cnicFront} />
                    <DocLink label="CNIC Back" href={selectedKyc.cnicBack} />
                    <DocLink label="Selfie" href={selectedKyc.selfie} />
                  </div>
                </section>

                <section className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <h3 className="font-semibold text-white">Admin note</h3>
                    <p className="mt-2 text-sm text-slate-300">
                      {selectedKyc.reviewNote || "No review note has been added yet."}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
                    <p><span className="text-slate-400">Created:</span> {selectedKyc.createdAt ? new Date(selectedKyc.createdAt).toLocaleString() : "-"}</p>
                    <p className="mt-2"><span className="text-slate-400">Updated:</span> {selectedKyc.updatedAt ? new Date(selectedKyc.updatedAt).toLocaleString() : "-"}</p>
                    <p className="mt-2"><span className="text-slate-400">User role:</span> {selectedKyc.user?.role || "-"}</p>
                  </div>
                </section>

                <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Control actions</h3>
                      <p className="mt-1 text-sm text-slate-400">Approve or reject the selected KYC request.</p>
                    </div>
                    <div className="text-sm text-slate-400">Approved requests unlock user access in the app.</div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <label className="block text-sm text-slate-300">Review note for rejection</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={4}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-cyan-400/40"
                      placeholder="Add a reason if you reject this KYC request"
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      disabled={actionLoading || selectedKyc.status === "APPROVED"}
                      onClick={() => void updateStatus(selectedKyc.id, "APPROVED")}
                      className="rounded-full bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionLoading ? "Working..." : "Approve KYC"}
                    </button>
                    <button
                      disabled={actionLoading || selectedKyc.status === "REJECTED"}
                      onClick={() => void updateStatus(selectedKyc.id, "REJECTED")}
                      className="rounded-full bg-rose-500 px-5 py-3 font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Reject KYC
                    </button>
                  </div>
                </section>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20 backdrop-blur-xl">
      <p className="text-sm text-slate-400">{label}</p>
      <div className={`mt-3 text-3xl font-bold ${tone}`}>{value}</div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 break-words font-medium text-white">{value || "-"}</p>
    </div>
  );
}

function DocLink({ label, href }: { label: string; href?: string }) {
  const resolvedHref = href ? `${BASE_URL.replace(/\/api\/?$/, "")}/${href.replace(/^\//, "")}` : "";

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      {resolvedHref ? (
        <a href={resolvedHref} target="_blank" rel="noreferrer" className="mt-2 inline-block break-all text-cyan-300 hover:text-cyan-200">
          Open file
        </a>
      ) : (
        <p className="mt-2 text-slate-500">No file uploaded</p>
      )}
    </div>
  );
}