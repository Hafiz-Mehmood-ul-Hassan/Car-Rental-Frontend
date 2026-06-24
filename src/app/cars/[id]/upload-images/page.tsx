"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Auth } from "../../../../lib/auth";
import { BASE_URL } from "../../../../services/api";
import { useRouter } from "next/navigation";

export default function UploadCarImagesPage() {
  const { id } = useParams();
  const router = useRouter();

  const [files, setFiles] = useState<FileList | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasImages, setHasImages] = useState(false);
  const [hasRegistration, setHasRegistration] = useState(false);
  const [hasInsurance, setHasInsurance] = useState(false);

  const handleFileChange = (e: any) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!files || files.length === 0) {
      setMessage("Please select images");
      return;
    }

    const token = Auth.getToken();

    if (!token) {
      setMessage("Please login first");
      return;
    }

    const formData = new FormData();

    // MULTIPLE FILES WITH SAME KEY
    Array.from(files).forEach((file) => {
      formData.append("images", file);
    });

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(`${BASE_URL}/cars/${id}/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${Auth.getToken()}` },
        body: formData,
      });

      const data = await res.json();

      console.log("UPLOAD RESPONSE:", data);

      if (res.ok) {
        setMessage("Images uploaded successfully 🎉");
        // refresh owner car status to update UI
        // await fetchCarStatus();
        // redirect to upload documents page after successful image upload
        setTimeout(() => router.push(`/cars/${id}/upload-documents`), 1000);
      } else {
        setMessage(data.message || "Upload failed");
      }
    } catch (error) {
      console.log(error);
      setMessage("Server error");
    }

    setLoading(false);
  };

  const fetchCarStatus = async () => {
    try {
      const res = await fetch(`${BASE_URL}/cars/owner`, { headers: { Authorization: `Bearer ${Auth.getToken()}` } });
      const data = await res.json();
      if (res.ok) {
        const car = (data.data || []).find((c: any) => String(c.id) === String(id));
        if (car) {
          setHasImages((car.images || []).length > 0);
          const types = (car.documents || []).map((d: any) => d.type);
          setHasRegistration(types.includes("REGISTRATION"));
          setHasInsurance(types.includes("INSURANCE"));
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => { fetchCarStatus(); }, [id]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-[500px] bg-black p-6 rounded-xl shadow space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">
          Upload Car Images
        </h1>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white p-2 rounded"
        >
          {loading ? "Uploading..." : "Upload Images"}
        </button>

        {message && (
          <p className="text-center text-sm mt-2">
            {message}
          </p>
        )}

        {/* Submit for review button */}
        <div className="mt-4">
          <button
            onClick={async () => {
              const token = Auth.getToken();
              if (!token) {
                setMessage("Please login first");
                return;
              }

              // prevent submit if requirements not met
              if (!hasImages) { setMessage('Please upload at least one image before submitting'); return; }
              if (!hasRegistration || !hasInsurance) { setMessage('Please upload REGISTRATION and INSURANCE documents before submitting'); return; }

              try {
                setLoading(true);
                const res = await fetch(`${BASE_URL}/cars/${id}/submit`, {
                  method: "PATCH",
                  headers: { Authorization: `Bearer ${token}` },
                });

                const data = await res.json();

                if (res.ok) {
                  setMessage("Car submitted for review 🎉");
                  setTimeout(() => router.push("/cars/owner"), 1000);
                } else {
                  setMessage(data.message || "Submit failed");
                }
              } catch (err) {
                console.log(err);
                setMessage("Server error");
              }

              setLoading(false);
            }}
            className="w-full bg-yellow-500 hover:bg-yellow-600 p-2 rounded mt-2"
          >
            Submit For Review
          </button>
        </div>
      </form>
    </div>
  );
}