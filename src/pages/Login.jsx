import React, { useState,useContext } from 'react'
import { AuthContext } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const res = await fetch("http://localhost:5000/api/auth/login",{
                method: "POST",
                headers: { "Content-Type" : "application/json"},
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if(res.ok){
                login(data);
                alert("Login successful");
            } else {
                alert(data.message || "Login failed");
            }

        } catch (error) {
            console.error(error);
            alert("Somthing went Wrong")
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-purple-700">
          LMS Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full border border-gray-300 p-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border border-gray-300 p-2 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-purple-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
        type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition duration-200"
        >
          Login 
        </button>

        <p className = "test-sm text-center mt-4 text-gray-600">
            DOn't have an account ? {""}
            <a href="/register" className="text-purple-600 hover:underline">
            Register
            </a>
         </p>

      </form>

    </div>

    );

}