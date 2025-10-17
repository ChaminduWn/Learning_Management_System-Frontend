import React from "react";
import { useLocation } from "react-router-dom";

export default function Sidebar({ title = "Dashboard", items = [], active, onSelect }) {
    const location = useLocation();

  return (
    <div className="w-64 min-h-screen p-6 text-white bg-purple-700">
      <h2 className="mb-6 text-2xl font-bold"> {title} </h2>
      <nav className="flex flex-col space-y-2">
        {items.map((it) => {
            const isActive = location.pathname === it.path;
          return (
        
         <button
              key={it.key}
              onClick={() => onSelect(it)}
              className={`text-left p-3 rounded transition ${
                isActive ? "bg-purple-900" : "hover:bg-purple-600"
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