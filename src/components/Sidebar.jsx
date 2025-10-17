import React from "react";
import { useLocation } from "react-router-dom";

export default function Sidebar({ title = "Dashboard", items = [], active, onSelect, role = "default"}) {
    const location = useLocation();

    const roleColors = {
    admin: "bg-blue-700",        // Blue for admin
    instructor: "bg-purple-700", // Purple for instructor
    student: "bg-green-700",     // Green for student
    default: "bg-gray-700",      // Fallback color
  };

  const hoverColors = {
    admin: "hover:bg-blue-600",
    instructor: "hover:bg-purple-600",
    student: "hover:bg-green-600",
    default: "hover:bg-gray-600",
  };

  const activeColors = {
    admin: "bg-blue-900",
    instructor: "bg-purple-900",
    student: "bg-green-900",
    default: "bg-gray-900",
  };


  const bgColor = roleColors[role] || roleColors.default;
  const hoverColor = hoverColors[role] || hoverColors.default;
  const activeColor = activeColors[role] || activeColors.default;


  return (
    <div className={`w-64 min-h-screen p-6 text-white ${bgColor}`}>
      <h2 className="mb-6 text-2xl font-bold"> {title} </h2>
      <nav className="flex flex-col space-y-2">
        {items.map((it) => {
            const isActive = location.pathname === it.path;
          return (
        
         <button
              key={it.key}
              onClick={() => onSelect(it)}
              className={`text-left p-3 rounded transition ${
                isActive ? activeColor : hoverColor
              }`}
            >
              {it.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}