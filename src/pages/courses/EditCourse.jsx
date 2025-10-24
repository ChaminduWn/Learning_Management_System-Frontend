import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { BookOpen, Tag, DollarSign, Image, FileText, Loader2, Edit3, AlertCircle } from "lucide-react";

export default function EditCourse() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    moduleCode: "",
    description: "",
    category: "",
    price: "",
    thumbnail: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const categories = [
    "Programming & Development",
    "Design & Multimedia",
    "Business & Management",
    "Cybersecurity & Networking",
    "Personal Development",
  ];

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/courses/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load course");
        setForm(data);
      } catch (err) {
        toast.error(err.message);
      }
    };
    fetchCourse();
  }, [id, user.token]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "title") {
      const wordCount = value.trim().split(/\s+/).length;
      if (wordCount > 20) {
        toast.warning("Title cannot exceed 20 words.");
        return;
      }
      if (value.includes("\n")) {
        toast.warning("Title should be one line only.");
        return;
      }
    }

    if (name === "price" && value && !/^\d*\.?\d*$/.test(value)) {
      toast.warning("Price must contain only numbers.");
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const uploadToCloudinary = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "lms_uploads");
    formData.append("folder", "lms_thumbnails");

    setUploadProgress(10);
    const res = await fetch("https://api.cloudinary.com/v1_1/dnrq2pn3p/auto/upload", {
      method: "POST",
      body: formData,
    });

    setUploadProgress(70);
    if (!res.ok) throw new Error("Thumbnail upload failed");

    const data = await res.json();
    setUploadProgress(100);
    setTimeout(() => setUploadProgress(0), 1000);
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = form.thumbnail;
      if (selectedFile) {
        const uploadedUrl = await uploadToCloudinary(selectedFile);
        if (!uploadedUrl) return;
        imageUrl = uploadedUrl;
      }

      const res = await fetch(`http://localhost:5000/api/courses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ ...form, thumbnail: imageUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error updating course");

      toast.success(
        form.status === "Approved"
          ? "Minor updates saved successfully."
          : "Course updated successfully and pending admin re-approval."
      );

      navigate("/instructor/dashboard/my-courses");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isApproved = form.status === "Approved";

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-gray-50 via-white to-indigo-50 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 bg-white border shadow-xl rounded-3xl backdrop-blur-sm border-white/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl">
              <Edit3 className="text-indigo-600 w-7 h-7" />
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Edit Course
            </h1>
          </div>

          {isApproved && (
            <div className="flex items-center gap-2 p-4 mb-6 text-sm text-blue-700 bg-blue-50 rounded-xl">
              <AlertCircle className="w-5 h-5" />
              <span>
                This course is <strong>approved</strong>. You can only update non-critical fields.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="relative">
              <BookOpen className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Course Title"
                className="w-full py-3 pl-10 pr-4 text-sm transition-all border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={isApproved}
              />
            </div>

            {/* Module Code */}
            <div className="relative">
              <Tag className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
              <input
                name="moduleCode"
                value={form.moduleCode}
                onChange={handleChange}
                placeholder="Module Code"
                className="w-full py-3 pl-10 pr-4 text-sm border border-gray-200 rounded-xl bg-gray-50"
                required
                disabled
              />
            </div>

            {/* Category */}
            <div className="relative">
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full py-3 pl-10 pr-10 text-sm transition-all bg-white border border-gray-200 appearance-none rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={isApproved}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none">
                <Tag className="w-5 h-5 text-gray-400" />
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Price */}
            <div className="relative">
              <DollarSign className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Price"
                className="w-full py-3 pl-10 pr-4 text-sm transition-all border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Thumbnail */}
            <div className="space-y-3">
              {form.thumbnail && (
                <img
                  src={form.thumbnail}
                  alt="Current thumbnail"
                  className="object-cover w-full h-48 shadow-md rounded-xl"
                />
              )}
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center w-full p-6 transition-all border-2 border-dashed cursor-pointer rounded-xl hover:border-indigo-500 hover:bg-indigo-50">
                  <Image className="w-10 h-10 mb-3 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-700">Change Thumbnail</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>
              {selectedFile && (
                <p className="text-sm text-center text-gray-600">
                  Selected: <span className="font-medium">{selectedFile.name}</span>
                </p>
              )}
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Uploading...</span>
                  <span className="font-medium text-indigo-600">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 overflow-hidden bg-gray-200 rounded-full">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Course Description"
                rows={5}
                className="w-full p-4 text-sm transition-all border border-gray-200 resize-none rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center flex-1 gap-2 py-3 font-medium text-white transition-all shadow-md bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:scale-105 disabled:opacity-50"
              >
                {loading ? (
                  <>Updating... <Loader2 className="w-5 h-5 animate-spin" /></>
                ) : (
                  <>Update Course <Edit3 className="w-5 h-5" /></>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/instructor/dashboard/manage-content/${id}`)}
                className="flex items-center justify-center flex-1 gap-2 py-3 font-medium text-indigo-600 transition-all bg-indigo-50 rounded-xl hover:bg-indigo-100 hover:scale-105"
              >
                Manage Content <FileText className="w-5 h-5" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}