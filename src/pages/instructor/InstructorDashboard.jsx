import React from "react";
import Sidebar from "../../components/Sidebar";

import { Outlet, useNavigate } from "react-router-dom";

export default function InstructorDashboard() {
  const navigate = useNavigate();
  
  const items = [
    { key: "profile", label: "Profile", path: "/instructor/dashboard/profile" },
    { key: "my-courses", label: "My Courses", path: "/instructor/dashboard/my-courses" },
    { key: "add", label: "Add Course", path: "/instructor/dashboard/add" },
  ];

  const handleSelect = (item) => {
    navigate(item.path);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar title="Instructor 🎓" items={items} onSelect={handleSelect} role="instructor" />
      <div className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </div>
    </div>
  );
}
