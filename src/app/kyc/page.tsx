"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Auth } from "../../lib/auth";
import { BASE_URL } from "../../services/api";

type KycStatus = "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED" | null;

type KycData = {
  id?: number;
  fullName?: string;
  cnic?: string;
  address?: string;
  phone?: string;
  cnicFront?: string;
  cnicBack?: string;
  selfie?: string;
  status?: KycStatus;
  reviewNote?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type FormState = {
  fullName: string;
  cnic: string;
  address: string;
  phone: string;
};

type FileState = {
  cnicFront: File | null;
  cnicBack: File | null;
  selfie: File | null;
};

type ErrorState = Partial<Record<keyof FormState | keyof FileState, string>>;

export default function KycPage() {
  const [form, setForm] = useState<FormState>({
    fullName: "",
    cnic: "",
    address: "",
    phone: "",
  });

  const [files, setFiles] = useState<FileState>({
    cnicFront: null,
    cnicBack: null,
    selfie: null,
  });

  const [errors, setErrors] = useState<ErrorState>({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [kycStatus, setKycStatus] = useState<KycStatus>(null);
  const [existingKyc, setExistingKyc] = useState<KycData | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = Auth.getToken();
        if (!token) return;

        const res = await fetch(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const body = await res.json();
        const me = body?.data || {};
        const status = (me.kycStatus || me.KYCStatus || null) as KycStatus;

        setKycStatus(status ? status.toString().toUpperCase() as KycStatus : null);

        if (me.kyc) {
          setExistingKyc(me.kyc);
          setForm({
            fullName: me.kyc.fullName || "",
            cnic: me.kyc.cnic || "",
            address: me.kyc.address || "",
            phone: me.kyc.phone || "",
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setPageLoading(false);
      }
    };

    void load();
  }, []);

  const validateForm = () => {
    const nextErrors: ErrorState = {};

    if (form.fullName.trim().length < 3) nextErrors.fullName = "Enter your full legal name.";
    if (!/^\d{13}$/.test(form.cnic)) nextErrors.cnic = "CNIC must be exactly 13 digits.";
    if (form.address.trim().length < 5) nextErrors.address = "Please enter a complete address.";
    if (!/^\d{11}$/.test(form.phone)) nextErrors.phone = "Phone number must be 11 digits.";
    if (!files.cnicFront) nextErrors.cnicFront = "Upload the front side of CNIC.";
    if (!files.cnicBack) nextErrors.cnicBack = "Upload the back side of CNIC.";
    if (!files.selfie) nextErrors.selfie = "Upload a clear selfie.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const updateField = (name: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const updateFile = (name: keyof FileState, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFiles((prev) => ({ ...prev, [name]: file }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (!validateForm()) return;

    const token = Auth.getToken();
    if (!token) {
      setMessage("Please login first.");
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append("fullName", form.fullName);
      payload.append("cnic", form.cnic);
      payload.append("address", form.address);
      payload.append("phone", form.phone);

      if (files.cnicFront) payload.append("cnicFront", files.cnicFront);
      if (files.cnicBack) payload.append("cnicBack", files.cnicBack);
      if (files.selfie) payload.append("selfie", files.selfie);

      const res = await fetch(`${BASE_URL}/kyc`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });

      const body = await res.json();

      if (res.ok) {
        setMessage("KYC submitted successfully. Your request is now under review.");
        setKycStatus("PENDING");
        setExistingKyc({
          fullName: form.fullName,
          cnic: form.cnic,
          address: form.address,
          phone: form.phone,
          cnicFront: files.cnicFront?.name,
          cnicBack: files.cnicBack?.name,
          selfie: files.selfie?.name,
          status: "PENDING",
        });
      } else {
        setMessage(body.message || "KYC submission failed.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Server error while submitting KYC.");
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = useMemo(() => {
    if (!kycStatus) return "Not submitted";
    if (kycStatus === "APPROVED") return "Approved";
    if (kycStatus === "PENDING") return "Pending review";
    if (kycStatus === "REJECTED") return "Rejected";
    return "Not submitted";
  }, [kycStatus]);

  const statusStyle = useMemo(() => {
    if (kycStatus === "APPROVED") return "border-emerald-400/30 bg-emerald-400/10 text-emerald-100";
    if (kycStatus === "PENDING") return "border-amber-400/30 bg-amber-400/10 text-amber-100";
    if (kycStatus === "REJECTED") return "border-rose-400/30 bg-rose-400/10 text-rose-100";
    return "border-sky-400/30 bg-sky-400/10 text-sky-100";
  }, [kycStatus]);

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_24%),linear-gradient(180deg,_#050816_0%,_#0a1020_100%)] px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-200 backdrop-blur-xl">
            Loading KYC page...
          </div>
        </div>
      </div>
    );
  }

  if (kycStatus === "APPROVED" || kycStatus === "PENDING") {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(56,189,248,0.12),_transparent_24%),linear-gradient(180deg,_#050816_0%,_#0a1020_100%)] px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Link href="/dashboard" className="text-sm text-cyan-300 transition hover:text-cyan-200">
            ← Back to dashboard
          </Link>

          <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Identity verification</p>
                <h1 className="mt-2 text-3xl font-bold">KYC {statusLabel}</h1>
                <p className="mt-3 max-w-2xl text-slate-300">
                  {kycStatus === "APPROVED"
                    ? "Your identity has been verified. You can continue booking and owner workflows without re-submitting."
                    : "Your KYC is under review. We are checking your submitted documents and will update your account status soon."}
                </p>
              </div>

              <span className={`inline-flex w-fit rounded-full border px-4 py-2 text-sm font-medium ${statusStyle}`}>
                {statusLabel}
              </span>
            </div>

            {existingKyc && (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <InfoBox label="Full Name" value={existingKyc.fullName || form.fullName || "-"} />
                <InfoBox label="CNIC" value={existingKyc.cnic || form.cnic || "-"} />
                <InfoBox label="Phone" value={existingKyc.phone || form.phone || "-"} />
                <InfoBox label="Address" value={existingKyc.address || form.address || "-"} />
                <InfoBox label="Review Note" value={existingKyc.reviewNote || "No note added yet"} />
                <InfoBox label="Submitted At" value={existingKyc.createdAt ? new Date(existingKyc.createdAt).toLocaleString() : "-"} />
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200">
                Go to dashboard
              </Link>
              <Link href="/profile" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Open profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selectedDocs = [
    { name: "CNIC Front", file: files.cnicFront },
    { name: "CNIC Back", file: files.cnicBack },
    { name: "Selfie", file: files.selfie },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_24%),linear-gradient(180deg,_#050816_0%,_#0a1020_100%)] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/dashboard" className="text-sm text-cyan-300 transition hover:text-cyan-200">
          ← Back to dashboard
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Identity verification</p>
                <h1 className="mt-2 text-3xl font-bold">Complete your KYC</h1>
                <p className="mt-3 max-w-2xl text-slate-300">
                  Submit your CNIC, selfie, and address once. This unlocks bookings, payments, and owner features.
                </p>
              </div>
              <span className={`inline-flex w-fit rounded-full border px-4 py-2 text-sm font-medium ${statusStyle}`}>
                {statusLabel}
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <StepCard number="1" title="Enter details" description="Your name, CNIC, phone, and address." />
              <StepCard number="2" title="Upload documents" description="CNIC front, CNIC back, and a clear selfie." />
              <StepCard number="3" title="Submit once" description="Our team reviews your request and updates your status." />
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <Field label="Full Name" hint="Use your legal name as shown on CNIC." error={errors.fullName}>
                <input
                  name="fullName"
                  value={form.fullName}
                  placeholder="Ali Khan"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-cyan-400/40"
                  onChange={(e) => updateField("fullName", e.target.value)}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="CNIC" hint="Exactly 13 digits, numbers only." error={errors.cnic}>
                  <input
                    name="cnic"
                    value={form.cnic}
                    maxLength={13}
                    placeholder="1234512345671"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-cyan-400/40"
                    onChange={(e) => updateField("cnic", e.target.value.replace(/\D/g, ""))}
                  />
                </Field>

                <Field label="Phone" hint="11 digits, numbers only." error={errors.phone}>
                  <input
                    name="phone"
                    value={form.phone}
                    maxLength={11}
                    placeholder="03001234567"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-cyan-400/40"
                    onChange={(e) => updateField("phone", e.target.value.replace(/\D/g, ""))}
                  />
                </Field>
              </div>

              <Field label="Address" hint="Use your current residential address." error={errors.address}>
                <textarea
                  name="address"
                  value={form.address}
                  rows={4}
                  placeholder="House no, street, city"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none transition focus:border-cyan-400/40"
                  onChange={(e) => updateField("address", e.target.value)}
                />
              </Field>

              <div className="grid gap-4 lg:grid-cols-3">
                <UploadField
                  label="CNIC Front"
                  hint="Front side image"
                  error={errors.cnicFront}
                  file={files.cnicFront}
                  onChange={(e) => updateFile("cnicFront", e)}
                />
                <UploadField
                  label="CNIC Back"
                  hint="Back side image"
                  error={errors.cnicBack}
                  file={files.cnicBack}
                  onChange={(e) => updateFile("cnicBack", e)}
                />
                <UploadField
                  label="Selfie"
                  hint="Clear face photo"
                  error={errors.selfie}
                  file={files.selfie}
                  onChange={(e) => updateFile("selfie", e)}
                />
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
                <p className="text-sm font-medium text-slate-300">Selected files</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {selectedDocs.map((doc) => (
                    <div key={doc.name} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm">
                      <p className="text-slate-400">{doc.name}</p>
                      <p className="mt-1 break-words text-white">{doc.file?.name || "Not selected"}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Submitting KYC..." : "Submit KYC for review"}
              </button>

              {message && <p className="text-sm text-cyan-200">{message}</p>}
            </form>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Why KYC matters</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Unlock the core app flow</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                KYC is the base for bookings, payments, and owner operations. Completing it once gives you access to the full platform.
              </p>

              <div className="mt-6 space-y-3 text-sm text-slate-300">
                <TipItem title="Fast review" text="Clear images and accurate details speed up approval." />
                <TipItem title="One-time submission" text="You only need to submit once unless your request is rejected." />
                <TipItem title="Secure handling" text="Your documents are stored for review and account verification only." />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Tips before you submit</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li>• Make sure CNIC photos are well-lit and readable.</li>
                <li>• Use the same full name across your profile and KYC form.</li>
                <li>• Take a selfie without sunglasses or filters.</li>
                <li>• Double check the phone number before submitting.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-3">
        <label className="text-sm font-medium text-white">{label}</label>
        <span className="text-xs text-slate-400">{hint}</span>
      </div>
      {children}
      {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
    </div>
  );
}

function UploadField({
  label,
  hint,
  error,
  file,
  onChange,
}: {
  label: string;
  hint: string;
  error?: string;
  file: File | null;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const preview = file ? URL.createObjectURL(file) : null;

  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="mt-1 text-xs text-slate-400">{hint}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300">
          Required
        </span>
      </div>

      <input
        type="file"
        className="mt-4 w-full text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-slate-200"
        onChange={onChange}
      />

      {preview && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={`${label} preview`} className="h-40 w-full object-cover" />
        </div>
      )}

      {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400 text-sm font-bold text-slate-950">{number}</span>
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}

function TipItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <p className="font-medium text-white">{title}</p>
      <p className="mt-1 text-slate-300">{text}</p>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 break-words font-medium text-white">{value}</p>
    </div>
  );
}