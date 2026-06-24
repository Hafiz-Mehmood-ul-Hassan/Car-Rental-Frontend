"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { ADMIN_BASE, authHeaders, BASE_URL } from "../../../services/api";

type CarRecord = {
  id: number;
  title: string;
  brand: string;
  model: string;
  year: number;
  location: string;
  pricePerDay: number;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  reviewNote?: string | null;
  description?: string | null;
  isBooked?: boolean;
  createdAt?: string;
  updatedAt?: string;
  images?: { imageUrl: string }[];
  documents?: {
    id: number;
    type: string;
    fileUrl: string;
    status?: string;
    reviewNote?: string | null;
  }[];
  owner?: {
    id: number;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    kycStatus: string;
  };
};

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "DRAFT" | "SUSPENDED";

export default function CarAdminPage() {
  const [cars, setCars] = useState<CarRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [note, setNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    void fetchCars();
  }, []);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ADMIN_BASE}/cars`, { headers: authHeaders() });
      const body = await res.json();

      if (!res.ok) {
        console.error("Failed to fetch admin cars", body);
        setCars([]);
        return;
      }

      setCars(body.data || []);

      if (!selectedId && body.data?.length) {
        setSelectedId(body.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCars = useMemo(() => {
    if (statusFilter === "ALL") return cars;
    return cars.filter((car) => car.status === statusFilter);
  }, [cars, statusFilter]);

  const selectedCar = useMemo(
    () => filteredCars.find((car) => car.id === selectedId) || cars.find((car) => car.id === selectedId) || null,
    [cars, filteredCars, selectedId]
  );

  const statusStyle = (status: string) => {
    const map: Record<string, string> = {
      DRAFT: "border-slate-400/30 bg-slate-400/10 text-slate-100",
      PENDING: "border-amber-400/30 bg-amber-400/10 text-amber-100",
      APPROVED: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
      REJECTED: "border-rose-400/30 bg-rose-400/10 text-rose-100",
      SUSPENDED: "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-100",
    };

    return map[status] || "border-white/10 bg-white/5 text-slate-200";
  };

  const updateStatus = async (id: number, action: "approve" | "reject") => {
    setActionLoading(true);
    try {
      const res = await fetch(`${ADMIN_BASE}/cars/${id}/${action}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: action === "reject" ? JSON.stringify({ note }) : undefined,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || `Failed to ${action} car`);
      }

      setNote("");
      await fetchCars();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  
  const imageUrl = (path?: string) => {
    if (!path) return "https://placehold.co/800x500?text=No+Image";
    return `${BASE_URL.replace(/\/api\/?$/, "")}/${path.replace(/^\//, "")}`;
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.14),_transparent_24%),linear-gradient(180deg,_#050816_0%,_#0b1020_100%)] p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Admin</p>
            <h1 className="mt-2 text-3xl font-bold">Car Control Center</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Review car submissions, inspect owner details and car documents, and approve or reject listings with notes.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <a href="/admin" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10">Dashboard</a>
            <a href="/admin/kyc" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10">KYC</a>
            <a href="/admin/users" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10">Users</a>
            <a href="/admin/payments" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10">Payments</a>
          </div>
        </header>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Total" value={cars.length} tone="text-cyan-300" />
          <MetricCard label="Pending" value={cars.filter((c) => c.status === "PENDING").length} tone="text-amber-300" />
          <MetricCard label="Approved" value={cars.filter((c) => c.status === "APPROVED").length} tone="text-emerald-300" />
          <MetricCard label="Rejected" value={cars.filter((c) => c.status === "REJECTED").length} tone="text-rose-300" />
          <MetricCard label="Booked" value={cars.filter((c) => c.isBooked).length} tone="text-fuchsia-300" />
        </section>

        <section className="mb-6 flex flex-wrap gap-2">
          {(["ALL", "PENDING", "APPROVED", "REJECTED", "DRAFT", "SUSPENDED"] as StatusFilter[]).map((status) => (
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
              <h2 className="text-lg font-semibold">Car Submissions</h2>
              <p className="text-sm text-slate-400">{filteredCars.length} car(s) in current filter</p>
            </div>

            <div className="max-h-[70vh] divide-y divide-white/10 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-slate-300">Loading...</div>
              ) : filteredCars.length === 0 ? (
                <div className="p-4 text-slate-300">No cars found</div>
              ) : (
                filteredCars.map((car) => (
                  <button
                    key={car.id}
                    onClick={() => setSelectedId(car.id)}
                    className={`w-full px-4 py-4 text-left transition hover:bg-white/5 ${selectedId === car.id ? "bg-white/10" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="truncate font-semibold text-white">{car.title}</div>
                            <div className="text-sm text-slate-400">{car.brand} • {car.model}</div>
                          </div>
                          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusStyle(car.status)}`}>{car.status}</span>
                        </div>
                        <div className="mt-2 text-xs text-slate-500">{car.location} • ${car.pricePerDay}/day</div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>

          <main className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
            {!selectedCar ? (
              <div className="text-slate-300">Select a car request to see details.</div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60">
                    <img src={imageUrl(selectedCar.images?.[0]?.imageUrl)} alt={selectedCar.title} className="h-72 w-full object-cover" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Selected car</p>
                        <h2 className="mt-2 text-2xl font-bold text-white">{selectedCar.title}</h2>
                        <p className="mt-2 text-sm text-slate-300">{selectedCar.brand} • {selectedCar.model} • {selectedCar.year}</p>
                      </div>
                      <span className={`inline-flex w-fit rounded-full border px-4 py-2 text-sm font-medium ${statusStyle(selectedCar.status)}`}>
                        {selectedCar.status}
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <InfoCard label="Location" value={selectedCar.location} />
                      <InfoCard label="Price / day" value={`$${selectedCar.pricePerDay}`} />
                      <InfoCard label="Booked" value={selectedCar.isBooked ? "Yes" : "No"} />
                      <InfoCard label="Owner KYC" value={selectedCar.owner?.kycStatus || "-"} />
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <h3 className="font-semibold text-white">Owner</h3>
                      <p className="mt-2 text-sm text-slate-300">{selectedCar.owner?.name || "Unknown"}</p>
                      <p className="text-sm text-slate-400">{selectedCar.owner?.email || "No email"}</p>
                    </div>
                  </div>
                </div>

                <section className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <h3 className="font-semibold text-white">Description</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{selectedCar.description || "No description provided."}</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <h3 className="font-semibold text-white">Admin note</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{selectedCar.reviewNote || "No review note has been added yet."}</p>
                    <p className="mt-4 text-xs text-slate-500">Created: {selectedCar.createdAt ? new Date(selectedCar.createdAt).toLocaleString() : "-"}</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-white">Documents</h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {(selectedCar.documents || []).map((doc) => (
                      <DocCard key={doc.id} type={doc.type} href={doc.fileUrl} status={doc.status} reviewNote={doc.reviewNote} />
                    ))}
                    {(!selectedCar.documents || selectedCar.documents.length === 0) && (
                      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">No documents uploaded yet.</div>
                    )}
                  </div>
                </section>

                <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Control actions</h3>
                      <p className="mt-1 text-sm text-slate-400">Approve or reject the selected car submission.</p>
                    </div>
                    <div className="text-sm text-slate-400">Rejected listings keep a review note for the owner.</div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <label className="block text-sm text-slate-300">Review note for rejection</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={4}
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-cyan-400/40"
                      placeholder="Explain why this car should be rejected"
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      disabled={actionLoading || selectedCar.status === "APPROVED"}
                      onClick={() => void updateStatus(selectedCar.id, "approve")}
                      className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionLoading ? "Working..." : "Approve Car"}
                    </button>
                    <button
                      disabled={actionLoading || selectedCar.status === "REJECTED"}
                      onClick={() => void updateStatus(selectedCar.id, "reject")}
                      className="rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Reject Car
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

function DocCard({
  type,
  href,
  status,
  reviewNote,
}: {
  type: string;
  href: string;
  status?: string;
  reviewNote?: string | null;
}) {
  const resolvedHref = href ? `${BASE_URL.replace(/\/api\/?$/, "")}/${href.replace(/^\//, "")}` : "";

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <p className="text-sm font-medium text-white">{type}</p>
      <p className="mt-1 text-xs text-slate-400">Status: {status || "PENDING"}</p>
      {resolvedHref ? (
        <a href={resolvedHref} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-cyan-300 hover:text-cyan-200">
          Open document
        </a>
      ) : (
        <p className="mt-3 text-sm text-slate-500">No file uploaded</p>
      )}
      {reviewNote && <p className="mt-3 text-xs text-rose-300">Note: {reviewNote}</p>}
    </div>
  );
}