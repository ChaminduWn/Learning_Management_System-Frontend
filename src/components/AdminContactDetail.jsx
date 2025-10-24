import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { FaArrowLeft, FaCheck, FaReply } from "react-icons/fa";

export default function AdminContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    fetchContact();
  }, [id]);

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
      toast.error(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

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
      toast.error(err.message);
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
      toast.error(err.message);
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

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!contact) return <div className="p-8 text-center text-red-600">Not found</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/admin/dashboard/contacts")}
          className="flex items-center gap-2 mb-4 text-gray-600 hover:text-gray-900"
        >
          <FaArrowLeft /> Back
        </button>
        <h1 className="mb-6 text-3xl font-bold text-gray-800">Contact Details</h1>

        <div className="overflow-hidden bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h2 className="text-xl font-semibold">{contact.name}</h2>
                <p className="text-gray-600">{contact.email}</p>
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
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(contact.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <h3 className="mt-4 text-lg font-medium">Subject: {contact.subject}</h3>
          </div>

          <div className="p-6">
            <h3 className="mb-3 text-lg font-medium">Message</h3>
            <div className="p-4 rounded-lg bg-gray-50">
              <p className="whitespace-pre-wrap">{contact.message}</p>
            </div>
          </div>

          {contact.status !== "responded" && (
            <div className="p-6 border-t bg-gray-50">
              <h3 className="mb-3 text-lg font-medium">Add Response</h3>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows="6"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Type your reply..."
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleUpdate}
                  disabled={updating || !responseText.trim()}
                  className={`px-6 py-2 text-white rounded-lg flex items-center gap-2 ${
                    updating || !responseText.trim()
                      ? "bg-gray-400"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  <FaCheck /> {updating ? "Saving..." : "Send Response"}
                </button>
                <button
                  onClick={() => handleStatusChange("read")}
                  disabled={updating || contact.status === "read"}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Mark as Read
                </button>
              </div>
            </div>
          )}

          {contact.response && (
            <div className="p-6 border-t bg-green-50">
              <h3 className="mb-3 text-lg font-medium">Your Response</h3>
              <div className="p-4 bg-white border rounded-lg">
                <p className="whitespace-pre-wrap">{contact.response}</p>
                <p className="mt-2 text-sm text-gray-600">
                  By {contact.respondedBy?.name || "Admin"} on{" "}
                  {new Date(contact.respondedAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}