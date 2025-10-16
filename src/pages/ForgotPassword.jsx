import React, { useState } from "react";
import { toast } from "react-toastify";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("✅ Password reset link sent to your email!");
        
      } else {
        
        toast.error(data.message || "❌ Something went wrong");
      }
    } catch (error) {
      console.error(error);
      setMessage("Server error, try again later");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="p-8 bg-white shadow-md rounded-xl w-96"
      >
        <h2 className="mb-6 text-2xl font-bold text-center text-purple-700">
          Forgot Password
        </h2>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full py-2 text-white transition duration-200 bg-purple-600 rounded hover:bg-purple-700"
        >
          Send Reset Link
        </button>

        {message && (
          <p className="mt-4 text-sm text-center text-gray-700">{message}</p>
        )}

        <p className="mt-4 text-sm text-center text-gray-600">
          Back to{" "}
          <a href="/login" className="text-purple-600 hover:underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
