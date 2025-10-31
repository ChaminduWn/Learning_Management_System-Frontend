import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
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
import Sidebar from "../../components/Sidebar";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

import { motion } from "framer-motion";
import { BookOpen, CheckCircle, Clock, Users, TrendingUp, Plus } from "lucide-react";

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

  const fetchStats = async () => {
    if (!user) return;
    try {
      const res = await fetch("http://localhost:5000/api/courses/my-courses", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const courses = await res.json();

      const approved = courses.filter((c) => c.status === "Approved").length;
      const pending = courses.filter((c) => c.status === "Pending").length;
      const studentsPerCourse = courses.map((c) => ({
        label: c.title.length > 15 ? c.title.substring(0, 15) + "..." : c.title,
        students: c.enrolledStudents?.length || 0,
      }));

      setStats({
        totalCourses: courses.length,
        approved,
        pending,
        studentsPerCourse,
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  const items = [
    { key: "profile", label: "Profile", path: "/instructor/dashboard/profile", icon: "User" },
    { key: "my-courses", label: "My Courses", path: "/instructor/dashboard/my-courses", icon: "BookOpen" },
    { key: "add", label: "Add Course", path: "/instructor/dashboard/add", icon: "Plus" },
  ];

  const isMainDashboard = location.pathname === "/instructor/dashboard";

  // Chart Options (JavaScript-safe)
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      tooltip: { backgroundColor: "rgba(0,0,0,0.8)" },
    },
  };

  const courseData = {
    labels: ["Total", "Approved", "Pending"],
    datasets: [
      {
        label: "Courses",
        data: [stats.totalCourses, stats.approved, stats.pending],
        backgroundColor: ["#8B5CF6", "#10B981", "#F59E0B"],
        borderRadius: 8,
      },
    ],
  };

  const studentData = {
    labels: stats.studentsPerCourse.map((c) => c.label),
    datasets: [
      {
        label: "Students",
        data: stats.studentsPerCourse.map((c) => c.students),
        backgroundColor: "#3B82F6",
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Sidebar
        title=" Dashboard"
        items={items}
        onSelect={(item) => navigate(item.path)}
        role="instructor"
      />

      <div className="flex-1 p-6 ml-64 overflow-y-auto lg:p-10">
        {isMainDashboard ? (
          <div className="mx-auto space-y-8 max-w-7xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Welcome back, {user?.name?.split(" ")[0] || "Instructor"}!
              </h1>
              <p className="mt-2 text-gray-600">Here's your teaching overview</p>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Total Courses", value: stats.totalCourses, icon: BookOpen, color: "indigo" },
                { label: "Approved", value: stats.approved, icon: CheckCircle, color: "emerald" },
                { label: "Pending", value: stats.pending, icon: Clock, color: "amber" },
                {
                  label: "Total Students",
                  value: stats.studentsPerCourse.reduce((a, b) => a + b.students, 0),
                  icon: Users,
                  color: "blue",
                },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 bg-white shadow-lg rounded-2xl"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    </div>
                    <div className={`p-3 bg-${stat.color}-100 rounded-xl`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 bg-white shadow-lg rounded-2xl"
              >
                <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-800">
                  <TrendingUp className="w-5 h-5 text-indigo-600" /> Course Status
                </h3>
                <Doughnut data={courseData} options={chartOptions} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 bg-white shadow-lg rounded-2xl"
              >
                <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-800">
                  <Users className="w-5 h-5 text-blue-600" /> Students per Course
                </h3>
                <Bar data={studentData} options={chartOptions} />
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => navigate("/instructor/dashboard/add")}
                className="flex items-center justify-center flex-1 gap-2 py-3 font-medium text-white transition-all shadow-md bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:scale-105"
              >
                Add New Course <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate("/instructor/dashboard/my-courses")}
                className="flex items-center justify-center flex-1 gap-2 py-3 font-medium text-indigo-600 transition-all bg-indigo-50 rounded-xl hover:bg-indigo-100 hover:scale-105"
              >
                View All Courses <BookOpen className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
}