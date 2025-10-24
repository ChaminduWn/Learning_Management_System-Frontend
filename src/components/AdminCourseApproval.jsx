import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Loader2, Eye, CheckCircle, XCircle, AlertCircle, X } from "lucide-react";
import { toast } from "react-toastify";

export default function AdminCourseApproval() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [reason, setReason] = useState("");
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/courses", {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch courses");
        const data = await res.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("Failed to load courses. Please try again.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user]);

  const approve = async (id) => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${id}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error("Failed to approve course");
      setCourses(prev => prev.map(c => c._id === id ? { ...c, status: "Approved" } : c));
      toast.success("Course approved successfully");
    } catch (error) {
      console.error("Error approving course:", error);
      toast.error("Failed to approve course");
    } finally {
      setIsLoading(false);
    }
  };

  const reject = async (id) => {
    if (!reason) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${id}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("Failed to reject course");
      setCourses(prev => prev.map(c => c._id === id ? { ...c, status: "Rejected", rejectReason: reason } : c));
      toast.success("Course rejected successfully");
      setReason("");
      setSelected(null);
    } catch (error) {
      console.error("Error rejecting course:", error);
      toast.error("Failed to reject course");
    } finally {
      setIsLoading(false);
    }
  };

  const viewCourse = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch course details");
      const data = await res.json();
      setSelectedCourse(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching course details:", error);
      setError("Failed to load course details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "Rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-slate-50 via-white to-slate-100 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl">
              <CheckCircle className="w-6 h-6 text-slate-700" />
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900">
              Course Approval Dashboard
            </h1>
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

        <div className="space-y-6">
          {courses.map(c => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * courses.indexOf(c) }}
              className="p-6 transition-all duration-300 bg-white shadow-md rounded-2xl hover:shadow-xl"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-slate-800">{c.title}</h3>
                    <span className="text-sm text-slate-500">({c.moduleCode})</span>
                  </div>
                  <p className="text-sm text-slate-600">Instructor: {c.instructorId?.name || "Unknown"}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusIcon(c.status)}
                    <span className="text-sm font-semibold text-slate-700">{c.status}</span>
                  </div>
                  {c.status === "Rejected" && (
                    <p className="mt-2 text-sm text-red-600">Reason: {c.rejectReason}</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => viewCourse(c._id)}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    onClick={() => approve(c._id)}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle size={16} />
                    Approve
                  </button>
                  <button
                    onClick={() => setSelected(c._id)}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 mt-6 bg-white shadow-md rounded-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-slate-700">Reject Course</h3>
            </div>
            <textarea
              className="w-full p-4 text-sm transition-all border resize-none border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter rejection reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => reject(selected)}
                disabled={isLoading}
                className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    Submitting... <Loader2 className="w-4 h-4 animate-spin" />
                  </>
                ) : (
                  <>
                    Submit Rejection <XCircle size={16} />
                  </>
                )}
              </button>
              <button
                onClick={() => { setSelected(null); setReason(""); }}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {isModalOpen && selectedCourse && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          >
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-slate-800">{selectedCourse.title || "Untitled Course"}</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 transition-all duration-200 rounded-full text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <p><strong className="text-slate-700">Module Code:</strong> {selectedCourse.moduleCode || "N/A"}</p>
                  <p><strong className="text-slate-700">Instructor:</strong> {selectedCourse.instructorId?.name || "Unknown"}</p>
                  <p><strong className="text-slate-700">Category:</strong> {selectedCourse.category || "N/A"}</p>
                  <p><strong className="text-slate-700">Price:</strong> Rs. {selectedCourse.price?.toFixed(2) || "0.00"}</p>
                  <p className="flex items-center gap-2">
                    <strong className="text-slate-700">Status:</strong>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(selectedCourse.status)}
                      <span className="text-sm font-semibold text-slate-700">{selectedCourse.status || "Pending"}</span>
                    </span>
                  </p>
                  {selectedCourse.thumbnail && (
                    <div>
                      <strong className="text-slate-700">Thumbnail:</strong>
                      <img
                        src={selectedCourse.thumbnail}
                        alt="Course thumbnail"
                        className="object-cover w-full h-48 mt-2 rounded-xl"
                      />
                    </div>
                  )}
                  {selectedCourse.description && (
                    <p><strong className="text-slate-700">Description:</strong> {selectedCourse.description}</p>
                  )}
                  {selectedCourse.modules && selectedCourse.modules.length > 0 && (
                    <div>
                      <strong className="text-slate-700">Modules:</strong>
                      <ul className="pl-5 mt-2 space-y-3 list-disc">
                        {selectedCourse.modules.map((module, index) => (
                          <li key={index} className="text-slate-600">
                            <p className="font-semibold">{module.title}</p>
                            {module.description && <p className="text-sm">{module.description}</p>}
                            {module.contents && module.contents.length > 0 && (
                              <ul className="pl-6 mt-1 space-y-1 list-circle">
                                {module.contents.map((content, contentIndex) => (
                                  <li key={contentIndex} className="text-sm">
                                    {content.title} <span className="text-indigo-600">({content.type})</span>
                                    <a
                                      href={content.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ml-1 text-indigo-600 hover:underline"
                                    >
                                      View Content
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedCourse.status === "Rejected" && selectedCourse.rejectReason && (
                    <p className="text-red-600"><strong className="text-slate-700">Rejection Reason:</strong> {selectedCourse.rejectReason}</p>
                  )}
                  {selectedCourse.enrolledStudents && selectedCourse.enrolledStudents.length > 0 && (
                    <p><strong className="text-slate-700">Enrolled Students:</strong> {selectedCourse.enrolledStudents.length}</p>
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