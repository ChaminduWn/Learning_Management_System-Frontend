import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { FaArrowLeft, FaEnvelope } from "react-icons/fa";

export default function Feedback() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user?.token && { Authorization: `Bearer ${user.token}` }),
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to send message");

      toast.success("Message sent successfully!");
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        subject: "",
        message: "",
      });
    } catch (err) {
      toast.error(err.message || "Failed to send message");
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
            <p className="text-gray-600">Reach out to us with any questions or feedback</p>
          </div>
          <button
            onClick={() => navigate("/contact")}
            className="flex items-center gap-2 px-4 py-2 font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FaArrowLeft className="text-gray-600" />
            Back
          </button>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <FaEnvelope className="text-xl text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Send Us a Message</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {["name", "email", "subject", "message"].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 capitalize">
                  {field}
                </label>
                {field === "message" ? (
                  <textarea
                    name={field}
                    rows="5"
                    value={formData[field]}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your message"
                  />
                ) : (
                  <input
                    type={field === "email" ? "email" : "text"}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Your ${field}`}
                  />
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className={`w-full px-6 py-3 font-medium text-white rounded-lg transition-colors ${
                loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        <div className="max-w-4xl p-6 mx-auto mt-12 text-center text-gray-700 rounded-lg bg-gray-50">
          support@yourlms.com | (555) 123-4567 | Response: within 24 hrs
        </div>
      </div>
    </div>
  );
}