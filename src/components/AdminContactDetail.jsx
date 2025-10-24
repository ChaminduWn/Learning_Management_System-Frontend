import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, CheckCircle, Send, MessageSquare } from "lucide-react";
import { toast } from "react-toastify";

export default function AdminContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    const fetchContact = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/contacts/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setContact(data.data);
        setResponseText(data.data.response || "");
      } catch (err) {
        toast.error(err.message || "Failed to load contact");
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchContact();
  }, [id, user]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`http://localhost:5000/api/contacts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ status: "responded", response: responseText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setContact(data.data);
      toast.success("Response saved!");
    } catch (err) {
      toast.error(err.message || "Failed to save response");
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`http://localhost:5000/api/contacts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setContact(data.data);
      toast.success("Status updated");
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  // Auto-mark as read
  useEffect(() => {
    if (contact?.status === "unread") {
      handleStatusChange("read");
    }
  }, [contact]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-xl text-slate-600"
        >
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          Loading contact details...
        </motion.div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8 text-center bg-white shadow-md rounded-2xl"
        >
          <p className="text-lg font-medium text-red-600">Contact not found</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-slate-50 via-white to-slate-100 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => navigate("/admin/dashboard/contacts")}
            className="flex items-center gap-2 mb-4 transition-all duration-200 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Contacts
          </button>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl">
              <MessageSquare className="w-6 h-6 text-slate-700" />
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900">
              Contact Details
            </h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden bg-white shadow-md rounded-2xl"
        >
          <div className="p-6 border-b border-slate-200">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">{contact.name}</h2>
                <p className="text-slate-600">{contact.email}</p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                    contact.status === "responded"
                      ? "bg-green-100 text-green-800"
                      : contact.status === "read"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {contact.status}
                </span>
                <p className="mt-1 text-sm text-slate-500">
                  {new Date(contact.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <h3 className="mt-4 text-lg font-medium text-slate-800">
              Subject: {contact.subject}
            </h3>
          </div>

          <div className="p-6">
            <h3 className="mb-3 text-lg font-medium text-slate-800">Message</h3>
            <div className="p-4 rounded-lg bg-slate-50">
              <p className="whitespace-pre-wrap text-slate-600">{contact.message}</p>
            </div>
          </div>

          {contact.status !== "responded" && (
            <div className="p-6 border-t border-slate-200 bg-slate-50">
              <h3 className="mb-3 text-lg font-medium text-slate-800">Add Response</h3>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows="6"
                className="w-full p-3 text-sm transition-all border rounded-lg border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Type your reply..."
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleUpdate}
                  disabled={updating || !responseText.trim()}
                  className={`flex items-center gap-2 px-6 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 ${
                    updating || !responseText.trim()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 to-green-700 hover:shadow-lg hover:scale-105"
                  }`}
                >
                  <Send size={16} />
                  {updating ? (
                    <>
                      Saving... <Loader2 className="w-4 h-4 animate-spin" />
                    </>
                  ) : (
                    "Send Response"
                  )}
                </button>
                <button
                  onClick={() => handleStatusChange("read")}
                  disabled={updating || contact.status === "read"}
                  className="flex items-center gap-2 px-6 py-2 text-sm font-medium transition-all duration-200 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle size={16} />
                  Mark as Read
                </button>
              </div>
            </div>
          )}

          {contact.response && (
            <div className="p-6 border-t border-slate-200 bg-green-50">
              <h3 className="mb-3 text-lg font-medium text-slate-800">Your Response</h3>
              <div className="p-4 bg-white border rounded-lg border-slate-200">
                <p className="whitespace-pre-wrap text-slate-600">{contact.response}</p>
                <p className="mt-2 text-sm text-slate-500">
                  By {contact.respondedBy?.name || "Admin"} on{" "}
                  {new Date(contact.respondedAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}