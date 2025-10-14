import React, { useState,useContext } from 'react'
import { AuthContext } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const res = await fetch(auth/login,{
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
            console.error(err);
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
          type="password"
          placeholder="Password"
          className="w-full border border-gray-300 p-2 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-purple-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button> </button>

        </form>

        </div>

    );

}