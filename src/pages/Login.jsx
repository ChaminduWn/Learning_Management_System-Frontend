import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  //   const handlePasswordChange = (e) => {
  //   const value = e.target.value;
  //   const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;

  //   if (emojiRegex.test(value)) return;

  //   setPassword(value);
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Login response:", data); // debug

      if (res.ok) {
        login(data); // save user to context/localStorage
        toast.success("✅ Login successful!");

        const role = data.role; // access role directly
        if (role === "Admin") navigate("/admin/dashboard");
        else if (role === "Instructor") navigate("/instructor/dashboard");
        else navigate("/student/dashboard");
      } else {
        toast.error(data.message || "❌ Login failed");
      }
    } catch (error) {
      console.error(error);
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
          LMS Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            maxLength="15"
            // pattern="^[A-Za-z0-9!@#$%^&*()_+]+$"
            // title="Password should contain only letters, numbers, and symbols"
            className="w-full p-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={password}
            // onChange={handlePasswordChange}
            onChange={(e) => setPassword(e.target.value)}
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

        <div className="mb-4 text-right">
          <a
            href="/forgot-password"
            className="text-sm text-purple-600 hover:underline"
          >
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          className="w-full py-2 text-white transition duration-200 bg-purple-600 rounded hover:bg-purple-700"
        >
          Login
        </button>

        <p className="mt-4 text-sm text-center text-gray-600">
          Don’t have an account?{" "}
          <a href="/register" className="text-purple-600 hover:underline">
            Register
          </a>
        </p>
      </form>
    </div>
  );
}
