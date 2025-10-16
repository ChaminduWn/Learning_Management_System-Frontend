import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveSection = () => {
    if (location.pathname.includes("/users")) return "users";
    if (location.pathname.includes("/course")) return "course";
    return "users"; // default
  };

  const [activeSection, setActiveSection] = useState(getActiveSection());

  const links = [
    { name: "Users", section: "users" },
    { name: "Course Approval", section: "course" },
  ];

  const handleNavClick = (section) => {
    setActiveSection(section);
    navigate(`/admin/dashboard/${section}`);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="flex flex-col w-64 bg-white shadow-md">
        <div className="p-4 text-lg font-bold text-purple-700 border-b">
          Admin Panel
        </div>
        <nav className="flex flex-col">
          {links.map((link) => (
            <button
              key={link.section}
              onClick={() => handleNavClick(link.section)}
              className={`p-4 text-left ${
                activeSection === link.section
                  ? "bg-purple-100 text-purple-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {link.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-auto">
        <Outlet /> {/* 👈 this will render nested routes */}
      </div>
    </div>
  );
}
