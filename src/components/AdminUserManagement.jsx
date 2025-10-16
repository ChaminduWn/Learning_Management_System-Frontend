import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function AdminUserManagement() {
  
  const [users, setUsers] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetch("http://localhost:5000/api/auth", {
      headers: { Authorization: `Bearer ${user?.token}` },
    })
      .then((res) => res.json())
      .then(setUsers);
  }, [user]);

  const toggleStatus = async (id) => {
    await fetch(`http://localhost:5000/api/auth/${id}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${user?.token}` },
    });
    setUsers(users.map(u => (u._id === id ? { ...u, isActive: !u.isActive } : u)));
  };

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold text-purple-700">User Management</h1>
      <table className="min-w-full overflow-hidden bg-white rounded-lg shadow-md">
        <thead className="text-white bg-purple-700">
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Role</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">{u.name}</td>
              <td className="px-4 py-2">{u.email}</td>
              <td className="px-4 py-2">{u.role}</td>
              <td className="px-4 py-2">{u.isActive ? "Active" : "Inactive"}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => toggleStatus(u._id)}
                  className={`px-3 py-1 rounded-md text-white ${
                    u.isActive ? "bg-red-500" : "bg-green-500"
                  }`}
                >
                  {u.isActive ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

