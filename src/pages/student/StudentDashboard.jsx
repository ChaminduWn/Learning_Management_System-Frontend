import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Sidebar from "../../components/Sidebar";
import { BookOpen, CheckCircle, Clock, Trophy, ArrowRight,MessageSquare } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useContext(AuthContext);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/courses/approved", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const enrolled = data.filter((course) =>
        course.enrolledStudents.some(
          (s) => s.studentId.toString() === user._id.toString()
        )
      );

      const enrolledWithProgress = enrolled.map((course) => {
        const totalModules = course.modules.length;
        const completedModules = course.enrolledStudents.find(
          (s) => s.studentId.toString() === user._id.toString()
        ).completedModules.length;
        const progress =
          totalModules > 0
            ? Math.round((completedModules / totalModules) * 100)
            : 0;
        return { ...course, progress };
      });

      setEnrolledCourses(enrolledWithProgress.filter(c => c.progress < 100));
      setCompletedCourses(enrolledWithProgress.filter(c => c.progress === 100));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const items = [
    { key: "profile", label: "Profile", path: "/student/dashboard/profile", icon: "User" },
    { key: "enrolled", label: "Enrolled Courses", path: "/student/dashboard", icon: "BookOpen" },
    { key: "payments", label: "Payment History", path: "/student/dashboard/payments", icon: "CreditCard" },
    { key: "response", label: "Response", path: "/student/dashboard/response", icon: "MessageSquare" },

  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="w-16 h-16 border-4 border-t-4 border-gray-200 rounded-full border-t-indigo-600 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Sidebar title=" Dashboard" items={items} onSelect={(item) => navigate(item.path)} role="student" />

      <div className="flex-1 p-6 lg:p-10">
        {location.pathname === "/student/dashboard" ? (
          <div className="max-w-6xl mx-auto space-y-10">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user.name.split(" ")[0]}!</h1>
              <p className="mt-1 text-gray-600">Continue your learning journey</p>
            </div>

            {/* Completed Courses */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
                  <Trophy className="w-6 h-6 text-emerald-600" /> Completed Courses
                </h2>
                <span className="text-sm text-gray-500">{completedCourses.length} completed</span>
              </div>
              {completedCourses.length === 0 ? (
                <div className="p-8 text-center bg-white shadow-inner rounded-2xl">
                  <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600">No completed courses yet. Keep going!</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {completedCourses.map((course) => (
                    <div key={course._id} className="overflow-hidden transition-all bg-white shadow-md rounded-2xl hover:shadow-xl hover:-translate-y-1 group">
                      <div className="h-40 bg-gradient-to-br from-emerald-100 to-teal-100">
                        <img
                          src={course.thumbnail || "https://via.placeholder.com/400x200?text=Course"}
                          alt={course.title}
                          className="object-cover w-full h-full transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="mb-1 text-lg font-bold text-gray-800 line-clamp-1">{course.title}</h3>
                        <p className="mb-3 text-sm text-gray-600 line-clamp-2">{course.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                            <CheckCircle size={16} /> 100%
                          </span>
                          <button
                            onClick={() => navigate(`/student/dashboard/course/${course._id}`)}
                            className="text-sm font-medium text-indigo-600 hover:underline"
                          >
                            View <ArrowRight size={14} className="inline" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Enrolled Courses */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
                  <Clock className="w-6 h-6 text-indigo-600" /> In Progress
                </h2>
                <span className="text-sm text-gray-500">{enrolledCourses.length} active</span>
              </div>
              {enrolledCourses.length === 0 ? (
                <div className="p-8 text-center bg-white shadow-inner rounded-2xl">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600">No courses enrolled yet.</p>
                  <button
                    onClick={() => navigate("/courses")}
                    className="inline-flex items-center gap-2 px-5 py-2 mt-3 text-sm font-medium text-white transition-all shadow-md bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:scale-105"
                  >
                    Browse Courses <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {enrolledCourses.map((course) => (
                    <div key={course._id} className="overflow-hidden transition-all bg-white shadow-md rounded-2xl hover:shadow-xl hover:-translate-y-1 group">
                      <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100">
                        <img
                          src={course.thumbnail || "https://via.placeholder.com/400x200?text=Course"}
                          alt={course.title}
                          className="object-cover w-full h-full transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="mb-1 text-lg font-bold text-gray-800 line-clamp-1">{course.title}</h3>
                        <p className="mb-3 text-sm text-gray-600 line-clamp-2">{course.description}</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium text-indigo-600">{course.progress}%</span>
                          </div>
                          <div className="w-full h-2 overflow-hidden bg-gray-200 rounded-full">
                            <div
                              className="h-full transition-all duration-500 bg-gradient-to-r from-indigo-600 to-purple-600"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                          <button
                            onClick={() => navigate(`/student/dashboard/course/${course._id}`)}
                            className="w-full py-2 mt-3 text-sm font-medium text-white transition-all rounded-lg shadow-md bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:scale-105"
                          >
                            Continue Learning
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
}