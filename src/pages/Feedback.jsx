import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { FaArrowLeft, FaEnvelope } from "react-icons/fa";

export default function Feedback() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="max-w-md p-8 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Login Required</h2>
          <p className="mb-6 text-gray-600">
            You must be logged in to send a message.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      toast.success("Message sent!");
      setForm({ ...form, subject: "", message: "" });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-800">Request Form</h1>
            <p className="text-gray-600">Reach out to us</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 border rounded hover:bg-gray-100"
          >
            <FaArrowLeft /> Back
          </button>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center gap-2 mb-4">
            <FaEnvelope className="text-xl text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Send a Message</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {["name", "email", "subject", "message"].map((f) => (
              <div key={f}>
                <label className="block text-sm font-medium text-gray-700 capitalize">
                  {f}
                </label>
                {f === "message" ? (
                  <textarea
                    name={f}
                    rows={5}
                    value={form[f]}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 mt-1 border rounded focus:border-blue-500 focus:outline-none"
                    placeholder="Your message"
                  />
                ) : (
                  <input
                    type={f === "email" ? "email" : "text"}
                    name={f}
                    value={form[f]}
                    onChange={handleChange}
                    required
    readOnly={f === "name" || f === "email"}
                    className="w-full px-4 py-2 mt-1 border rounded focus:border-blue-500 focus:outline-none"
                    placeholder={`Your ${f}`}
                  />
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded py-3 font-medium text-white transition ${
                loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Sending…" : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}