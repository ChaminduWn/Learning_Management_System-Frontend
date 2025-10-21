import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export default function AdminCourseApproval() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [reason, setReason] = useState("");
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/courses", {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch courses");
        const data = await res.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("Failed to load courses. Please try again.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user]);

  const approve = async (id) => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${id}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error("Failed to approve course");
      setCourses(prev => prev.map(c => c._id === id ? {...c, status: "Approved"} : c));
    } catch (error) {
      console.error("Error approving course:", error);
      alert("Failed to approve course");
    } finally {
      setIsLoading(false);
    }
  };

  const reject = async (id) => {
    if (!reason) {
      alert("Please provide a rejection reason");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${id}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("Failed to reject course");
      setCourses(prev => prev.map(c => c._id === id ? {...c, status: "Rejected", rejectReason: reason} : c));
      setReason("");
      setSelected(null);
    } catch (error) {
      console.error("Error rejecting course:", error);
      alert("Failed to reject course");
    } finally {
      setIsLoading(false);
    }
  };

  const viewCourse = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch course details");
      const data = await res.json();
      setSelectedCourse(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching course details:", error);
      setError("Failed to load course details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="container max-w-4xl p-6 mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Course Approval Dashboard</h1>
      
      {isLoading && (
        <div className="py-4 text-center">
          <div className="w-8 h-8 mx-auto border-b-2 border-purple-600 rounded-full animate-spin"></div>
        </div>
      )}

      {error && (
        <div className="p-4 mb-4 text-red-800 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {courses.map(c => (
          <div 
            key={c._id} 
            className="p-6 transition-shadow duration-200 bg-white rounded-lg shadow-md hover:shadow-lg"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-800">{c.title}</h3>
                  <span className="text-sm text-gray-500">({c.moduleCode})</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">Instructor: {c.instructorId?.name || "Unknown"}</p>
                <div className="mt-2">
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(c.status)}`}>
                    {c.status}
                  </span>
                </div>
                {c.status === "Rejected" && (
                  <p className="mt-2 text-sm text-red-600">Reason: {c.rejectReason}</p>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => viewCourse(c._id)}
                  disabled={isLoading}
                  className="px-4 py-2 text-white transition-colors duration-200 bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  View
                </button>
                <button
                  onClick={() => approve(c._id)}
                  disabled={isLoading}
                  className="px-4 py-2 text-white transition-colors duration-200 bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => setSelected(c._id)}
                  disabled={isLoading}
                  className="px-4 py-2 text-white transition-colors duration-200 bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="p-6 mt-6 bg-white rounded-lg shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">Reject Course</h3>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md resize-y focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            placeholder="Enter rejection reason"
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end mt-4 space-x-3">
            <button
              onClick={() => reject(selected)}
              disabled={isLoading}
              className="px-4 py-2 text-white transition-colors duration-200 bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Submit Rejection
            </button>
            <button
              onClick={() => { setSelected(null); setReason(""); }}
              disabled={isLoading}
              className="px-4 py-2 text-gray-800 transition-colors duration-200 bg-gray-300 rounded-md hover:bg-gray-400 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{selectedCourse.title || "Untitled Course"}</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-2xl text-gray-600 hover:text-gray-800"
                >
                  &times;
                </button>
              </div>
              <div className="space-y-4">
                <p><strong>Module Code:</strong> {selectedCourse.moduleCode || "N/A"}</p>
                <p><strong>Instructor:</strong> {selectedCourse.instructorId?.name || "Unknown"}</p>
                <p><strong>Category:</strong> {selectedCourse.category || "N/A"}</p>
                <p><strong>Price:</strong> ₹{selectedCourse.price?.toFixed(2) || "0.00"}</p>
                <p><strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedCourse.status)}`}>
                    {selectedCourse.status || "Pending"}
                  </span>
                </p>
                {selectedCourse.thumbnail && (
                  <div>
                    <strong>Thumbnail:</strong>
                    <img 
                      src={selectedCourse.thumbnail} 
                      alt="Course thumbnail" 
                      className="object-cover w-full h-48 mt-2 rounded-md"
                    />
                  </div>
                )}
                {selectedCourse.description && (
                  <p><strong>Description:</strong> {selectedCourse.description}</p>
                )}
                {selectedCourse.modules && selectedCourse.modules.length > 0 && (
                  <div>
                    <strong>Modules:</strong>
                    <ul className="pl-5 mt-2 space-y-2 list-disc">
                      {selectedCourse.modules.map((module, index) => (
                        <li key={index} className="text-gray-600">
                          <p><strong>{module.title}</strong></p>
                          {module.description && <p className="text-sm">{module.description}</p>}
                          {module.contents && module.contents.length > 0 && (
                            <ul className="pl-6 mt-1 list-circle">
                              {module.contents.map((content, contentIndex) => (
                                <li key={contentIndex} className="text-sm">
                                  {content.title} ({content.type})
                                  <a 
                                    href={content.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="ml-1 text-blue-600 hover:underline"
                                  >
                                    View Content
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedCourse.status === "Rejected" && selectedCourse.rejectReason && (
                  <p className="text-red-600"><strong>Rejection Reason:</strong> {selectedCourse.rejectReason}</p>
                )}
                {selectedCourse.enrolledStudents && selectedCourse.enrolledStudents.length > 0 && (
                  <p><strong>Enrolled Students:</strong> {selectedCourse.enrolledStudents.length}</p>
                )}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-800 transition-colors duration-200 bg-gray-300 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}