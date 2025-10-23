import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { toast } from "react-toastify";
import { FaDollarSign, FaReceipt, FaUserShield, FaTimesCircle } from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState({
    approvedCourses: 0,
    pendingCourses: 0,
    rejectedCourses: 0,
    enrollmentsPerCourse: [],
    totalStudents: 0,
    totalInstructors: 0,
    totalAdmins: 0,
  });

  const [paymentStats, setPaymentStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const items = [
    { key: "profile", label: "Profile", path: "/admin/dashboard/profile" },
    { key: "users", label: "Users", path: "/admin/dashboard/users" },
    { key: "course", label: "Course Approval", path: "/admin/dashboard/course" },
    { key: "refund", label: "Refund", path: "/admin/dashboard/refund" },
    { key: "payments", label: "Payments", path: "/admin/dashboard/payments" },
    
    
  ];

  const isMainDashboard = location.pathname === "/admin/dashboard";

  useEffect(() => {
    if (!user?.token) return;
    const fetchStats = async () => {
      try {
        // --- FETCH COURSES ---
        const courseRes = await fetch("http://localhost:5000/api/courses", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const courses = await courseRes.json();
        const approvedCourses = courses.filter((c) => c.status === "Approved").length;
        const pendingCourses = courses.filter((c) => c.status === "Pending").length;
        const rejectedCourses = courses.filter((c) => c.status === "Rejected").length;

        const enrollmentsPerCourse = courses
          .filter((c) => c.status === "Approved")
          .map((c) => ({
            label: c.title?.length > 10 ? c.title.slice(0, 10) + "..." : c.title,
            enrollments: c.enrolledStudents?.length || 0,
          }));

        // --- FETCH USERS ---
        const userRes = await fetch("http://localhost:5000/api/auth", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const users = await userRes.json();
        const totalStudents = users.filter((u) => u.role === "Student").length;
        const totalInstructors = users.filter((u) => u.role === "Instructor").length;
        const totalAdmins = users.filter((u) => u.role === "Admin").length;

        // --- FETCH PAYMENT STATS ---
        const payStatsRes = await fetch("http://localhost:5000/api/payments/stats", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const payData = await payStatsRes.json();
        if (!payStatsRes.ok) throw new Error(payData.message || "Failed to load payment stats");

        setStats({
          approvedCourses,
          pendingCourses,
          rejectedCourses,
          enrollmentsPerCourse,
          totalStudents,
          totalInstructors,
          totalAdmins,
        });

        setPaymentStats(payData);
      } catch (err) {
        toast.error(err.message || "Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" } },
  };

  const courseStatusData = {
    labels: ["Approved", "Pending", "Rejected"],
    datasets: [
      {
        label: "Courses",
        data: [stats.approvedCourses, stats.pendingCourses, stats.rejectedCourses],
        backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384"],
      },
    ],
  };

  const enrollmentData = {
    labels: stats.enrollmentsPerCourse.map((c) => c.label),
    datasets: [
      {
        label: "Enrollments",
        data: stats.enrollmentsPerCourse.map((c) => c.enrollments),
        backgroundColor: "#FF6384",
      },
    ],
  };

  const userData = {
    labels: ["Students", "Instructors", "Admins"],
    datasets: [
      {
        label: "User Count",
        data: [stats.totalStudents, stats.totalInstructors, stats.totalAdmins],
        backgroundColor: ["#36A2EB", "#FF6384", "#4BC0C0"],
      },
    ],
  };

  if (loading)
    return <div className="p-6 text-center">Loading dashboard...</div>;

  return (
    <div className="flex min-h-screen">
      <Sidebar
        title="Admin Panel 🛠️"
        items={items}
        onSelect={(item) => navigate(item.path)}
        role="admin"
      />

      <div className="flex-1 p-6 bg-gray-100">
        {isMainDashboard ? (
          <>
            <h2 className="mb-6 text-2xl font-bold text-purple-700">
              Admin Dashboard
            </h2>

            {/* --- KEY STATS --- */}
            <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700">
                  Approved Courses
                </h3>
                <p className="text-2xl font-bold">{stats.approvedCourses}</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700">
                  Pending Courses
                </h3>
                <p className="text-2xl font-bold">{stats.pendingCourses}</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700">
                  Total Students
                </h3>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700">
                  Total Instructors
                </h3>
                <p className="text-2xl font-bold">{stats.totalInstructors}</p>
              </div>
            </div>

            {/* --- TOTAL REVENUE, TOTAL PAYMENTS, ADMIN COUNT, REJECTED COURSES --- */}
            {paymentStats && (
              <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 transition-shadow duration-300 bg-white rounded-lg shadow-md hover:shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      
                      <h3 className="text-xl font-semibold text-gray-800">
                         Total Revenue (LKR)
                      </h3>
                    </div>
                  </div>
                  <p className="mb-2 text-3xl font-bold text-green-600">
                     {paymentStats.totalRevenue.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    From completed payments
                  </p>
                </div>

                <div className="p-6 transition-shadow duration-300 bg-white rounded-lg shadow-md hover:shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <FaReceipt className="text-3xl text-blue-500" />
                      <h3 className="text-xl font-semibold text-gray-800">
                        Total Payments
                      </h3>
                    </div>
                  </div>
                  <p className="mb-2 text-3xl font-bold text-blue-600">
                    {paymentStats.totalPayments}
                  </p>
                  <p className="text-sm text-gray-600">All transactions</p>
                </div>

                <div className="p-6 transition-shadow duration-300 bg-white rounded-lg shadow-md hover:shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <FaUserShield className="text-3xl text-purple-500" />
                      <h3 className="text-xl font-semibold text-gray-800">
                        Total Admins
                      </h3>
                    </div>
                  </div>
                  <p className="mb-2 text-3xl font-bold text-purple-600">
                    {stats.totalAdmins}
                  </p>
                  <p className="text-sm text-gray-600">All admin users</p>
                </div>

                <div className="p-6 transition-shadow duration-300 bg-white rounded-lg shadow-md hover:shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <FaTimesCircle className="text-3xl text-red-500" />
                      <h3 className="text-xl font-semibold text-gray-800">
                        Rejected Courses
                      </h3>
                    </div>
                  </div>
                  <p className="mb-2 text-3xl font-bold text-red-600">
                    {stats.rejectedCourses}
                  </p>
                  <p className="text-sm text-gray-600">Courses not approved</p>
                </div>
              </div>
            )}

            {/* --- CHARTS --- */}
            <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Course Status */}
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="mb-4 text-lg font-semibold text-gray-700">
                  Course Status
                </h3>
                <div style={{ height: "250px" }}>
                  <Doughnut data={courseStatusData} options={chartOptions} />
                </div>
              </div>

              {/* Enrollments */}
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="mb-4 text-lg font-semibold text-gray-700">
                  Enrollments per Course
                </h3>
                <div style={{ height: "250px" }}>
                  {stats.enrollmentsPerCourse.length === 0 ? (
                    <p className="text-center text-gray-500">
                      No enrollment data available
                    </p>
                  ) : (
                    <Bar data={enrollmentData} options={chartOptions} />
                  )}
                </div>
              </div>

              {/* Users */}
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="mb-4 text-lg font-semibold text-gray-700">
                  User Statistics
                </h3>
                <div style={{ height: "250px" }}>
                  <Bar data={userData} options={chartOptions} />
                </div>
              </div>
            </div>
          </>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
}