"use client";

import { useEffect, useState } from "react";
import { authHeaders, BASE_URL } from "../../../services/api";

type Earning = {
  id: number;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  paidAmount: number;
  status: string;

  owner: {
    id: number;
    name: string;
    email: string;
  };

  booking: {
    id: number;
  };
};

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      const res = await fetch(`${BASE_URL}/earnings`, {
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

        <table className="w-full">

          <thead className="bg-slate-900">

            <tr>
              <th className="p-4 text-left">Owner</th>
              <th className="p-4 text-left">Booking</th>
              <th className="p-4 text-left">Net</th>
              <th className="p-4 text-left">Paid</th>
              <th className="p-4 text-left">Remaining</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Action</th>
            </tr>

          </thead>

          <tbody>

            {earnings.map((earning) => {

              const remaining =
                earning.netAmount - earning.paidAmount;

              return (
                <tr
                  key={earning.id}
                  className="border-t border-slate-800"
                >
                  <td className="p-4">
                    {earning.owner.name}
                  </td>

                  <td className="p-4">
                    #{earning.booking.id}
                  </td>

                  <td className="p-4">
                    PKR {earning.netAmount}
                  </td>

                  <td className="p-4">
                    PKR {earning.paidAmount}
                  </td>

                  <td className="p-4">
                    PKR {remaining}
                  </td>

                  <td className="p-4">
                    {earning.status}
                  </td>

                  <td className="p-4">

                    {remaining > 0 ? (
                      <button
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

    </div>
  );
}