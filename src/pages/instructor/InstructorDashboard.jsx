import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import Sidebar from "../../components/Sidebar";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function InstructorDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState({
    totalCourses: 0,
    approved: 0,
    pending: 0,
    studentsPerCourse: [],
  });

  // Fetch instructor courses and stats
  const fetchStats = async () => {
    if (!user) return;
    try {
      const res = await fetch("http://localhost:5000/api/courses/my-courses", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const courses = await res.json();

      const approved = courses.filter(c => c.status === "Approved").length;
      const pending = courses.filter(c => c.status === "Pending").length;
      const studentsPerCourse = courses.map(c => ({
        label: c.title,
        students: c.enrolledStudents.length,
      }));

      setStats({
        totalCourses: courses.length,
        approved,
        pending,
        studentsPerCourse,
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  // Sidebar menu items
  const items = [
    { key: "profile", label: "Profile", path: "/instructor/dashboard/profile" },
    { key: "my-courses", label: "My Courses", path: "/instructor/dashboard/my-courses" },
    { key: "add", label: "Add Course", path: "/instructor/dashboard/add" },
  ];

  // Handle sidebar navigation
  const handleSelect = (item) => {
    navigate(item.path);
  };

  // Check if we're on the main dashboard route (not a nested route)
  const isMainDashboard = location.pathname === "/instructor/dashboard";

  // Chart data
  const courseData = {
    labels: ["Total Courses", "Approved", "Pending"],
    datasets: [
      {
        label: "Course Stats",
        data: [stats.totalCourses, stats.approved, stats.pending],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  const studentData = {
    labels: stats.studentsPerCourse.map(c => c.label),
    datasets: [
      {
        label: "Students Enrolled",
        data: stats.studentsPerCourse.map(c => c.students),
        backgroundColor: "#36A2EB",
      },
    ],
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar title="Instructor 🎓" items={items} onSelect={handleSelect} role="instructor" />

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100">
        {/* Show dashboard overview only on main route */}
        {isMainDashboard && (
          <>
            <h2 className="mb-6 text-2xl font-bold">Dashboard Overview</h2>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
              <div className="p-4 bg-white rounded shadow">
                <h3 className="mb-4 text-lg font-semibold">Course Statistics</h3>
                <Doughnut data={courseData} />
              </div>

              <div className="p-4 bg-white rounded shadow">
                <h3 className="mb-4 text-lg font-semibold">Students per Course</h3>
                <Bar data={studentData} />
              </div>
            </div>
          </>
        )}

        {/* Nested Routes */}
        <Outlet />
      </div>
    </div>
  );
}