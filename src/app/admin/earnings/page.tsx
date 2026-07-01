"use client";

import { useEffect, useState } from "react";
import { authHeaders, ADMIN_BASE } from "../../../services/api";

type Earning = {
  id: number;
  totalEarning: number;
  paidAmount: number;
  remainingAmount: number;

  owner: {
    id: number;
    name: string;
    email: string;
  };
};

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [selectedEarning, setSelectedEarning] = useState<Earning | null>(null);

  const [amount, setAmount] = useState(0);

  const [method, setMethod] = useState("BANK_TRANSFER");

  const [referenceNo, setReferenceNo] = useState("");

  const [notes, setNotes] = useState("");

  const [processing, setProcessing] = useState(false);

  const [receiptFile, setReceiptFile] = useState<File | null>(null);


  useEffect(() => {
    loadEarnings();
  }, []);

  const openPayoutModal = (earning: Earning) => {
    setSelectedEarning(earning);
    setAmount(earning.remainingAmount);
    setMethod("BANK_TRANSFER");
    setReferenceNo("");
    setNotes("");
    setShowModal(true);
  };

  const loadEarnings = async () => {
    try {
      const res = await fetch(`${ADMIN_BASE}/earnings`, {
        headers: authHeaders(),
      });

      const data = await res.json();

      if (res.ok) {
        setEarnings(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

const handleReceipt = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  if (e.target.files && e.target.files.length > 0) {
    setReceiptFile(e.target.files[0]);
  }
};


  const processPayout = async () => {
  if (!selectedEarning) return;

  if (amount <= 0) {
    alert("Invalid amount");
    return;
  }

  if (amount > selectedEarning.remainingAmount) {
    alert("Amount cannot exceed remaining balance");
    return;
  }

  try {
    setProcessing(true);

    const res = await fetch(`${ADMIN_BASE}/payouts`, {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ownerId: selectedEarning.owner.id,
        amount,
        method,
        referenceNo,
        notes,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert("Payout processed successfully");

    setShowModal(false);

    loadEarnings();

  } catch (err) {
    console.error(err);
  } finally {
    setProcessing(false);
  }
};


  if (loading) {
    return (
      <div className="p-8 text-white">
        Loading earnings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">

      <h1 className="mb-8 text-3xl font-bold">
        Owner Earnings
      </h1>

      <div className="overflow-x-auto rounded-xl border border-slate-700">

        <table className="w-full border-collapse text-center text-sm">

          <thead className="bg-slate-900">

            <tr>
              <th>Owner</th>
              <th>Total Earnings</th>
              <th>Paid</th>
              <th>Remaining</th>
              <th>Action</th>
            </tr>

          </thead>

          <tbody>

            {earnings.map((earning) => {

              const remaining = earning.remainingAmount;

              return (
                <tr
                  key={earning.id}
                  className="border-t border-slate-800 bg-slate-950 hover:bg-slate-900"
                >
                  <td className="p-4">
                    {earning.owner.name}
                  </td>

                  <td className="p-4">
                    PKR {earning.totalEarning}
                  </td>

                  <td className="p-4">
                    PKR {earning.paidAmount}
                  </td>

                  <td className="p-4">
                    PKR {remaining}
                    
                  </td>
                  

                  <td className="p-4">

                    {remaining > 0 ? (
                      <button
                          onClick={() => openPayoutModal(earning)}
                          className="rounded bg-green-600 px-4 py-2 hover:bg-green-700"
                        >
                          Pay
                        </button>
                    ) : (
                      <span className="text-gray-500">
                        Paid
                      </span>
                    )}

                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>
            {showModal && selectedEarning && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">

    <div className="w-full max-w-lg rounded-xl bg-slate-900 p-6">

      <h2 className="mb-6 text-2xl font-bold">
        Process Payout
      </h2>

      <div className="space-y-4">

        <div>

          <label className="block mb-1">
            Owner
          </label>

          <input
            disabled
            value={selectedEarning.owner.name}
            className="w-full rounded bg-slate-800 p-3"
          />

        </div>

        <div>

          <label className="block mb-1">
            Remaining Balance
          </label>

          <input
            disabled
            value={selectedEarning.remainingAmount}
            className="w-full rounded bg-slate-800 p-3"
          />

        </div>

        <div>

          <label className="block mb-1">
            Amount
          </label>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full rounded bg-slate-800 p-3"
          />

        </div>

        <div>

          <label className="block mb-1">
            Method
          </label>

          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full rounded bg-slate-800 p-3"
          >
            <option value="BANK_TRANSFER">
              Bank Transfer
            </option>

            <option value="JAZZCASH">
              JazzCash
            </option>

            <option value="EASYPAISA">
              EasyPaisa
            </option>

            <option value="CASH">
              Cash
            </option>

          </select>

        </div>

        <div>

          <label className="block mb-1">
            Reference Number
          </label>

          <input
            value={referenceNo}
            onChange={(e) => setReferenceNo(e.target.value)}
            className="w-full rounded bg-slate-800 p-3"
          />
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleReceipt}
          />
        </div>

        <div>

          <label className="block mb-1">
            Notes
          </label>

          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded bg-slate-800 p-3"
          />

        </div>

      </div>

      <div className="mt-6 flex justify-end gap-3">

        <button
          onClick={() => setShowModal(false)}
          className="rounded bg-gray-700 px-5 py-2"
        >
          Cancel
        </button>

        <button
          onClick={processPayout}
          disabled={processing}
          className="rounded bg-green-600 px-5 py-2 hover:bg-green-700"
        >
          {processing ? "Processing..." : "Process Payout"}
        </button>

      </div>

    </div>

  </div>
)}
    </div>
  );
}