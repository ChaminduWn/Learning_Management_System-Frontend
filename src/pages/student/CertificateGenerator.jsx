import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";

export default function CertificateGenerator() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState(null);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${id}/certificate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error((await res.json()).message);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setCertificateUrl(url);
      toast.success("Certificate generated! You can view and download it.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md p-6 mx-auto">
      <h2 className="mb-4 text-2xl font-bold">Generate Certificate</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name for the certificate"
        className="w-full p-3 mb-4 border rounded"
      />
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Certificate"}
      </button>

      {certificateUrl && (
        <div className="mt-6">
          <h3 className="mb-2 text-lg font-semibold">Your Certificate</h3>
          <iframe src={certificateUrl} width="100%" height="400" title="Certificate"></iframe>
          <a
            href={certificateUrl}
            download="certificate.pdf"
            className="block px-4 py-2 mt-4 text-center text-white bg-green-600 rounded hover:bg-green-700"
          >
            Download PDF
          </a>
        </div>
      )}
    </div>
  );
}