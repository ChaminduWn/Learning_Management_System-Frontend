import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        
        toast.success("✅ Password reset successful!");
        navigate("/login");
      } else {        
        toast.error(data.message || "❌ Password reset failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("⚠️ Server error");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="p-8 bg-white shadow-md rounded-xl w-96"
      >
        <h2 className="mb-6 text-2xl font-bold text-center text-purple-700">
          Reset Password
        </h2>

        <input
          type="password"
          placeholder="New Password"
          className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full p-2 mb-6 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full py-2 text-white transition duration-200 bg-purple-600 rounded hover:bg-purple-700"
        >
          Reset Password
        </button>

        {message && (
          <p className="mt-4 text-sm text-center text-gray-700">{message}</p>
        )}
      </form>
    </div>
  );
}
