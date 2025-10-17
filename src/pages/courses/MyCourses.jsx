import React, { useContext, useEffect, useRef, useState, useCallback} from "react";
import { AuthContext } from "../../context/AuthContext";
import CourseCard from "../../components/CourseCard";
import NotificationModal from "../../components/NotificationModal";
import { useNavigate } from "react-router-dom";

export default function MyCourses() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const prevStatusRef = useRef({});
  const [notifications, setNotifications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();


  const fetchCourses = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("http://localhost:5000/api/courses/my-courses", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setCourses(data);

      // detect status changes
      const newNotifs = [];
      data.forEach(c => {
        const prev = prevStatusRef.current[c._id];
        if (prev && prev !== c.status) {
          // status changed
          if (c.status === "Approved") {
            newNotifs.push({ title: `Course Approved: ${c.title}`, body: "Your course was approved by Admin.", time: Date.now() });
          } else if (c.status === "Rejected") {
            newNotifs.push({ title: `Course Rejected: ${c.title}`, body: `Reason: ${c.rejectReason || "N/A"}`, time: Date.now() });
          }
        }
        prevStatusRef.current[c._id] = c.status;
      });

      if (newNotifs.length) {
        setNotifications(prev => [...newNotifs, ...prev]);
        setModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => {
    fetchCourses();
    // poll every 10s for status updates
    const id = setInterval(fetchCourses, 10000);
    return () => clearInterval(id);
  }, [fetchCourses]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    await fetch(`http://localhost:5000/api/courses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.token}` },
    });
    setCourses(prev => prev.filter(c => c._id !== id));
  };

  const handleEdit = (course) => {
  navigate(`/instructor/dashboard/edit-course/${course._id}`);
};


  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold text-purple-700">My Courses</h1>
      <div className="grid grid-cols-1 gap-4">
        {courses.length === 0 && <div className="text-gray-600">No courses yet.</div>}
        {courses.map(c => (
          <CourseCard key={c._id} course={c} onDelete={handleDelete} onEdit={handleEdit} />
        ))}
      </div>

      <NotificationModal open={modalOpen} onClose={() => setModalOpen(false)} messages={notifications} />
    </div>
  );
}
