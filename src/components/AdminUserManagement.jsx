import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Search, Eye, UserCheck, UserX, AlertCircle, X, Loader2, Crown, BookOpen, GraduationCap } from "lucide-react";
import { toast } from "react-toastify";

export default function AdminUserManagement() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState(null);
  const [confirmReason, setConfirmReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:5000/api/auth", {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users. Please try again.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user]);

  const toggleStatus = async (id) => {
    if (!confirmReason && !confirmToggle?.isActive) {
      toast.error("Please provide a reason for deactivation");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/auth/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ reason: confirmReason }),
      });
      if (!res.ok) throw new Error("Failed to toggle user status");
      setUsers(prev =>
        prev.map(u =>
          u._id === id ? { ...u, isActive: !u.isActive, toggleReason: confirmReason } : u
        )
      );
      toast.success(`User ${confirmToggle.isActive ? "deactivated" : "activated"} successfully`);
      setConfirmToggle(null);
      setConfirmReason("");
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("Failed to toggle user status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const viewUser = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/auth/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch user details");
      const data = await res.json();
      setSelectedUser(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError("Failed to load user details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    return status ? <UserCheck className="w-5 h-5 text-green-600" /> : <UserX className="w-5 h-5 text-red-600" />;
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { bg: "bg-purple-100", text: "text-purple-800", icon: <Crown className="w-4 h-4" /> },
      instructor: { bg: "bg-indigo-100", text: "text-indigo-800", icon: <BookOpen className="w-4 h-4" /> },
      student: { bg: "bg-slate-100", text: "text-slate-800", icon: <GraduationCap className="w-4 h-4" /> },
    };
    const config = roleConfig[role?.toLowerCase()] || roleConfig.student;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.icon}
        {role}
      </span>
    );
  };

  const filteredUsers = users.filter(u => {
    const search = searchTerm.toLowerCase();
    return (
      u.name?.toLowerCase().includes(search) ||
      u.email?.toLowerCase().includes(search) ||
      u.role?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-slate-50 via-white to-slate-100 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl">
              <UserCheck className="w-6 h-6 text-slate-700" />
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900">
              User Management Dashboard
            </h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute w-5 h-5 transform -translate-y-1/2 text-slate-400 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 pl-10 pr-4 text-sm transition-all border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
            <span className="font-semibold">Legend:</span>
            <span className="inline-flex items-center gap-1.5"><Crown className="w-4 h-4 text-purple-600" /> Admin</span>
            <span className="inline-flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-indigo-600" /> Instructor</span>
            <span className="inline-flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-slate-600" /> Student</span>
          </div>
        </motion.div>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-4"
          >
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 mb-6 border-l-4 border-red-500 rounded-lg bg-red-50"
          >
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="overflow-x-auto bg-white shadow-md rounded-2xl"
        >
          <table className="min-w-full">
            <thead className="bg-slate-800 text-slate-100">
              <tr>
                <th scope="col" className="px-4 py-3 text-sm font-semibold text-left">Name</th>
                <th scope="col" className="px-4 py-3 text-sm font-semibold text-left">Email</th>
                <th scope="col" className="px-4 py-3 text-sm font-semibold text-left">Role</th>
                <th scope="col" className="px-4 py-3 text-sm font-semibold text-left">Status</th>
                <th scope="col" className="px-4 py-3 text-sm font-semibold text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <UserX className="w-10 h-10 text-slate-400" />
                      <span>{searchTerm ? "No users found matching your search" : "No users available"}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, index) => (
                  <motion.tr
                    key={u._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 text-slate-800">{u.name}</td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3">{getRoleBadge(u.role)}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        {getStatusIcon(u.isActive)}
                        <span className="text-sm font-semibold text-slate-700">
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => viewUser(u._id)}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`View details for ${u.name}`}
                        >
                          <Eye size={16} />
                          View
                        </button>
                        <button
                          onClick={() => setConfirmToggle(u)}
                          disabled={isLoading}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                            u.isActive
                              ? "text-red-600 bg-red-50 hover:bg-red-100"
                              : "text-green-600 bg-green-50 hover:bg-green-100"
                          }`}
                          aria-label={`${u.isActive ? "Deactivate" : "Activate"} ${u.name}`}
                        >
                          {u.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </motion.div>

        {confirmToggle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 mt-6 bg-white shadow-md rounded-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              {confirmToggle.isActive ? (
                <UserX className="w-5 h-5 text-red-600" />
              ) : (
                <UserCheck className="w-5 h-5 text-green-600" />
              )}
              <h3 className="text-lg font-semibold text-slate-700">
                {confirmToggle.isActive ? "Deactivate" : "Activate"} User: {confirmToggle.name}
              </h3>
            </div>
            {confirmToggle.isActive && (
              <textarea
                className="w-full p-4 text-sm transition-all border resize-none border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter reason for deactivation"
                value={confirmReason}
                onChange={(e) => setConfirmReason(e.target.value)}
                rows={4}
              />
            )}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => toggleStatus(confirmToggle._id)}
                disabled={isLoading}
                className={`flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                  confirmToggle.isActive
                    ? "bg-gradient-to-r from-red-600 to-red-700"
                    : "bg-gradient-to-r from-green-600 to-green-700"
                }`}
              >
                {isLoading ? (
                  <>
                    Submitting... <Loader2 className="w-4 h-4 animate-spin" />
                  </>
                ) : (
                  <>
                    Confirm {confirmToggle.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setConfirmToggle(null);
                  setConfirmReason("");
                }}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {isModalOpen && selectedUser && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          >
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-slate-800">{selectedUser.name || "Unknown User"}</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 transition-all duration-200 rounded-full text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                    aria-label="Close user details modal"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <p><strong className="text-slate-700">Email:</strong> {selectedUser.email || "N/A"}</p>
                  <p className="flex items-center gap-2">
                    <strong className="text-slate-700">Role:</strong> {getRoleBadge(selectedUser.role)}
                  </p>
                  <p className="flex items-center gap-2">
                    <strong className="text-slate-700">Status:</strong>
                    <span className="flex items-center gap-1.5">
                      {getStatusIcon(selectedUser.isActive)}
                      <span className="text-sm font-semibold text-slate-700">
                        {selectedUser.isActive ? "Active" : "Inactive"}
                      </span>
                    </span>
                  </p>
                  {selectedUser.toggleReason && (
                    <p className="text-red-600"><strong className="text-slate-700">Toggle Reason:</strong> {selectedUser.toggleReason}</p>
                  )}
                  <p><strong className="text-slate-700">Created At:</strong> {new Date(selectedUser.createdAt).toLocaleDateString() || "N/A"}</p>
                  {selectedUser.enrolledCourses && selectedUser.enrolledCourses.length > 0 && (
                    <div>
                      <strong className="text-slate-700">Enrolled Courses:</strong>
                      <ul className="pl-5 mt-2 space-y-2 list-disc text-slate-600">
                        {selectedUser.enrolledCourses.map((course, index) => (
                          <li key={index}>{course.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}