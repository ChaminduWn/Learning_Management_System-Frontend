import React, { useState } from "react";
import { toast } from "react-toastify";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Student", // default
  });

  const handleChange = (e) => {
      const { name, value } = e.target;

    const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;

    // Optional: disallow emojis in name & password
    if ((name === "name" || name === "password") && emojiRegex.test(value)) {
      return;
    }
  setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          maxLength="30"
          pattern="^^[A-Za-z0-9!@#$%^&*()_+]+$"
          title="Password should contain only letters, numbers, and symbols"
          className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          maxLength="20"
          className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          maxLength="15"
          // pattern="^[A-Za-z0-9!@#$%^&*()_+]+$"
          // title="Password should contain only letters, numbers, and symbols"          
          className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
          onChange={handleChange}
          required
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full p-2 mb-6 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="Student">Student</option>
          <option value="Instructor">Instructor</option>
        </select>

        <button
          type="submit"
          className="w-full py-2 text-white transition duration-200 bg-purple-600 rounded hover:bg-purple-700"
        >
          Register
        </button>

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
