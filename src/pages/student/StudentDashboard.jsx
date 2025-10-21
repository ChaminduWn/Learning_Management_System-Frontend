import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function StudentDashboard() {
  const { user } = useContext(AuthContext);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

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

      // Filter courses where the student is enrolled
      const enrolled = data.filter((course) =>
        course.enrolledStudents.some((s) => s.studentId.toString() === user._id.toString())
      );
      setEnrolledCourses(enrolled);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="mb-4 text-2xl font-bold text-green-700">Welcome, Student 📚</h2>
      <h3 className="mb-4 text-xl font-semibold">My Enrolled Courses</h3>
      {enrolledCourses.length === 0 ? (
        <p>No courses enrolled yet. <Link to="/courses" className="text-blue-600">Browse courses</Link>.</p>
      ) : (
        <ul className="space-y-4">
          {enrolledCourses.map((course) => (
            <li key={course._id} className="p-4 border rounded">
              <h4 className="text-lg font-semibold">{course.title}</h4>
              <p className="text-gray-700">{course.description}</p>
              <p className="text-sm text-gray-600">Progress: {course.progress}%</p>
              <Link
                to={`/student/dashboard/course/${course._id}`}
                className="px-4 py-2 mt-2 text-white bg-green-600 rounded hover:bg-green-700"
              >
                View Course
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}