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
      const res = await fetch("http://localhost:5000/api/courses/approved", {
        headers: user ? { Authorization: `Bearer ${user.token}` } : {},
      });
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

  const handleEnroll = async (courseId) => {
    if (!user || user.role !== "Student") {
      toast.error("Please log in as a student to enroll");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/enroll`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Successfully enrolled!");
      navigate(`/student/dashboard/course/${courseId}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="mb-4 text-2xl font-bold">Available Courses</h2>
      <ul className="space-y-6">
        {courses.map((course) => (
          <li key={course._id} className="p-4 bg-white border rounded shadow-sm">
            <h3 className="text-xl font-semibold">{course.title}</h3>
            <p className="text-gray-700">{course.description}</p>
            <p className="mt-1 text-sm text-gray-600">Price: Free</p>
            <button
              onClick={() => handleEnroll(course._id)}
              className="px-4 py-2 mt-4 text-white bg-green-600 rounded hover:bg-green-700"
            >
              Enroll
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}