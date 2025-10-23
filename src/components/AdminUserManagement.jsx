import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Search } from "lucide-react";

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
      alert("Please provide a reason for deactivation");
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
      setConfirmToggle(null);
      setConfirmReason("");
    } catch (error) {
      console.error("Error toggling user status:", error);
      setError("Failed to toggle user status. Please try again.");
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

  const getStatusColor = (status) => {
    return status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { bg: "bg-purple-100", text: "text-purple-800", icon: "👑" },
      instructor: { bg: "bg-blue-100", text: "text-blue-800", icon: "👨‍🏫" },
      student: { bg: "bg-gray-100", text: "text-gray-800", icon: "🎓" }
    };
    const config = roleConfig[role?.toLowerCase()] || roleConfig.student;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        <span>{config.icon}</span>
        <span>{role}</span>
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
    <div className="container max-w-6xl p-6 mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">User Management Dashboard</h1>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
          <span className="font-semibold">Legend:</span>
          <span className="inline-flex items-center gap-1">👑 Admin</span>
          <span className="inline-flex items-center gap-1">👨‍🏫 Instructor</span>
          <span className="inline-flex items-center gap-1">🎓 Student</span>
        </div>
      </div>

      {isLoading && (
        <div className="py-4 text-center">
          <div className="w-8 h-8 mx-auto border-b-2 border-purple-600 rounded-full animate-spin"></div>
        </div>
      )}

      {error && (
        <div className="p-4 mb-4 text-red-800 bg-red-100 rounded-md">{error}</div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full">
          <thead className="text-white bg-purple-700">
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
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  {searchTerm ? "No users found matching your search" : "No users available"}
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    {getRoleBadge(u.role)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        u.isActive
                      )}`}
                    >
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => viewUser(u._id)}
                        disabled={isLoading}
                        className="px-3 py-1 text-white transition-colors duration-200 bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        aria-label={`View details for ${u.name}`}
                      >
                        View
                      </button>
                      <button
                        onClick={() => setConfirmToggle(u)}
                        disabled={isLoading}
                        className={`px-3 py-1 text-white rounded-md transition-colors duration-200 ${
                          u.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                        } disabled:opacity-50`}
                        aria-label={`${u.isActive ? "Deactivate" : "Activate"} ${u.name}`}
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {confirmToggle && (
        <div className="p-6 mt-6 bg-white rounded-lg shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            {confirmToggle.isActive ? "Deactivate" : "Activate"} User: {confirmToggle.name}
          </h3>
          {confirmToggle.isActive && (
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md resize-y focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="Enter reason for deactivation"
              value={confirmReason}
              onChange={(e) => setConfirmReason(e.target.value)}
              rows={4}
            />
          )}
          <div className="flex justify-end mt-4 space-x-3">
            <button
              onClick={() => toggleStatus(confirmToggle._id)}
              disabled={isLoading}
              className={`px-4 py-2 text-white rounded-md transition-colors duration-200 ${
                confirmToggle.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
              } disabled:opacity-50`}
            >
              Confirm
            </button>
            <button
              onClick={() => {
                setConfirmToggle(null);
                setConfirmReason("");
              }}
              disabled={isLoading}
              className="px-4 py-2 text-gray-800 transition-colors duration-200 bg-gray-300 rounded-md hover:bg-gray-400 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{selectedUser.name || "Unknown User"}</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-2xl text-gray-600 hover:text-gray-800"
                  aria-label="Close user details modal"
                >
                  &times;
                </button>
              </div>
              <div className="space-y-4">
                <p><strong>Email:</strong> {selectedUser.email || "N/A"}</p>
                <p className="flex items-center gap-2">
                  <strong>Role:</strong> {getRoleBadge(selectedUser.role)}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      selectedUser.isActive
                    )}`}
                  >
                    {selectedUser.isActive ? "Active" : "Inactive"}
                  </span>
                </p>
                {selectedUser.toggleReason && (
                  <p className="text-red-600"><strong>Toggle Reason:</strong> {selectedUser.toggleReason}</p>
                )}
                <p><strong>Created At:</strong> {new Date(selectedUser.createdAt).toLocaleDateString() || "N/A"}</p>
                {selectedUser.enrolledCourses && selectedUser.enrolledCourses.length > 0 && (
                  <div>
                    <strong>Enrolled Courses:</strong>
                    <ul className="pl-5 mt-2 space-y-2 list-disc">
                      {selectedUser.enrolledCourses.map((course, index) => (
                        <li key={index} className="text-gray-600">{course.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-800 transition-colors duration-200 bg-gray-300 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}