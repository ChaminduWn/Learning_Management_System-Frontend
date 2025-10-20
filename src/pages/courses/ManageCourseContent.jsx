import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";

export default function ManageCourseContent() {
  const { courseId } = useParams();
  const { user } = useContext(AuthContext);
  const [course, setCourse] = useState(null);
  const [newModule, setNewModule] = useState({ title: "", description: "" });
  const [newContent, setNewContent] = useState({ file: null, type: "video", title: "", url: "" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCourse(data);
    } catch (err) {
      toast.error(err.message);
      navigate("/instructor/dashboard/my-courses");
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/modules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(newModule),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Module added");
      setNewModule({ title: "", description: "" });
      fetchCourse();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm("Delete module?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/modules/${moduleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success("Module deleted");
      fetchCourse();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const uploadContent = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "lms_uploads"); // Your Cloudinary preset
    formData.append("folder", "lms_course_content");

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/dnrq2pn3p/auto/upload`, { // Replace YOUR_CLOUD_NAME
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Upload failed");

      let type;
      if (data.resource_type === "video") type = "video";
      else if (data.resource_type === "image") type = "image";
      else if (data.resource_type === "raw" && data.format === "pdf") type = "pdf";
      else throw new Error("Unsupported file type");

      return { type, url: data.secure_url, title: file.name };
    } catch (err) {
      toast.error("Upload failed");
      return null;
    }
  };

  const handleAddContent = async (moduleId) => {
    let contentToAdd;
    if (newContent.file) {
      const uploaded = await uploadContent(newContent.file);
      if (!uploaded) return;
      contentToAdd = uploaded;
    } else if (newContent.url && newContent.type === "link") {
      contentToAdd = { title: newContent.title, type: "link", url: newContent.url };
    } else return;

    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/modules/${moduleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ contents: [...(course.modules.find(m => m._id === moduleId)?.contents || []), contentToAdd] }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success("Content added");
      setNewContent({ file: null, type: "video", title: "", url: "" });
      fetchCourse();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!course) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="mb-4 text-2xl font-bold">Manage Content for {course.title}</h2>

      {/* Add new module */}
      <div className="p-4 mb-6 bg-gray-100 rounded">
        <h3 className="mb-2 text-lg font-semibold">Add New Module</h3>
        <input
          value={newModule.title}
          onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
          placeholder="Module Title"
          className="w-full p-2 mb-2 mr-2 border"
        />
        <textarea
          value={newModule.description}
          onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
          placeholder="Description"
          className="w-full p-2 mb-2 mr-2 border"
        />
        <button onClick={handleAddModule} className="px-4 py-2 text-white bg-purple-700 rounded">
          Add Module
        </button>
      </div>

      {/* Modules list */}
      {course.modules.map((mod) => (
        <div key={mod._id} className="p-4 mb-6 bg-white rounded shadow">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-lg font-semibold">{mod.title}</h4>
              <p className="text-sm text-gray-600">{mod.description}</p>
              <ul className="mt-2">
                {mod.contents.map((cont, idx) => (
                  <li key={idx} className="text-sm">
                    {cont.title} ({cont.type}):{" "}
                    <a href={cont.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                      View
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => handleDeleteModule(mod._id)}
              className="px-2 py-1 text-white bg-red-600 rounded"
            >
              Delete
            </button>
          </div>

          {/* Add content */}
          <div className="p-4 mt-4 rounded bg-gray-50">
            <h5 className="mb-2 font-semibold text-md">Add Content</h5>
            <select
              value={newContent.type}
              onChange={(e) => setNewContent({ ...newContent, type: e.target.value })}
              className="p-2 mb-2 mr-2 border"
            >
              <option value="video">Video</option>
              <option value="image">Image</option>
              <option value="pdf">PDF</option>
              <option value="link">Link</option>
            </select>
            {newContent.type !== "link" ? (
              <input
                type="file"
                onChange={(e) => setNewContent({ ...newContent, file: e.target.files[0] })}
                className="p-2 mb-2 mr-2 border"
              />
            ) : (
              <>
                <input
                  value={newContent.title}
                  onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                  placeholder="Title"
                  className="p-2 mb-2 mr-2 border"
                />
                <input
                  value={newContent.url}
                  onChange={(e) => setNewContent({ ...newContent, url: e.target.value })}
                  placeholder="URL"
                  className="p-2 mb-2 mr-2 border"
                />
              </>
            )}
            <button
              onClick={() => handleAddContent(mod._id)}
              className="px-4 py-2 text-white bg-green-600 rounded"
            >
              Add Content
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}