import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

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

        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();
        setContacts(data.data || []);
        setError("");
      } catch (err) {
        setError(err.message);
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

  if (loading) return <p className="p-8">Loading...</p>;
  if (error) return <p className="p-8 text-red-600">Error: {error}</p>;

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h2 className="mb-6 text-3xl font-bold text-purple-700">Contact Messages</h2>

      <div className="flex flex-wrap gap-4 mb-6">
        {/* <input
          type="text"
          placeholder="Search by name, email, subject..."
          value={search}
          onChange={handleSearchChange}
          className="w-64 p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
        /> */}
        <select
          value={statusFilter}
          onChange={handleStatusChange}
          className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="responded">Responded</option>
        </select>
      </div>

      {contacts.length === 0 ? (
        <p>No messages found.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-purple-100">
              <tr>
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Subject</th>
                <th className="p-3 border">Message</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr
                  key={c._id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate(`/admin/dashboard/contacts/${c._id}`)}
                >
                  <td className="p-3 border">{c.name}</td>
                  <td className="p-3 border">{c.email}</td>
                  <td className="p-3 border">{c.subject}</td>
                  <td className="max-w-xs p-3 truncate border">{c.message}</td>
                  <td
                    className={`p-3 border capitalize font-medium ${
                      c.status === "unread"
                        ? "text-blue-600"
                        : c.status === "read"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {c.status}
                  </td>
                  <td className="p-3 text-sm border">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-center gap-3 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
          className="px-4 py-2 text-white bg-purple-600 rounded-lg disabled:bg-gray-400"
        >
          Previous
        </button>
        <span className="text-lg font-medium">Page {page}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 text-white bg-purple-600 rounded-lg"
        >
          Next
        </button>
      </div>
    </div>
  );
}