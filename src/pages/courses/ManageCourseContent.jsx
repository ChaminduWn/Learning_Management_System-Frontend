import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";

// Custom Confirmation Dialog Component
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, itemName, itemType }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-sm p-6 mx-4 bg-white rounded-lg shadow-xl">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">
          {title}
        </h3>
        <p className="mb-6 text-gray-600">
          Are you sure you want to delete {itemType} "{itemName}"?
          {itemType === "module" && " All associated content will be removed."}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 transition bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white transition bg-red-600 rounded-lg hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ManageCourseContent() {
  const { courseId } = useParams();
  const { user } = useContext(AuthContext);
  const [course, setCourse] = useState(null);
  const [newModule, setNewModule] = useState({ title: "", description: "" });
  const [contentForms, setContentForms] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [editingModule, setEditingModule] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    onConfirm: () => {},
    title: "",
    itemName: "",
    itemType: "",
  });
  const navigate = useNavigate();
  const fileInputRefs = useRef({});

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
    if (!newModule.title.trim()) {
      toast.error("Module title is required");
      return;
    }
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
      toast.success("Module added successfully");
      setNewModule({ title: "", description: "" });
      fetchCourse();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdateModule = async (moduleId) => {
    if (!editingModule.title.trim()) {
      toast.error("Module title is required");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/modules/${moduleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          title: editingModule.title,
          description: editingModule.description,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success("Module updated successfully");
      setEditingModule(null);
      fetchCourse();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteModule = (moduleId, moduleTitle) => {
    setConfirmDialog({
      isOpen: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/courses/${courseId}/modules/${moduleId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${user.token}` },
          });
          if (!res.ok) throw new Error((await res.json()).message);
          toast.success("Module deleted successfully");
          fetchCourse();
        } catch (err) {
          toast.error(err.message);
        } finally {
          setConfirmDialog({ isOpen: false, onConfirm: () => {}, title: "", itemName: "", itemType: "" });
        }
      },
      onClose: () => setConfirmDialog({ isOpen: false, onConfirm: () => {}, title: "", itemName: "", itemType: "" }),
      title: "Confirm Module Deletion",
      itemName: moduleTitle,
      itemType: "module",
    });
  };

  const uploadContent = async (file, moduleId) => {
    if (!file) return null;
    setUploadProgress(prev => ({ ...prev, [moduleId]: 0 }));
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "lms_uploads");
    formData.append("folder", "lms_course_content");
    try {
      setUploadProgress(prev => ({ ...prev, [moduleId]: 30 }));
      const res = await fetch(`https://api.cloudinary.com/v1_1/dnrq2pn3p/auto/upload`, {
        method: "POST",
        body: formData,
      });
      setUploadProgress(prev => ({ ...prev, [moduleId]: 70 }));
      const data = await res.json();
      if (!res.ok) throw new Error("Upload failed");
      let type;
      if (data.resource_type === "video") type = "video";
      else if (data.resource_type === "image") type = "image";
      else if (data.resource_type === "raw" && data.format === "pdf") type = "pdf";
      else throw new Error("Unsupported file type");
      setUploadProgress(prev => ({ ...prev, [moduleId]: 100 }));
      setTimeout(() => {
        setUploadProgress(prev => {
          const updated = { ...prev };
          delete updated[moduleId];
          return updated;
        });
      }, 1000);
      return { type, url: data.secure_url, title: file.name };
    } catch (err) {
      setUploadProgress(prev => {
        const updated = { ...prev };
        delete updated[moduleId];
        return updated;
      });
      toast.error("Upload failed: " + err.message);
      return null;
    }
  };

  const getForm = (moduleId) => contentForms[moduleId] || { file: null, type: "video", title: "", url: "" };

  const updateForm = (moduleId, updates) => {
    setContentForms(prev => ({
      ...prev,
      [moduleId]: { ...getForm(moduleId), ...updates },
    }));
  };

  const handleAddContent = async (moduleId) => {
    const currentForm = getForm(moduleId);
    let contentToAdd;
    let wasFile = false;
    if (currentForm.file) {
      wasFile = true;
      const uploaded = await uploadContent(currentForm.file, moduleId);
      if (!uploaded) return;
      contentToAdd = uploaded;
    } else if (currentForm.url && currentForm.type === "link") {
      if (!currentForm.title.trim()) {
        toast.error("Title is required for links");
        return;
      }
      contentToAdd = { title: currentForm.title, type: "link", url: currentForm.url };
    } else {
      toast.error("Please select a file or enter a link");
      return;
    }
    try {
      const module = course.modules.find(m => m._id === moduleId);
      const updatedContents = [...(module?.contents || []), contentToAdd];
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/modules/${moduleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ contents: updatedContents }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success("Content added successfully");
      setContentForms(prev => ({
        ...prev,
        [moduleId]: { file: null, type: "video", title: "", url: "" },
      }));
      if (wasFile && fileInputRefs.current[moduleId]) {
        fileInputRefs.current[moduleId].value = '';
      }
      fetchCourse();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteContent = (moduleId, contentIndex, contentTitle) => {
    setConfirmDialog({
      isOpen: true,
      onConfirm: async () => {
        try {
          const module = course.modules.find(m => m._id === moduleId);
          const updatedContents = module.contents.filter((_, idx) => idx !== contentIndex);
          const res = await fetch(`http://localhost:5000/api/courses/${courseId}/modules/${moduleId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({ contents: updatedContents }),
          });
          if (!res.ok) throw new Error((await res.json()).message);
          toast.success("Content deleted successfully");
          fetchCourse();
        } catch (err) {
          toast.error(err.message);
        } finally {
          setConfirmDialog({ isOpen: false, onConfirm: () => {}, title: "", itemName: "", itemType: "" });
        }
      },
      onClose: () => setConfirmDialog({ isOpen: false, onConfirm: () => {}, title: "", itemName: "", itemType: "" }),
      title: "Confirm Content Deletion",
      itemName: contentTitle,
      itemType: "content",
    });
  };

  if (!course) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-xl">Loading course...</div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="mb-6 text-3xl font-bold text-gray-800">
          Manage Content for: {course.title}
        </h2>

        {/* Add new module */}
        <div className="p-6 mb-8 bg-white border-l-4 border-purple-500 rounded-lg shadow-md">
          <h3 className="mb-4 text-xl font-semibold text-gray-700">Add New Module</h3>
          <form onSubmit={handleAddModule}>
            <input
              value={newModule.title}
              onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
              placeholder="Module Title *"
              className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <textarea
              value={newModule.description}
              onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
              placeholder="Module Description (optional)"
              className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows="3"
            />
            <button
              type="submit"
              className="px-6 py-3 text-white transition bg-purple-600 rounded-lg hover:bg-purple-700"
            >
              Add Module
            </button>
          </form>
        </div>

        {/* Modules list */}
        {course.modules.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg shadow-md">
            <p className="text-gray-500">No modules yet. Add your first module above!</p>
          </div>
        ) : (
          course.modules.map((mod, modIndex) => {
            const form = getForm(mod._id);
            return (
              <div key={mod._id} className="p-6 mb-6 bg-white rounded-lg shadow-md">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {editingModule?._id === mod._id ? (
                      // Edit Mode
                      <div className="space-y-2">
                        <input
                          value={editingModule.title}
                          onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                          placeholder="Module Title"
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <textarea
                          value={editingModule.description}
                          onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                          placeholder="Module Description"
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="2"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateModule(mod._id)}
                            className="px-3 py-1 text-white bg-blue-600 rounded hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingModule(null)}
                            className="px-3 py-1 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 text-sm font-semibold text-purple-700 bg-purple-100 rounded-full">
                            Module {modIndex + 1}
                          </span>
                          <h4 className="text-xl font-bold text-gray-800">{mod.title}</h4>
                        </div>
                        {mod.description && (
                          <p className="text-gray-600">{mod.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {editingModule?._id !== mod._id && (
                      <button
                        onClick={() => setEditingModule({ _id: mod._id, title: mod.title, description: mod.description })}
                        className="px-3 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteModule(mod._id, mod.title)}
                      className="px-3 py-2 text-white bg-red-600 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Content list */}
                {mod.contents.length > 0 && (
                  <div className="mt-4 mb-4">
                    <h5 className="mb-3 font-semibold text-gray-700">Module Content:</h5>
                    <div className="space-y-2">
                      {mod.contents.map((cont, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 transition border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div className="flex items-center flex-1 gap-3">
                            <span className="px-2 py-1 text-xs font-medium text-blue-700 uppercase bg-blue-100 rounded">
                              {cont.type}
                            </span>
                            <span className="font-medium text-gray-700">{cont.title}</span>
                            <a
                              href={cont.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              View →
                            </a>
                          </div>
                          <button
                            onClick={() => handleDeleteContent(mod._id, idx, cont.title)}
                            className="px-3 py-1 text-sm text-white transition bg-red-500 rounded hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload progress bar */}
                {uploadProgress[mod._id] !== undefined && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Uploading...</span>
                      <span className="text-sm font-medium text-gray-700">{uploadProgress[mod._id]}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress[mod._id]}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Add content form */}
                <div className="p-4 mt-4 border-t-2 border-gray-100 rounded-lg bg-gray-50">
                  <h5 className="mb-3 font-semibold text-gray-700">Add Content to Module</h5>
                  <div className="space-y-3">
                    <select
                      value={form.type}
                      onChange={(e) => updateForm(mod._id, { type: e.target.value, file: null, url: "", title: "" })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="video">Video</option>
                      <option value="image">Image</option>
                      <option value="pdf">PDF</option>
                      <option value="link">Link</option>
                    </select>
                    {form.type !== "link" ? (
                      <div>
                        <input
                          type="file"
                          ref={(el) => { if (el) fileInputRefs.current[mod._id] = el; }}
                          onChange={(e) => updateForm(mod._id, { file: e.target.files[0] || null })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          accept={
                            form.type === "video" ? "video/*" :
                            form.type === "image" ? "image/*" :
                            form.type === "pdf" ? ".pdf" : "*"
                          }
                        />
                        {form.file && (
                          <p className="mt-1 text-sm text-gray-600">Selected: {form.file.name}</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <input
                          value={form.title}
                          onChange={(e) => updateForm(mod._id, { title: e.target.value })}
                          placeholder="Link Title *"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <input
                          value={form.url}
                          onChange={(e) => updateForm(mod._id, { url: e.target.value })}
                          placeholder="URL *"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          type="url"
                        />
                      </div>
                    )}
                    <button
                      onClick={() => handleAddContent(mod._id)}
                      disabled={uploadProgress[mod._id] !== undefined}
                      className="w-full px-6 py-3 text-white transition bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {uploadProgress[mod._id] !== undefined ? "Uploading..." : "Add Content"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={confirmDialog.onClose}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          itemName={confirmDialog.itemName}
          itemType={confirmDialog.itemType}
        />
      </div>
    </div>
  );
}