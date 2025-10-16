import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import AddCourse from "../courses/AddCourse"
import MyCourses from "../courses/MyCourses";

export default function InstructorDashboard() {
  const [active, setActive] = useState("my-courses");

  const items = [
    { key: "my-courses", label: "My Courses" },
    { key: "add", label: "Add Course" },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar items={items} active={active} onSelect={setActive} />
      <div className="flex-1 p-6 bg-gray-100">
        {active === "my-courses" && <MyCourses />}
        {active === "add" && <AddCourse />}
      </div>
    </div>
  );
}
