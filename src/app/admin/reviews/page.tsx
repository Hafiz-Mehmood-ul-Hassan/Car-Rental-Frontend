"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ADMIN_BASE, authHeaders } from "../../../services/api";

type Review = {
  id: number;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;

  user: {
    id: number;
    name: string;
    email: string;
  };

  car: {
    id: number;
    title: string;
    brand: string;
    model: string;
  };
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${ADMIN_BASE}/reviews`, {
        headers: authHeaders(),
      });

      const body = await res.json();

      setReviews(body.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchReviews();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${ADMIN_BASE}/reviews/${id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        await fetchReviews();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteReview = async (id: number) => {
    if (!confirm("Delete this review?")) return;

    try {
      const res = await fetch(`${ADMIN_BASE}/reviews/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (res.ok) {
        await fetchReviews();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_26%),linear-gradient(180deg,_#050816_0%,_#0b1020_100%)] p-6 text-white">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
              Admin
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Review Management
            </h1>

            <p className="mt-2 text-slate-300">
              View, moderate and delete user reviews.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-full bg-cyan-500 px-5 py-3 font-semibold text-slate-950"
          >
            Dashboard
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">

          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead className="bg-white/5 text-slate-400">

                <tr>
                  <th className="px-5 py-4 text-left">User</th>
                  <th className="px-5 py-4 text-left">Car</th>
                  <th className="px-5 py-4 text-left">Rating</th>
                  <th className="px-5 py-4 text-left">Comment</th>
                  <th className="px-5 py-4 text-left">Status</th>
                  <th className="px-5 py-4 text-left">Date</th>
                  <th className="px-5 py-4 text-left">Actions</th>
                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>
                    <td colSpan={7} className="p-8">
                      Loading...
                    </td>
                  </tr>

                ) : reviews.length === 0 ? (

                  <tr>
                    <td colSpan={7} className="p-8">
                      No Reviews Found
                    </td>
                  </tr>

                ) : (

                  reviews.map((review) => (

                    <tr
                      key={review.id}
                      className="border-t border-white/10 hover:bg-white/5"
                    >
                      <td className="px-5 py-4">
                        <div>{review.user.name}</div>
                        <div className="text-xs text-slate-400">
                          {review.user.email}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {review.car.title}
                        <div className="text-xs text-slate-400">
                          {review.car.brand} {review.car.model}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        ⭐ {review.rating}/5
                      </td>

                      <td className="px-5 py-4 max-w-sm">
                        {review.comment}
                      </td>

                      <td className="px-5 py-4">

                        <select
                          value={review.status}
                          onChange={(e) =>
                            void updateStatus(review.id, e.target.value)
                          }
                          className="rounded-xl bg-slate-900 p-2"
                        >
                          <option value="VISIBLE">
                            Visible
                          </option>

                          <option value="HIDDEN">
                            Hidden
                          </option>

                        </select>

                      </td>

                      <td className="px-5 py-4">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4">

                        <button
                          onClick={() => void deleteReview(review.id)}
                          className="rounded-full bg-red-500 px-4 py-2 text-sm"
                        >
                          Delete
                        </button>

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