import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar({ title = "Dashboard", items = [], role = "default" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
      
    const roleColors = {
    admin: "bg-slate-700",        
    instructor: "bg-purple-700", 
    student: "bg-purple-700",     
    default: "bg-gray-700",      
  };

  const hoverColors = {
    admin: "hover:bg-slate-600",
    instructor: "hover:bg-purple-600",
    student: "hover:bg-purple-600",
    default: "hover:bg-gray-600",
  };

  const activeColors = {
    admin: "bg-slate-900",
    instructor: "bg-purple-900",
    student: "bg-purple-900",
    default: "bg-gray-900",
  };


  const bgColor = roleColors[role] || roleColors.default;
  const hoverColor = hoverColors[role] || hoverColors.default;
  const activeColor = activeColors[role] || activeColors.default;

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };



  return (
    <div className={`w-64 min-h-screen p-6 text-white ${bgColor}`}>
      <h2 className="mb-6 text-2xl font-bold"> {title} </h2>
      <nav className="flex flex-col space-y-2">
         {items.map((it) => (
          <button
            key={it.key}
            onClick={() => navigate(it.path)}
            className={`text-left p-3 rounded transition ${
              isActive(it.path) ? activeColor : hoverColor
            }`}
          >
            {it.label}
          </button>
        ))}
      
      </nav>
       <div className="mt-auto">
        <button
          onClick={handleLogout}
          className={`w-full text-left p-3 rounded transition mt-6 ${hoverColor}`}
        >
          Logout
        </button>
      </div>
    </div>
    
  );
}