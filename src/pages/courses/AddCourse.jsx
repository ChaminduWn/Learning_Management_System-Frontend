import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Upload,
  AlertCircle,
  Loader2,
  BookOpen,
  DollarSign,
  Tag,
  Image,
  FileText,
} from "lucide-react";

export default function AddCourse() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    moduleCode: "",
    description: "",
    category: "",
    price: "",
    thumbnail: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const categories = [
    "Programming & Development",
    "Design & Multimedia",
    "Business & Management",
    "Cybersecurity & Networking",
    "Personal Development",
  ];

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

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dnrq2pn3p/auto/upload", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(70);

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || "Upload failed");
      }

      const data = await res.json();
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);

      return data.secure_url;
    } catch (err) {
      setUploadProgress(0);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    if (!form.category) {
      toast.error("Please select a category");
      return;
    }

    setLoading(true);

    try {
      let thumbnailUrl = form.thumbnail;
      if (selectedFile) {
        toast.info("Uploading thumbnail...");
        thumbnailUrl = await uploadToCloudinary(selectedFile);
      }

      const res = await fetch("http://localhost:5000/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          ...form,
          price: form.price ? parseFloat(form.price) : 0,
          thumbnail: thumbnailUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create course");
      }

      toast.success("Course created successfully!");
      navigate("/instructor/dashboard/my-courses");
    } catch (err) {
      console.error("Course creation error:", err);
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
              <Plus className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Create New Course
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="relative">
              <BookOpen className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Course Title (max 20 words)"
                className="w-full py-3 pl-10 pr-4 text-sm transition-all border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            {/* Module Code */}
            <div className="relative">
              <Tag className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
              <input
                name="moduleCode"
                value={form.moduleCode}
                onChange={handleChange}
                placeholder="Module Code (e.g. CS101)"
                className="w-full py-3 pl-10 pr-4 text-sm transition-all border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            {/* Category */}
            <div className="relative">
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full py-3 pl-10 pr-10 text-sm transition-all bg-white border border-gray-200 appearance-none rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
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

            {/* Price */}
            <div className="relative">
              <DollarSign className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Price (e.g. 49.99) - Leave empty for free"
                className="w-full py-3 pl-10 pr-4 text-sm transition-all border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Thumbnail Upload */}
            <div className="space-y-3">
              <div className="relative">
                <label className="flex flex-col items-center justify-center w-full p-6 transition-all border-2 border-gray-300 border-dashed cursor-pointer rounded-xl hover:border-indigo-500 bg-gray-50 hover:bg-indigo-50">
                  <Upload className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Click to upload thumbnail (optional)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>

              {selectedFile && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-indigo-50">
                  <Image className="w-5 h-5 text-indigo-600" />
                  <span className="max-w-xs text-sm text-indigo-700 truncate">
                    {selectedFile.name}
                  </span>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Uploading thumbnail...</span>
                  <span className="font-medium text-indigo-600">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 overflow-hidden bg-gray-200 rounded-full">
                  <div
                    className="h-full transition-all duration-300 bg-gradient-to-r from-indigo-600 to-purple-600"
                    style={{ width: `${uploadProgress}%` }}
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
                placeholder="Describe your course (what will students learn?)"
                rows={5}
                className="w-full p-4 text-sm transition-all border border-gray-200 resize-none rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full gap-2 py-3 font-medium text-white transition-all shadow-md bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  Creating Course... <Loader2 className="w-5 h-5 animate-spin" />
                </>
              ) : (
                <>
                  Create Course <Plus className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}