import React from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

export default function AdminDashboard() {

  const navigate = useNavigate();

  
const items = [
    { key: "users", label: "Users", path: "/admin/dashboard/users" },
    { key: "course", label: "Course Approval", path: "/admin/dashboard/course" },
  ];

  const handleSelect = (item) => navigate(item.path);
 

  return (
    <div className="flex h-screen bg-gray-100">
        <Sidebar title="Admin Panel 🛠️" items={items} onSelect={handleSelect} role="admin" />
      <div className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </div>
    </div>
  );
}
