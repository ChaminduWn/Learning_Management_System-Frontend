import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminUserManagement from "../components/AdminUserManagement";

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  

  const getActiveSection = () => {
    if (location.pathname.includes('/users')) return 'users';
    return 'users'; // default
  };
  
  const [activeSection, setActiveSection] = useState(getActiveSection());

  const links = [
    { name: "Users", section: "users", element: <AdminUserManagement /> },
    // Add more 
  ];

  const handleNavClick = (section) => {
    setActiveSection(section);
    navigate(`/admin/dashboard/${section}`);
  };

  // Find the component to render
  const activeLink = links.find(link => link.section === activeSection);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="flex flex-col w-64 bg-white shadow-md">
        <div className="p-4 text-lg font-bold text-purple-700 border-b">Admin Panel</div>
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

      {/* Main content */}
      <div className="flex-1 p-4 overflow-auto">
        {activeLink?.element}
      </div>
    </div>
  );
}