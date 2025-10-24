import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Plus, AlertCircle, Loader2, Edit, Trash2, FileText, Upload } from "lucide-react";

// Custom Confirmation Dialog Component
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, itemName, itemType }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    >
      <div className="w-full max-w-md p-6 bg-white shadow-xl rounded-2xl backdrop-blur-sm">
        <div className="flex items-center mb-4 text-red-600">
          <AlertCircle size={24} className="mr-2" />
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <p className="mb-6 text-gray-600">
          Are you sure you want to delete {itemType} "<strong>{itemName}</strong>"?
          {itemType === "module" && " All associated content will be removed."}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 font-medium text-gray-700 transition-all bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 font-medium text-white transition-all rounded-lg shadow-md bg-gradient-to-r from-red-600 to-red-700 hover:shadow-lg hover:scale-105"
          >
            Confirm
          </button>
        </div>
      </div>
    </motion.div>
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
    setUploadProgress(prev => ({ ...prev, [moduleId]: 10 }));
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "lms_Uploads");
    formData.append("folder", "lms_course_content");
    try {
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
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="flex items-center gap-2 text-xl text-gray-600">
        <Loader2 className="w-6 h-6 animate-spin" />
        Loading course...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-gray-50 via-white to-indigo-50 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Manage Content for: {course.title}
            </h2>
          </div>
        </motion.div>

        {/* Add New Module */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-8 mb-8 bg-white border shadow-xl rounded-3xl backdrop-blur-sm border-white/20"
        >
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xl font-semibold text-gray-700">Add New Module</h3>
          </div>
          <form onSubmit={handleAddModule} className="space-y-4">
            <div className="relative">
              <FileText className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
              <input
                value={newModule.title}
                onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                placeholder="Module Title *"
                className="w-full py-3 pl-10 pr-4 text-sm transition-all border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <textarea
              value={newModule.description}
              onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
              placeholder="Module Description (optional)"
              className="w-full p-4 text-sm transition-all border border-gray-200 resize-none rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows="3"
            />
            <button
              type="submit"
              className="flex items-center justify-center w-full gap-2 py-3 font-medium text-white transition-all shadow-md bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Add Module
            </button>
          </form>
        </motion.div>

        {/* Modules List */}
        {course.modules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-12 text-center bg-white shadow-inner rounded-2xl"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-gray-100 rounded-full">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-700">No modules yet</p>
            <p className="mt-1 text-gray-500">Start by adding your first module above!</p>
          </motion.div>
        ) : (
          course.modules.map((mod, modIndex) => {
            const form = getForm(mod._id);
            return (
              <motion.div
                key={mod._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * modIndex }}
                className="p-6 mb-6 transition-all duration-300 bg-white shadow-md rounded-2xl hover:shadow-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {editingModule?._id === mod._id ? (
                      // Edit Mode
                      <div className="space-y-3">
                        <div className="relative">
                          <FileText className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                          <input
                            value={editingModule.title}
                            onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                            placeholder="Module Title"
                            className="w-full py-3 pl-10 pr-4 text-sm transition-all border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        <textarea
                          value={editingModule.description}
                          onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                          placeholder="Module Description"
                          className="w-full p-4 text-sm transition-all border border-gray-200 resize-none rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          rows="2"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateModule(mod._id)}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-indigo-600 transition-all bg-indigo-50 rounded-lg hover:bg-indigo-100"
                          >
                            <Edit size={16} />
                            Save
                          </button>
                          <button
                            onClick={() => setEditingModule(null)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 transition-all bg-gray-100 rounded-lg hover:bg-gray-200"
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
                          <p className="text-sm text-gray-600 line-clamp-2">{mod.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {editingModule?._id !== mod._id && (
                      <button
                        onClick={() => setEditingModule({ _id: mod._id, title: mod.title, description: mod.description })}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-600 transition-all bg-indigo-50 rounded-lg hover:bg-indigo-100"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteModule(mod._id, mod.title)}
                      className="p-2 text-red-600 transition-all rounded-lg bg-red-50 hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Content List */}
                {mod.contents.length > 0 && (
                  <div className="mt-4 mb-4">
                    <h5 className="mb-3 font-semibold text-gray-700">Module Content:</h5>
                    <div className="space-y-2">
                      {mod.contents.map((cont, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * idx }}
                          className="flex items-center justify-between p-3 transition-all border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center flex-1 gap-3">
                            <span className="px-2 py-1 text-xs font-medium text-indigo-600 uppercase bg-indigo-100 rounded">
                              {cont.type}
                            </span>
                            <span className="font-medium text-gray-700 truncate">{cont.title}</span>
                            <a
                              href={cont.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-indigo-600 hover:underline"
                            >
                              View →
                            </a>
                          </div>
                          <button
                            onClick={() => handleDeleteContent(mod._id, idx, cont.title)}
                            className="p-2 text-red-600 transition-all rounded-lg bg-red-50 hover:bg-red-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Progress Bar */}
                {uploadProgress[mod._id] !== undefined && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-4"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Uploading...</span>
                      <span className="font-medium text-indigo-600">{uploadProgress[mod._id]}%</span>
                    </div>
                    <div className="w-full h-2 overflow-hidden bg-gray-200 rounded-full">
                      <div
                        className="h-full transition-all duration-300 bg-gradient-to-r from-indigo-600 to-purple-600"
                        style={{ width: `${uploadProgress[mod._id]}%` }}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Add Content Form */}
                <div className="p-4 mt-4 border-t-2 border-gray-100 rounded-lg bg-gray-50">
                  <h5 className="mb-3 font-semibold text-gray-700">Add Content to Module</h5>
                  <div className="space-y-4">
                    <div className="relative">
                      <select
                        value={form.type}
                        onChange={(e) => updateForm(mod._id, { type: e.target.value, file: null, url: "", title: "" })}
                        className="w-full py-3 pl-4 pr-10 text-sm transition-all bg-white border border-gray-200 appearance-none rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="video">Video</option>
                        <option value="image">Image</option>
                        <option value="pdf">PDF</option>
                        <option value="link">Link</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                    {form.type !== "link" ? (
                      <div className="space-y-3">
                        <label className="flex flex-col items-center justify-center w-full p-6 transition-all border-2 border-gray-300 border-dashed cursor-pointer rounded-xl hover:border-indigo-500 bg-gray-50 hover:bg-indigo-50">
                          <Upload className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">Click to upload {form.type}</p>
                          <input
                            type="file"
                            ref={(el) => { if (el) fileInputRefs.current[mod._id] = el; }}
                            onChange={(e) => updateForm(mod._id, { file: e.target.files[0] || null })}
                            className="hidden"
                            accept={
                              form.type === "video" ? "video/*" :
                              form.type === "image" ? "image/*" :
                              form.type === "pdf" ? ".pdf" : "*"
                            }
                          />
                        </label>
                        {form.file && (
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-indigo-50">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            <span className="max-w-xs text-sm text-indigo-700 truncate">
                              {form.file.name}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative">
                          <FileText className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                          <input
                            value={form.title}
                            onChange={(e) => updateForm(mod._id, { title: e.target.value })}
                            placeholder="Link Title *"
                            className="w-full py-3 pl-10 pr-4 text-sm transition-all border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        <div className="relative">
                          <FileText className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                          <input
                            value={form.url}
                            onChange={(e) => updateForm(mod._id, { url: e.target.value })}
                            placeholder="URL *"
                            type="url"
                            className="w-full py-3 pl-10 pr-4 text-sm transition-all border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => handleAddContent(mod._id)}
                      disabled={uploadProgress[mod._id] !== undefined}
                      className="flex items-center justify-center w-full gap-2 py-3 font-medium text-white transition-all shadow-md bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {uploadProgress[mod._id] !== undefined ? (
                        <>
                          Uploading... <Loader2 className="w-5 h-5 animate-spin" />
                        </>
                      ) : (
                        <>
                          Add Content <Plus className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
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