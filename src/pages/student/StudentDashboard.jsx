import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Sidebar from "../../components/Sidebar"; 

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
    { key: "profile", label: "Profile", path: "/student/dashboard/profile" },
    { key: "enrolled", label: "Enrolled Courses", path: "/student/dashboard" },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar title="Student 📚" items={items} onSelect={(item) => navigate(item.path)} role="student" />
      <div className="flex-1 p-6 bg-gray-100">
        {location.pathname === "/student/dashboard" ? (
          <>
            <h2 className="mb-4 text-2xl font-bold text-green-700">
              Welcome, Student 📚
            </h2>
            
            <h3 className="mb-4 text-xl font-semibold">Completed Courses</h3>
            {completedCourses.length === 0 ? (
              <p>No completed courses yet.</p>
            ) : (
              <ul className="space-y-6">
                {completedCourses.map((course) => (
                  <li key={course._id} className="p-4 bg-white border rounded shadow-sm">
                    <h4 className="text-lg font-semibold">{course.title}</h4>
                    <p className="text-gray-700">{course.description}</p>
                    <p className="text-sm text-gray-600">Progress: {course.progress}%</p>
                    <button
                      onClick={() => navigate(`/student/dashboard/course/${course._id}`)}
                      className="inline-block px-4 py-2 text-white transition bg-green-600 rounded hover:bg-green-700"
                    >
                      View Course
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <h3 className="mt-8 mb-4 text-xl font-semibold">Enrolled Courses</h3>
            {enrolledCourses.length === 0 ? (
              <p>
                No courses enrolled yet.{" "}
                <button onClick={() => navigate("/courses")} className="text-blue-600 hover:underline">
                  Browse courses
                </button>.
              </p>
            ) : (
              <ul className="space-y-6">
                {enrolledCourses.map((course) => (
                  <li key={course._id} className="p-4 bg-white border rounded shadow-sm">
                    <h4 className="text-lg font-semibold">{course.title}</h4>
                    <p className="text-gray-700">{course.description}</p>
                    <p className="text-sm text-gray-600">Progress: {course.progress}%</p>
                    <button
                      onClick={() => navigate(`/student/dashboard/course/${course._id}`)}
                      className="inline-block px-4 py-2 text-white transition bg-green-600 rounded hover:bg-green-700"
                    >
                      View Course
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
}