import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Play, CheckCircle, Lock, FileText, Video, Image, Link, Award, ArrowLeft } from "lucide-react";

export default function CourseView() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.token) {
      toast.error("Please log in to view this course");
      navigate("/login");
      return;
    }
    fetchCourse();
  }, [id, user, navigate]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch course");
      if (!data.isEnrolled) {
        toast.error("You must enroll to view this course");
        navigate("/courses");
        return;
      }
      setCourse(data);
    } catch (err) {
      toast.error(err.message);
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (moduleId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${id}/modules/${moduleId}/complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Module completed!");
      fetchCourse();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="w-16 h-16 border-4 border-t-4 border-gray-200 rounded-full border-t-indigo-600 animate-spin"></div>
      </div>
    );
  }

  if (!course) return null;

  const isModuleCompleted = (modId) => course.completedModules.includes(modId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <div className="container px-4 py-8 mx-auto max-w-7xl">
        {/* Back + Progress */}
        <div className="flex flex-col items-start justify-between mb-6 sm:flex-row sm:items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-4 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            <ArrowLeft size={18} /> Back to Courses
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 overflow-hidden bg-gray-200 rounded-full">
                <div
                  className="h-full transition-all duration-500 bg-gradient-to-r from-indigo-600 to-purple-600"
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{course.progress}%</span>
            </div>
            {course.progress === 100 && (
              <button
                onClick={() => navigate(`/student/dashboard/certificate/${id}`)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all shadow-md bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl hover:shadow-lg hover:scale-105"
              >
                <Award size={18} /> Get Certificate
              </button>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-8 lg:grid-cols-3"
        >
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            <h1 className="text-3xl font-bold text-gray-800">{course.title}</h1>
            <p className="text-gray-600">{course.description}</p>

            {course.modules.length === 0 ? (
              <div className="p-8 text-center bg-white shadow-inner rounded-2xl">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600">No modules available yet.</p>
              </div>
            ) : (
              course.modules.map((mod, idx) => {
                const completed = isModuleCompleted(mod._id);
                return (
                  <motion.div
                    key={mod._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="overflow-hidden bg-white shadow-md rounded-2xl"
                  >
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-800">{mod.title}</h3>
                        {completed ? (
                          <CheckCircle className="w-6 h-6 text-emerald-600" />
                        ) : (
                          <Lock className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <p className="mt-1 text-gray-600">{mod.description}</p>
                    </div>

                    <div className="p-6 space-y-6">
                      {mod.contents.map((cont, cIdx) => (
                        <div key={cIdx} className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            {cont.type === "video" && <Video className="w-5 h-5 text-indigo-600" />}
                            {cont.type === "image" && <Image className="w-5 h-5 text-purple-600" />}
                            {cont.type === "pdf" && <FileText className="w-5 h-5 text-emerald-600" />}
                            {cont.type === "link" && <Link className="w-5 h-5 text-blue-600" />}
                            <h5 className="font-medium text-gray-800">{cont.title || "Content"}</h5>
                          </div>

                          {cont.type === "video" && (
                            <video src={cont.url} controls className="w-full rounded-lg shadow-sm" />
                          )}
                          {cont.type === "image" && (
                            <img src={cont.url} alt={cont.title} className="w-full rounded-lg shadow-sm" />
                          )}
                          {cont.type === "pdf" && (
                            <iframe src={cont.url} className="w-full rounded-lg shadow-sm h-96" title="PDF" />
                          )}
                          {cont.type === "link" && (
                            <a
                              href={cont.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                            >
                              Open Link <Link size={14} />
                            </a>
                          )}
                        </div>
                      ))}

                      <button
                        onClick={() => handleMarkComplete(mod._id)}
                        disabled={completed}
                        className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                          completed
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:shadow-lg hover:scale-105"
                        }`}
                      >
                        {completed ? (
                          <>Completed <CheckCircle size={18} /></>
                        ) : (
                          <>Mark as Complete <Play size={18} /></>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="p-6 bg-white shadow-md rounded-2xl">
              <h3 className="mb-4 text-lg font-bold text-gray-800">Course Overview</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{course.duration || "Self-paced"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Modules</span>
                  <span className="font-medium">{course.modules.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price</span>
                  <span className="font-medium text-emerald-600">
                    {course.price === 0 ? "Free" : `${course.price} LKR`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}