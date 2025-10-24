import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Loader2, Search, Filter, ChevronLeft, ChevronRight, MessageSquare, BarChart2 } from "lucide-react";
import { toast } from "react-toastify";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

export default function AdminContacts() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams({
          search,
          status: statusFilter === "all" ? "" : statusFilter,
          page,
          limit,
        }).toString();

        const response = await fetch(`http://localhost:5000/api/contacts?${query}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch contacts");

        const data = await response.json();
        setContacts(data.data || []);
        setError("");
      } catch (err) {
        setError(err.message);
        toast.error(err.message || "Failed to fetch contacts");
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchContacts();
  }, [search, statusFilter, page, user]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const statusCounts = contacts.reduce(
    (acc, contact) => {
      acc[contact.status] = (acc[contact.status] || 0) + 1;
      return acc;
    },
    { unread: 0, read: 0, responded: 0 }
  );

  const chartData = {
    labels: ["Unread", "Read", "Responded"],
    datasets: [
      {
        label: "Contact Messages by Status",
        data: [statusCounts.unread, statusCounts.read, statusCounts.responded],
        backgroundColor: ["#3b82f6", "#f59e0b", "#10b981"],
        borderColor: ["#2563eb", "#d97706", "#059669"],
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
          text: "Number of Messages",
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-xl text-slate-600"
        >
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          Loading contacts...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8 text-center bg-white shadow-md rounded-2xl"
        >
          <p className="text-lg font-medium text-red-600">Error: {error}</p>
        </motion.div>
      </div>
    );
  }

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
              <MessageSquare className="w-6 h-6 text-slate-700" />
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900">
              Contact Messages
            </h1>
          </div>
          <p className="text-slate-600">Manage and respond to user inquiries</p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-4 mb-6"
        >
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute w-5 h-5 transform -translate-y-1/2 text-slate-400 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, subject..."
              value={search}
              onChange={handleSearchChange}
              className="w-full py-2 pl-10 pr-4 text-sm transition-all border rounded-lg border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute w-5 h-5 transform -translate-y-1/2 text-slate-400 left-3 top-1/2" />
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="py-2 pl-10 pr-4 text-sm transition-all border rounded-lg border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="responded">Responded</option>
            </select>
          </div>
        </motion.div>

        {/* Status Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 mb-6 bg-white shadow-md rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">
              Message Status Breakdown
            </h2>
          </div>
          <div className="h-64">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Contacts Table */}
        {contacts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-12 text-center bg-white shadow-md rounded-2xl"
          >
            <MessageSquare className="mx-auto mb-4 text-6xl text-slate-300" />
            <h3 className="mb-2 text-xl font-semibold text-slate-700">
              No Messages Found
            </h3>
            <p className="text-slate-500">Try adjusting the search or status filter.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="overflow-x-auto bg-white shadow-md rounded-2xl"
          >
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-800 text-slate-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase">
                    Message
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {contacts.map((c, index) => (
                  <motion.tr
                    key={c._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => navigate(`/admin/dashboard/contacts/${c._id}`)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {c.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{c.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{c.subject}</td>
                    <td className="max-w-xs px-6 py-4 text-sm truncate text-slate-600">
                      {c.message}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-medium capitalize ${
                        c.status === "unread"
                          ? "text-blue-600"
                          : c.status === "read"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {c.status}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* Pagination */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-3 mt-6"
        >
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          <span className="flex items-center text-lg font-medium text-slate-700">
            Page {page}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:scale-105"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}