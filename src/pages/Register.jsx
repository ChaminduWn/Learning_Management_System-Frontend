import React, { useState } from "react";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Student",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;

    // Disallow emojis in name & password fields
    if ((name === "name" || name === "password" || name === "confirmPassword") && emojiRegex.test(value)) {
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("❌ Passwords do not match!");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Registration successful! You can now log in.");
        window.location.href = "/login";
      } else {
        toast.error(data.message || "❌ Registration failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("⚠️ Something went wrong!");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="p-8 bg-white shadow-md rounded-xl w-96"
      >
        <h2 className="mb-6 text-2xl font-bold text-center text-purple-700">
          Create Account
        </h2>

        {/* Full Name */}
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          maxLength="30"
          className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
          onChange={handleChange}
          required
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          maxLength="40"
          className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
          onChange={handleChange}
          required
        />

        {/* Password Field */}
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            maxLength="15"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-500 hover:text-purple-600"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Confirm Password Field */}
        <div className="relative mb-6">
          <input
            type={showConfirm ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            maxLength="15"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-2.5 text-gray-500 hover:text-purple-600"
          >
            {showConfirm ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Role Selection */}
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full p-2 mb-6 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="Student">Student</option>
          <option value="Instructor">Instructor</option>
        </select>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2 text-white transition duration-200 bg-purple-600 rounded hover:bg-purple-700"
        >
          Register
        </button>

        {/* Login Redirect */}
        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-purple-600 underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
