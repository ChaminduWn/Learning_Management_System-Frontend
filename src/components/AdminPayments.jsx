import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Loader2, DollarSign, Receipt, CheckCircle, RotateCcw, BarChart2, RefreshCw, Printer } from "lucide-react";
import { toast } from "react-toastify";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

export default function AdminPayments() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/payments/stats", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setStats(data);
    } catch (err) {
      toast.error(err.message || "Failed to fetch payment statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-xl text-slate-600"
        >
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          Loading statistics...
        </motion.div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="p-6 transition-all duration-300 bg-white shadow-md rounded-2xl hover:shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace("bg-", "text-")}`} />
        </div>
      </div>
      <h3 className="mb-1 text-sm font-medium text-slate-600">{title}</h3>
      <p className="mb-1 text-3xl font-bold text-slate-800">{value}</p>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
    </motion.div>
  );

  const chartData = {
    labels: ["Completed", "Refunded", "Pending", "Failed"],
    datasets: [
      {
        label: "Payment Status",
        data: [
          stats.stats.find((s) => s._id === "completed")?.count || 0,
          stats.stats.find((s) => s._id === "refunded")?.count || 0,
          stats.stats.find((s) => s._id === "pending")?.count || 0,
          stats.stats.find((s) => s._id === "failed")?.count || 0,
        ],
        backgroundColor: ["#10b981", "#ef4444", "#f59e0b", "#6b7280"],
        borderColor: ["#059669", "#dc2626", "#d97706", "#4b5563"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Payments",
        },
      },
      x: {
        title: {
          display: true,
          text: "Status",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            label += context.parsed.y;
            return label;
          },
        },
      },
    },
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-slate-50 via-white to-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl">
              <DollarSign className="w-6 h-6 text-slate-700" />
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900">
              Payment Statistics
            </h1>
          </div>
          <p className="text-slate-600">Overview of all payment transactions</p>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 gap-6 mt-6 mb-8 md:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard
            icon={DollarSign}
            title="Total Revenue"
            value={`LKR ${stats.totalRevenue.toFixed(2)}`}
            subtitle="From completed payments"
            color="bg-green-600"
          />
          <StatCard
            icon={Receipt}
            title="Total Payments"
            value={stats.totalPayments}
            subtitle="All transactions"
            color="bg-indigo-600"
          />
          <StatCard
            icon={CheckCircle}
            title="Completed"
            value={stats.completedPayments}
            subtitle="Successfully processed"
            color="bg-emerald-600"
          />
          <StatCard
            icon={RotateCcw}
            title="Refunded"
            value={stats.refundedPayments}
            subtitle="Refunded transactions"
            color="bg-red-600"
          />
        </motion.div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Status Breakdown with Chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-white shadow-md rounded-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-800">
                Payment Status Breakdown
              </h2>
            </div>
            <div className="h-64">
              <Bar data={chartData} options={chartOptions} />
            </div>
            <div className="mt-4 space-y-2">
              {stats.stats.map((stat) => (
                <div key={stat._id} className="flex items-center justify-between text-sm">
                  <span className="font-medium capitalize text-slate-700">{stat._id}</span>
                  <span className="text-slate-600">Revenue: ${stat.totalAmount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Financial Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-white shadow-md rounded-2xl"
          >
            <h2 className="mb-4 text-xl font-bold text-slate-800">
              Financial Summary
            </h2>
            <div className="space-y-4">
              <div className="p-4 border-l-4 border-green-600 bg-green-50 rounded-xl">
                <p className="text-sm text-slate-600">Completed Revenue</p>
                <p className="text-2xl font-bold text-green-700">
                  LKR {stats.stats.find((s) => s._id === "completed")?.totalAmount.toFixed(2) || "0.00"}
                </p>
                <p className="text-xs text-slate-500">
                  {stats.stats.find((s) => s._id === "completed")?.count || 0} transactions
                </p>
              </div>
              <div className="p-4 border-l-4 border-red-600 bg-red-50 rounded-xl">
                <p className="text-sm text-slate-600">Refunded Amount</p>
                <p className="text-2xl font-bold text-red-700">
                  LKR {stats.stats.find((s) => s._id === "refunded")?.totalAmount.toFixed(2) || "0.00"}
                </p>
                <p className="text-xs text-slate-500">
                  {stats.stats.find((s) => s._id === "refunded")?.count || 0} refunds
                </p>
              </div>
              <div className="p-4 border-l-4 border-yellow-600 bg-yellow-50 rounded-xl">
                <p className="text-sm text-slate-600">Pending Amount</p>
                <p className="text-2xl font-bold text-yellow-700">
                  LKR {stats.stats.find((s) => s._id === "pending")?.totalAmount.toFixed(2) || "0.00"}
                </p>
                <p className="text-xs text-slate-500">
                  {stats.stats.find((s) => s._id === "pending")?.count || 0} pending
                </p>
              </div>
              <div className="p-4 border-t-2 border-slate-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Net Revenue</span>
                  <span className="text-xl font-bold text-slate-800">
                    LKR {((stats.stats.find((s) => s._id === "completed")?.totalAmount || 0) - (stats.stats.find((s) => s._id === "refunded")?.totalAmount || 0)).toFixed(2)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Completed revenue minus refunds
                </p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">
                    Average Transaction
                  </span>
                  <span className="text-xl font-bold text-indigo-700">
                    LKR {stats.totalPayments > 0 ? (stats.totalRevenue / stats.completedPayments).toFixed(2) : "0.00"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Based on completed payments
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 mt-8 bg-white shadow-md rounded-2xl"
        >
          <h2 className="mb-4 text-xl font-bold text-slate-800">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <button
              onClick={() => navigate("/admin/payment/all")}
              className="px-6 py-3 text-sm font-medium text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:scale-105"
            >
              View All Payments
            </button>
            <button
              onClick={fetchStats}
              className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-all duration-200 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200"
            >
              <RefreshCw size={16} />
              Refresh Statistics
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-all duration-200 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200"
            >
              <Printer size={16} />
              Print Report
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}