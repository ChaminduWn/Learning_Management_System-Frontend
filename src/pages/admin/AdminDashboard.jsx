import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { toast } from "react-toastify";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({
    approvedCourses: 0,
    pendingCourses: 0,
    enrollmentsPerCourse: [],
    activeStudents: 0,
    inactiveStudents: 0,
    activeInstructors: 0,
    inactiveInstructors: 0,
  });
  const [loading, setLoading] = useState(true);

  const items = [
    { key: "profile", label: "Profile", path: "/admin/dashboard/profile" },
    { key: "users", label: "Users", path: "/admin/dashboard/users" },
    { key: "course", label: "Course Approval", path: "/admin/dashboard/course" },

    { key: "refund", label: "Refund", path: "/admin/dashboard/refund" },
    { key: "payments", label: "Payments", path: "/admin/dashboard/payments" },

  ];

  // Check if we're on the main dashboard route
  const isMainDashboard = location.pathname === "/admin/dashboard";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch courses
        const courseRes = await fetch("http://localhost:5000/api/courses", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!courseRes.ok) throw new Error((await courseRes.json()).message);
        const courses = await courseRes.json();

        const approvedCourses = courses.filter(c => c.status === "Approved").length;
        const pendingCourses = courses.filter(c => c.status === "Pending").length;
        const enrollmentsPerCourse = courses
          .filter(c => c.status === "Approved")
          .map(c => ({ label: c.title, enrollments: c.enrolledStudents.length }));

        // Fetch users
        const userRes = await fetch("http://localhost:5000/api/auth", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!userRes.ok) throw new Error((await userRes.json()).message);
        const users = await userRes.json();
        const students = users.filter(u => u.role === "Student");
        const instructors = users.filter(u => u.role === "Instructor");

        setStats({
          approvedCourses,
          pendingCourses,
          enrollmentsPerCourse,
          activeStudents: students.filter(u => u.isActive).length,
          inactiveStudents: students.filter(u => !u.isActive).length,
          activeInstructors: instructors.filter(u => u.isActive).length,
          inactiveInstructors: instructors.filter(u => !u.isActive).length,
        });
      } catch (err) {
        toast.error(err.message || "Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (user && user.token) fetchStats();
  }, [user]);

  // Chart data
  const courseStatusData = {
    labels: ["Approved Courses", "Pending Courses"],
    datasets: [
      {
        label: "Course Status",
        data: [stats.approvedCourses, stats.pendingCourses],
        backgroundColor: ["#36A2EB", "#FFCE56"],
      },
    ],
  };

  const enrollmentData = {
    labels: stats.enrollmentsPerCourse.map(c => c.label),
    datasets: [
      {
        label: "Enrollments",
        data: stats.enrollmentsPerCourse.map(c => c.enrollments),
        backgroundColor: "#FF6384",
      },
    ],
  };

  const userData = {
    labels: ["Active Students", "Inactive Students", "Active Instructors", "Inactive Instructors"],
    datasets: [
      {
        label: "User Statistics",
        data: [
          stats.activeStudents,
          stats.inactiveStudents,
          stats.activeInstructors,
          stats.inactiveInstructors,
        ],
        backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384", "#4BC0C0"],
      },
    ],
  };

  const chartOptions = { maintainAspectRatio: false, plugins: { legend: { position: "top" } } };

  if (loading) return <div className="p-6 text-center">Loading dashboard...</div>;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar title="Admin Panel 🛠️" items={items} onSelect={(item) => navigate(item.path)} role="admin" />

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100">
        {/* Show main dashboard charts only on dashboard root */}
        {isMainDashboard && (
          <>
            <h2 className="mb-6 text-2xl font-bold text-red-700">Admin Dashboard</h2>
            <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="mb-4 text-lg font-semibold text-gray-700">Course Status</h3>
                <div style={{ height: "250px" }}>
                  <Doughnut data={courseStatusData} options={chartOptions} />
                </div>
              </div>

              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="mb-4 text-lg font-semibold text-gray-700">Enrollments per Course</h3>
                <div style={{ height: "250px" }}>
                  <Bar data={enrollmentData} options={chartOptions} />
                </div>
              </div>

              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="mb-4 text-lg font-semibold text-gray-700">User Statistics</h3>
                <div style={{ height: "250px" }}>
                  <Bar data={userData} options={chartOptions} />
                </div>
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
