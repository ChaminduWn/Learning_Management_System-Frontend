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
import { motion } from "framer-motion";
import { FaDollarSign, FaReceipt, FaUserShield, FaTimesCircle, FaChartBar } from "react-icons/fa";
import { Loader2 } from "lucide-react";

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
    { key: "contacts", label: "Feedback", path: "/admin/dashboard/contacts" },
  ];

  const isMainDashboard = location.pathname === "/admin/dashboard";

  useEffect(() => {
    if (!user?.token) return;
    const fetchStats = async () => {
      try {
        
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

        
        const userRes = await fetch("http://localhost:5000/api/auth", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const users = await userRes.json();
        const totalStudents = users.filter((u) => u.role === "Student").length;
        const totalInstructors = users.filter((u) => u.role === "Instructor").length;
        const totalAdmins = users.filter((u) => u.role === "Admin").length;

        
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
    plugins: {
      legend: { position: "top", labels: { color: "#334155" } },
      title: { color: "#334155" },
      tooltip: { backgroundColor: "#1e293b", titleColor: "#f1f5f9", bodyColor: "#f1f5f9" },
    },
    scales: {
      x: { ticks: { color: "#334155" }, grid: { color: "#e2e8f0" } },
      y: { ticks: { color: "#334155" }, grid: { color: "#e2e8f0" } },
    },
  };

  const courseStatusData = {
    labels: ["Approved", "Pending", "Rejected"],
    datasets: [
      {
        label: "Courses",
        data: [stats.approvedCourses, stats.pendingCourses, stats.rejectedCourses],
        backgroundColor: ["#4f46e5", "#f59e0b", "#ef4444"],
        borderColor: ["#4338ca", "#d97706", "#dc2626"],
        borderWidth: 1,
      },
    ],
  };

  const enrollmentData = {
    labels: stats.enrollmentsPerCourse.map((c) => c.label),
    datasets: [
      {
        label: "Enrollments",
        data: stats.enrollmentsPerCourse.map((c) => c.enrollments),
        backgroundColor: "#4f46e5",
        borderColor: "#4338ca",
        borderWidth: 1,
      },
    ],
  };

  const userData = {
    labels: ["Students", "Instructors", "Admins"],
    datasets: [
      {
        label: "User Count",
        data: [stats.totalStudents, stats.totalInstructors, stats.totalAdmins],
        backgroundColor: ["#4f46e5", "#ef4444", "#10b981"],
        borderColor: ["#4338ca", "#dc2626", "#059669"],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center gap-2 text-xl text-slate-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Sidebar
        title="Admin Panel 🛠️"
        items={items}
        onSelect={(item) => navigate(item.path)}
        role="admin"
        className="bg-slate-800 text-slate-100"
      />

      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {isMainDashboard ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl">
                <FaChartBar className="w-6 h-6 text-slate-700" />
              </div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900">
                Admin Dashboard
              </h2>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="p-6 transition-all duration-300 bg-white shadow-md rounded-2xl hover:shadow-xl"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-100 rounded-full">
                    <FaChartBar className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700">Approved Courses</h3>
                </div>
                <p className="text-2xl font-bold text-indigo-600">{stats.approvedCourses}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="p-6 transition-all duration-300 bg-white shadow-md rounded-2xl hover:shadow-xl"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <FaChartBar className="w-5 h-5 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700">Pending Courses</h3>
                </div>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingCourses}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="p-6 transition-all duration-300 bg-white shadow-md rounded-2xl hover:shadow-xl"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-full bg-emerald-100">
                    <FaUserShield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700">Total Students</h3>
                </div>
                <p className="text-2xl font-bold text-emerald-600">{stats.totalStudents}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="p-6 transition-all duration-300 bg-white shadow-md rounded-2xl hover:shadow-xl"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <FaUserShield className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700">Total Instructors</h3>
                </div>
                <p className="text-2xl font-bold text-purple-600">{stats.totalInstructors}</p>
              </motion.div>
            </div>

            {/* Total Revenue, Payments, Admins, Rejected Courses */}
            {paymentStats && (
              <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="p-6 transition-all duration-300 bg-white shadow-md rounded-2xl hover:shadow-xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-full">
                      <FaDollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700">Total Revenue (LKR)</h3>
                  </div>
                  <p className="mb-2 text-2xl font-bold text-green-600">
                    {paymentStats.totalRevenue.toFixed(2)}
                  </p>
                  <p className="text-sm text-slate-500">From completed payments</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="p-6 transition-all duration-300 bg-white shadow-md rounded-2xl hover:shadow-xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <FaReceipt className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700">Total Payments</h3>
                  </div>
                  <p className="mb-2 text-2xl font-bold text-blue-600">{paymentStats.totalPayments}</p>
                  <p className="text-sm text-slate-500">All transactions</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="p-6 transition-all duration-300 bg-white shadow-md rounded-2xl hover:shadow-xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <FaUserShield className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700">Total Admins</h3>
                  </div>
                  <p className="mb-2 text-2xl font-bold text-purple-600">{stats.totalAdmins}</p>
                  <p className="text-sm text-slate-500">All admin users</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="p-6 transition-all duration-300 bg-white shadow-md rounded-2xl hover:shadow-xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 rounded-full">
                      <FaTimesCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700">Rejected Courses</h3>
                  </div>
                  <p className="mb-2 text-2xl font-bold text-red-600">{stats.rejectedCourses}</p>
                  <p className="text-sm text-slate-500">Courses not approved</p>
                </motion.div>
              </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="p-6 transition-all duration-300 bg-white shadow-md rounded-2xl hover:shadow-xl"
              >
                <h3 className="mb-4 text-lg font-semibold text-slate-700">Course Status</h3>
                <div style={{ height: "250px" }}>
                  <Doughnut data={courseStatusData} options={chartOptions} />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="p-6 transition-all duration-300 bg-white shadow-md rounded-2xl hover:shadow-xl"
              >
                <h3 className="mb-4 text-lg font-semibold text-slate-700">Enrollments per Course</h3>
                <div style={{ height: "250px" }}>
                  {stats.enrollmentsPerCourse.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100">
                        <FaChartBar className="w-10 h-10 text-slate-400" />
                      </div>
                      <p className="mt-2 text-center text-slate-500">No enrollment data available</p>
                    </div>
                  ) : (
                    <Bar data={enrollmentData} options={chartOptions} />
                  )}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="p-6 transition-all duration-300 bg-white shadow-md rounded-2xl hover:shadow-xl"
              >
                <h3 className="mb-4 text-lg font-semibold text-slate-700">User Statistics</h3>
                <div style={{ height: "250px" }}>
                  <Bar data={userData} options={chartOptions} />
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
}