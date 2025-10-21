import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";

export default function CourseView() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Fetching course with ID:", id); // Debug log
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      console.log("Sending request with token:", user.token); // Debug log
      const res = await fetch(`http://localhost:5000/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      console.log("API response:", data); // Debug log
      if (!res.ok) throw new Error(data.message || "Failed to fetch course");
      if (!data.isEnrolled) {
        toast.error("You must enroll to view this course");
        navigate("/courses");
        return;
      }
      setCourse(data);
    } catch (err) {
      console.error("Error in fetchCourse:", err); // Debug log
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
      toast.success("Module completed");
      fetchCourse(); // Refresh course data
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!course) return null; // Redirect handled in fetchCourse

  return (
    <div className="p-6">
      <h2 className="mb-4 text-2xl font-bold">{course.title}</h2>
      <p>Progress: {course.progress}%</p>

      {course.modules.map((mod) => {
        const isCompleted = course.completedModules.some((m) => m.toString() === mod._id);
        return (
          <div key={mod._id} className="p-4 mb-6 border rounded shadow-sm">
            <h4 className="text-lg font-semibold">{mod.title}</h4>
            <p>{mod.description}</p>

            {mod.contents.map((cont, idx) => (
              <div key={idx} className="mt-2">
                <h5>{cont.title || "Content"}</h5>
                {cont.type === "video" && <video src={cont.url} controls width="400" />}
                {cont.type === "image" && <img src={cont.url} alt={cont.title} width="400" />}
                {cont.type === "pdf" && (
                  <iframe src={cont.url} width="400" height="300" title="PDF"></iframe>
                )}
                {cont.type === "link" && (
                  <a href={cont.url} target="_blank" rel="noopener noreferrer">
                    Open Link
                  </a>
                )}
              </div>
            ))}

            <button
              onClick={() => handleMarkComplete(mod._id)}
              disabled={isCompleted}
              className="px-4 py-2 mt-4 text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isCompleted ? "Completed" : "Mark Complete"}
            </button>
          </div>
        );
      })}
    </div>
  );
}