import React, { useState } from "react";
import { toast } from "react-toastify";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setSent(true);
        toast.success("Password reset link sent to your email!");
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      toast.error("Server error, try again later");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="p-8 bg-white border shadow-xl rounded-3xl backdrop-blur-sm border-white/20">
          <div className="flex justify-center mb-6">
            {/* <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl">
              <Mail className="w-8 h-8 text-indigo-600" />
            </div> */}
          </div>
          <h2 className="mb-6 text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Forgot Password ?
          </h2>
          <p className="mb-6 text-center text-gray-600">
            Enter your email and we’ll send you a link to reset your password.
          </p>

          {sent ? (
            <div className="p-6 text-center bg-emerald-50 rounded-2xl">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-600" />
              <p className="font-medium text-emerald-700">Check your email!</p>
              <p className="text-sm text-emerald-600">We’ve sent a password reset link to <strong>{email}</strong></p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Mail className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-3 pl-10 pr-4 text-sm transition-all border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center w-full gap-2 py-3 font-medium text-white transition-all shadow-md bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:scale-105"
              >
                Send Reset Link <ArrowRight size={18} />
              </button>
            </form>
          )}

          <p className="mt-6 text-sm text-center text-gray-600">
            Back to{" "}
            <a href="/login" className="font-medium text-indigo-600 hover:underline">
              Login
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}