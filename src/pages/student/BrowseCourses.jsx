import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function BrowseCourses() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/courses/approved");
      const data = await res.json();

      if (!Array.isArray(data)) {
        toast.error(data.message || "Unexpected response format");
        setCourses([]);
      } else {
        setCourses(data);
      }
    } catch (err) {
      toast.error("Error loading courses");
    } finally {
      setLoading(false);
    }
  };

  // Mock enroll function (no backend call yet)
  const handleEnroll = (courseId) => {
    toast.info("Enrollment feature coming soon!");
    // Optional: navigate to a course preview or detail page
    navigate(`/student/dashboard/course/${courseId}`);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="mb-4 text-2xl font-bold">Available Courses</h2>
      <ul className="space-y-4">
        {courses.map((course) => (
          <li key={course._id} className="p-4 border rounded">
            <h3 className="text-xl font-semibold">{course.title}</h3>
            <p className="text-gray-700">{course.description}</p>
            <p className="mt-1 text-sm text-gray-600">Price: ${course.price}</p>
            <button
              onClick={() => handleEnroll(course._id)}
              className="px-4 py-2 mt-2 text-white bg-green-600 rounded hover:bg-green-700"
            >
              Enroll
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
