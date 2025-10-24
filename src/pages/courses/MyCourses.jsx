import React, { useContext, useEffect, useRef, useState, useCallback } from "react";
import { AuthContext } from "../../context/AuthContext";
import CourseCard from "../../components/CourseCard";
import NotificationModal from "../../components/NotificationModal";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Plus, AlertCircle, CheckCircle, XCircle, Clock, Edit, Trash2, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function MyCourses() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const prevStatusRef = useRef({});
  const [notifications, setNotifications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchCourses = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("http://localhost:5000/api/courses/my-courses", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setCourses(data);

      const newNotifs = [];
      data.forEach((c) => {
        const prev = prevStatusRef.current[c._id];
        if (prev && prev !== c.status) {
          if (c.status === "Approved") {
            newNotifs.push({ title: `Course Approved: ${c.title}`, body: "Your course is now live!", time: Date.now(), type: "success" });
          } else if (c.status === "Rejected") {
            newNotifs.push({ title: `Course Rejected: ${c.title}`, body: c.rejectReason || "No reason provided.", time: Date.now(), type: "error" });
          } else if (c.status === "Pending") {
            newNotifs.push({ title: `Review in Progress: ${c.title}`, body: "Admin is reviewing your course.", time: Date.now(), type: "info" });
          }
        }
        prevStatusRef.current[c._id] = c.status;
      });

      if (newNotifs.length) {
        setNotifications((prev) => [...newNotifs, ...prev]);
        setModalOpen(true);
      }
    } catch (err) {
      toast.error("Failed to load courses");
    }
  }, [user]);

  useEffect(() => {
    fetchCourses();
    const id = setInterval(fetchCourses, 10000);
    return () => clearInterval(id);
  }, [fetchCourses]);

  const confirmDelete = (course) => {
    setCourseToDelete(course);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!courseToDelete) return;
    try {
      await fetch(`http://localhost:5000/api/courses/${courseToDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setCourses((prev) => prev.filter((c) => c._id !== courseToDelete._id));
      toast.success(`"${courseToDelete.title}" deleted successfully`);
    } catch (err) {
      toast.error("Failed to delete course");
    } finally {
      setDeleteModalOpen(false);
      setCourseToDelete(null);
    }
  };

  const handleEdit = (course) => navigate(`/instructor/dashboard/edit-course/${course._id}`);
  const handleManageContent = (course) => navigate(`/instructor/dashboard/manage-content/${course._id}`);

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved": return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case "Rejected": return <XCircle className="w-5 h-5 text-red-600" />;
      case "Pending": return <Clock className="w-5 h-5 text-amber-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-gray-50 to-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex flex-col items-start justify-between mb-8 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Courses</h1>
            <p className="mt-1 text-gray-600">Manage, edit, and track your published courses</p>
          </div>
          <button
            onClick={() => navigate("/instructor/dashboard/add")}
            className="flex items-center gap-2 px-5 py-3 mt-4 font-medium text-white transition-all shadow-md bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:scale-105 sm:mt-0"
          >
            <Plus size={20} />
            Create New Course
          </button>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="p-12 text-center bg-white shadow-inner rounded-2xl">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-gray-100 rounded-full">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-700">No courses yet</p>
            <p className="mt-1 text-gray-500">Start by creating your first course!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <div
                key={c._id}
                className="overflow-hidden transition-all duration-300 bg-white shadow-md rounded-2xl hover:shadow-xl hover:-translate-y-1 group"
              >
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    src={c.thumbnail || "https://via.placeholder.com/400x200?text=Course"}
                    alt={c.title}
                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                  />
                  <div className="absolute flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-black rounded-full top-3 left-3 bg-opacity-70">
                    {getStatusIcon(c.status)}
                    <span>{c.status}</span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="mb-2 text-lg font-bold text-gray-800 line-clamp-2">{c.title}</h3>
                  <p className="mb-3 text-sm text-gray-600 line-clamp-2">{c.description}</p>

                  <div className="flex items-center justify-between mb-4 text-sm">
                    <span className="font-medium text-emerald-600">
                      {c.price === 0 ? "Free" : `Rs.${c.price.toLocaleString()}`}
                    </span>
                    <span className="text-gray-500">{c.enrolledCount || 0} enrolled</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(c)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-600 transition-all bg-indigo-50 rounded-lg hover:bg-indigo-100"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleManageContent(c)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-purple-600 transition-all bg-purple-50 rounded-lg hover:bg-purple-100"
                    >
                      <FileText size={16} />
                      Content
                    </button>
                    <button
                      onClick={() => confirmDelete(c)}
                      className="p-2 text-red-600 transition-all rounded-lg bg-red-50 hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notification Modal */}
        <NotificationModal open={modalOpen} onClose={() => setModalOpen(false)} messages={notifications} />

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl"
            >
              <div className="flex items-center mb-4 text-red-600">
                <AlertCircle size={24} className="mr-2" />
                <h2 className="text-xl font-bold">Confirm Delete</h2>
              </div>
              <p className="mb-6 text-gray-700">
                Are you sure you want to delete <strong>"{courseToDelete?.title}"</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => { setDeleteModalOpen(false); setCourseToDelete(null); }}
                  className="px-5 py-2 font-medium text-gray-700 transition-all bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-5 py-2 font-medium text-white transition-all rounded-lg shadow-md bg-gradient-to-r from-red-600 to-red-700 hover:shadow-lg hover:scale-105"
                >
                  Delete Course
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}