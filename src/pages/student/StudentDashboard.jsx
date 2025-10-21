import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Outlet, useLocation, useNavigate } from "react-router-dom"; // add useNavigate
import { toast } from "react-toastify";

export default function StudentDashboard() {
  const { user } = useContext(AuthContext);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
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

      setEnrolledCourses(enrolledWithProgress);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isDashboardRoot = location.pathname === "/student/dashboard";

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="p-6">
      {isDashboardRoot ? (
        <>
          <h2 className="mb-4 text-2xl font-bold text-green-700">
            Welcome, Student 📚
          </h2>
          <h3 className="mb-4 text-xl font-semibold">My Enrolled Courses</h3>

          {enrolledCourses.length === 0 ? (
            <p>
              No courses enrolled yet.{" "}
              <button
                onClick={() => navigate("/courses")}
                className="text-blue-600 hover:underline"
              >
                Browse courses
              </button>
              .
            </p>
          ) : (
            <ul className="space-y-6">
              {enrolledCourses.map((course) => (
                <li
                  key={course._id}
                  className="p-4 bg-white border rounded shadow-sm"
                >
                  <div className="flex flex-col space-y-2">
                    <h4 className="text-lg font-semibold">{course.title}</h4>
                    <p className="text-gray-700">{course.description}</p>
                    <p className="text-sm text-gray-600">
                      Progress: {course.progress}%
                    </p>
                    <div>
                      <button
                        onClick={() =>
                          navigate(`/student/dashboard/course/${course._id}`)
                        }
                        className="inline-block px-4 py-2 text-white transition bg-green-600 rounded hover:bg-green-700"
                      >
                        View Course
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <Outlet />
      )}
    </div>
  );
}
