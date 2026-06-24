"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Auth } from "../../../../lib/auth";
import { authHeaders, BASE_URL } from "../../../../services/api";

export default function OwnerCarDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCar();
  }, [id]);

  const fetchCar = async () => {
    setLoading(true);
    try {
      const token = Auth.getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(`${BASE_URL}/cars/owner`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) {
        const found = (data.data || []).find((c: any) => String(c.id) === String(id));
        setCar(found || null);
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const submitForReview = async () => {
    if (!car) return;
    setMessage("");
    setActionLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/cars/${id}/submit`, {
        method: 'PATCH',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Submitted for review');
        setTimeout(() => fetchCar(), 800);
      } else {
        setMessage(data.message || 'Submit failed');
      }
    } catch (err) {
      console.log(err);
      setMessage('Server error');
    }
    setActionLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">Loading...</div>
  );

  if (!car) return (
    <div className="min-h-screen p-6">Car not found or you do not own this car.</div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{car.title}</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="bg-zinc-900 p-4 rounded mb-4">
            <h3 className="font-semibold">Details</h3>
            <p className="text-sm">{car.brand} • {car.model} • {car.year}</p>
            <p className="text-sm">{car.location}</p>
            <p className="text-sm mt-2">{car.description}</p>
          </div>

          <div className="bg-zinc-900 p-4 rounded">
            <h3 className="font-semibold">Images</h3>
            {car.images && car.images.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {car.images.map((img: any) => (
                  <img key={img.id} src={img.imageUrl} alt="car" className="w-full h-28 object-cover rounded" />
                ))}
              </div>
            ) : (
              <p className="text-sm mt-2">No images uploaded</p>
            )}

            <div className="mt-4 flex gap-2">
              <button onClick={() => router.push(`/cars/${id}/upload-images`)} className="bg-blue-500 px-3 py-1 rounded text-white">Upload Images</button>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-zinc-900 p-4 rounded mb-4">
            <h3 className="font-semibold">Documents</h3>
            {car.documents && car.documents.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {car.documents.map((d: any) => (
                  <li key={d.id} className="flex items-center justify-between bg-black p-2 rounded">
                    <div>
                      <div className="text-sm font-medium">{d.type}</div>
                      <div className="text-xs text-zinc-400">{d.fileName || d.fileUrl}</div>
                    </div>
                    <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-blue-400 underline text-sm">View</a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm mt-2">No documents uploaded</p>
            )}

            <div className="mt-4 flex gap-2">
              <button onClick={() => router.push(`/cars/${id}/upload-documents`)} className="bg-black px-3 py-1 rounded text-white">Upload Document</button>
            </div>
          </div>

          <div className="bg-zinc-900 p-4 rounded">
            <h3 className="font-semibold">Status</h3>
            <p className="mt-2 font-medium">{car.status}</p>
            <p className="text-sm text-zinc-400 mt-1">{car.reviewNote || '-'}</p>

            <div className="mt-4 flex flex-col gap-2">
              <button onClick={submitForReview} disabled={actionLoading} className="bg-yellow-500 px-3 py-2 rounded">{actionLoading ? '...' : 'Submit For Review'}</button>
              <button onClick={() => router.push('/cars/owner')} className="bg-zinc-700 px-3 py-2 rounded">Back to My Cars</button>
            </div>

            {message && <p className="mt-3 text-sm">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
