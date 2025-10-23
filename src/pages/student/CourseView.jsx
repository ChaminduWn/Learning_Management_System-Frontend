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
    console.log("CourseView: Course ID:", id);
    console.log("CourseView: User:", user);
    if (!user || !user.token) {
      console.error("CourseView: No user or token found");
      toast.error("Please log in to view this course");
      navigate("/login");
      return;
    }
    fetchCourse();
  }, [id, user, navigate]);

  const fetchCourse = async () => {
    try {
      console.log("CourseView: Fetching course with token:", user.token);
      const res = await fetch(`http://localhost:5000/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      console.log("CourseView: API response:", data);
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch course");
      }
      if (!data.isEnrolled) {
        console.log("CourseView: User not enrolled in course");
        toast.error("You must enroll to view this course");
        navigate("/courses");
        return;
      }
      setCourse(data);
    } catch (err) {
      console.error("CourseView: Error fetching course:", err.message);
      toast.error(err.message);
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (moduleId) => {
    try {
      console.log("CourseView: Marking module complete, Module ID:", moduleId);
      const res = await fetch(`http://localhost:5000/api/courses/${id}/modules/${moduleId}/complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      console.log("CourseView: Mark complete response:", data);
      if (!res.ok) throw new Error(data.message || "Failed to mark module complete");
      toast.success("Module completed");
      fetchCourse(); // Refresh course data
    } catch (err) {
      console.error("CourseView: Error marking module complete:", err.message);
      toast.error(err.message);
    }
  };

  if (loading) {
    console.log("CourseView: Rendering loading state");
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!course) {
    console.log("CourseView: No course data, likely redirected");
    return null; // Redirect handled in fetchCourse
  }

  console.log("CourseView: Rendering course:", course.title);
  return (
    <div className="p-6">
      
      <h2 className="mb-4 text-2xl font-bold">{course.title}</h2>
      <div className="flex items-center justify-end gap-4 mb-4">
        <p>Progress: {course.progress}%</p>
        {course.progress === 100 && (
          <button
            onClick={() => navigate(`/student/dashboard/certificate/${id}`)}
            className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
          >
            Collect Your Certificate
          </button>
        )}
      </div>
      

      {course.modules.length === 0 ? (
        <p className="text-gray-600">No modules available for this course.</p>
      ) : (
        course.modules.map((mod) => {
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
        })
      )}
    </div>
  );
}