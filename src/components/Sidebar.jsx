import React from "react";

export default function Sidebar({ items = [], active, onSelect }) {
  return (
    <div className="w-64 min-h-screen p-6 text-white bg-purple-700">
      <h2 className="mb-6 text-2xl font-bold">Instructor</h2>
      <nav className="flex flex-col space-y-2">
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => onSelect(it.key)}
            className={`text-left p-3 rounded ${active === it.key ? "bg-purple-900" : "hover:bg-purple-600"}`}
          >
            {it.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
