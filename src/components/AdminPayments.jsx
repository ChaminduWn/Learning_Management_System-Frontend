import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom"; // Added for navigation
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import {
  FaDollarSign,
  FaReceipt,
  FaCheckCircle,
  FaUndo,
  FaChartLine,
} from "react-icons/fa";

export default function AdminPayments() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize navigate hook

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading statistics...</div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`text-2xl ${color.replace("bg-", "text-")}`} />
        </div>
      </div>
      <h3 className="mb-1 text-sm font-medium text-gray-600">{title}</h3>
      <p className="mb-1 text-3xl font-bold text-gray-800">{value}</p>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  );

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">
            Payment Statistics
          </h1>
          <p className="text-gray-600">Overview of all payment transactions</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={FaDollarSign}
            title="Total Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            subtitle="From completed payments"
            color="bg-green-500"
          />
          <StatCard
            icon={FaReceipt}
            title="Total Payments"
            value={stats.totalPayments}
            subtitle="All transactions"
            color="bg-blue-500"
          />
          <StatCard
            icon={FaCheckCircle}
            title="Completed"
            value={stats.completedPayments}
            subtitle="Successfully processed"
            color="bg-emerald-500"
          />
          <StatCard
            icon={FaUndo}
            title="Refunded"
            value={stats.refundedPayments}
            subtitle="Refunded transactions"
            color="bg-red-500"
          />
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Status Breakdown */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <FaChartLine className="text-xl text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">
                Payment Status Breakdown
              </h2>
            </div>
            <div className="space-y-4">
              {stats.stats.map((stat) => {
                const total = stats.totalPayments;
                const percentage = ((stat.count / total) * 100).toFixed(1);
                const colors = {
                  completed: "bg-green-500",
                  refunded: "bg-red-500",
                  pending: "bg-yellow-500",
                  failed: "bg-gray-500",
                };

                return (
                  <div key={stat._id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700 capitalize">
                        {stat._id}
                      </span>
                      <div className="text-right">
                        <span className="text-lg font-bold text-gray-800">
                          {stat.count}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          ({percentage}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className={`h-full rounded-full ${
                          colors[stat._id] || "bg-gray-400"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      Revenue: ${stat.totalAmount.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-xl font-bold text-gray-800">
              Financial Summary
            </h2>
            <div className="space-y-4">
              <div className="p-4 border-l-4 border-green-500 bg-green-50">
                <p className="text-sm text-gray-600">Completed Revenue</p>
                <p className="text-2xl font-bold text-green-700">
                  $
                  {stats.stats
                    .find((s) => s._id === "completed")
                    ?.totalAmount.toFixed(2) || "0.00"}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.stats.find((s) => s._id === "completed")?.count || 0}{" "}
                  transactions
                </p>
              </div>

              <div className="p-4 border-l-4 border-red-500 bg-red-50">
                <p className="text-sm text-gray-600">Refunded Amount</p>
                <p className="text-2xl font-bold text-red-700">
                  $
                  {stats.stats
                    .find((s) => s._id === "refunded")
                    ?.totalAmount.toFixed(2) || "0.00"}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.stats.find((s) => s._id === "refunded")?.count || 0}{" "}
                  refunds
                </p>
              </div>

              <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
                <p className="text-sm text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-yellow-700">
                  $
                  {stats.stats
                    .find((s) => s._id === "pending")
                    ?.totalAmount.toFixed(2) || "0.00"}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.stats.find((s) => s._id === "pending")?.count || 0}{" "}
                  pending
                </p>
              </div>

              <div className="p-4 mt-4 border-t-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Net Revenue
                  </span>
                  <span className="text-xl font-bold text-gray-800">
                    $
                    {(
                      (stats.stats.find((s) => s._id === "completed")
                        ?.totalAmount || 0) -
                      (stats.stats.find((s) => s._id === "refunded")
                        ?.totalAmount || 0)
                    ).toFixed(2)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Completed revenue minus refunds
                </p>
              </div>

              <div className="p-4 bg-blue-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Average Transaction
                  </span>
                  <span className="text-xl font-bold text-blue-700">
                    $
                    {stats.totalPayments > 0
                      ? (stats.totalRevenue / stats.completedPayments).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Based on completed payments
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 mt-8 bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-xl font-bold text-gray-800">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <button
              onClick={() => navigate("/admin/payment/all")} // Updated to use navigate
              className="px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              View All Payments
            </button>
            <button
              onClick={fetchStats}
              className="px-6 py-3 font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Refresh Statistics
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-3 font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Print Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}