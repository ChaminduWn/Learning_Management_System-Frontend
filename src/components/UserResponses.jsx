import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Loader2, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";

export default function UserResponses() {
  const { user } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!user?.token) {
      toast.error("Please log in");
      setLoading(false);
      return;
    }

    const fetchMy = async () => {
      try {
        setLoading(true);
        const q = new URLSearchParams({ page, limit }).toString();
        const res = await fetch(`http://localhost:5000/api/contacts/my?${q}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed");
        setContacts(data.data || []);
      } catch (e) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMy();
  }, [page, user?.token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="h-7 w-7 text-slate-700" />
            <h1 className="text-3xl font-bold text-slate-800">My Responses</h1>
          </div>
        </motion.div>

        {contacts.length === 0 ? (
          <div className="p-12 text-center bg-white shadow rounded-2xl">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600">No messages yet.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto bg-white shadow rounded-2xl">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-800 text-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-left uppercase">Subject</th>
                    <th className="px-6 py-3 text-xs font-medium text-left uppercase">Message</th>
                    <th className="px-6 py-3 text-xs font-medium text-left uppercase">Status</th>
                    <th className="px-6 py-3 text-xs font-medium text-left uppercase">Date</th>
                    <th className="px-6 py-3 text-xs font-medium text-left uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {contacts.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-900">{c.subject}</td>
                      <td className="max-w-xs px-6 py-4 text-sm truncate text-slate-600">{c.message}</td>
                      <td className={`px-6 py-4 text-sm font-medium capitalize ${
                        c.status === "unread"
                          ? "text-blue-600"
                          : c.status === "read"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}>
                        {c.status}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelected(c)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-3 mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-indigo-600 rounded disabled:opacity-50"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span className="flex items-center text-lg font-medium text-slate-700">
                Page {page}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-indigo-600 rounded"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}

        {/* DETAIL MODAL */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl p-6 bg-white shadow-xl rounded-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">{selected.subject}</h2>
                <button onClick={() => setSelected(null)} className="text-slate-500">
                  ×
                </button>
              </div>

              <div className="mb-4">
                <h3 className="mb-2 font-medium text-slate-800">Your Message</h3>
                <p className="p-4 rounded bg-slate-50">{selected.message}</p>
              </div>

              {selected.response ? (
                <div>
                  <h3 className="mb-2 font-medium text-slate-800">Admin Response</h3>
                  <p className="p-4 rounded bg-green-50">{selected.response}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    By {selected.respondedBy?.name || "Admin"} on{" "}
                    {new Date(selected.respondedAt).toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="text-yellow-600">No response yet.</p>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}