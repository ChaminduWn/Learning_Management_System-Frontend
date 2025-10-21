import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";

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

  // Fetch course details
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

  // Frontend validation
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Title validation
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

    // Price validation
    if (name === "price" && value && !/^\d*\.?\d*$/.test(value)) {
      toast.warning("Price must contain only numbers.");
      return;
    }

    setForm({ ...form, [name]: value });
  };

  // Upload thumbnail to Cloudinary
  const uploadToCloudinary = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "lms_uploads");
    formData.append("folder", "lms_thumbnails");

    try {
      setUploadProgress(0);
      const res = await fetch("https://api.cloudinary.com/v1_1/dnrq2pn3p/auto/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error("Thumbnail upload failed");

      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);
      return data.secure_url;
    } catch (err) {
      toast.error("Thumbnail upload failed: " + err.message);
      setUploadProgress(0);
      return null;
    }
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
    <div className="max-w-2xl p-6 bg-white rounded shadow">
      <h2 className="mb-4 text-2xl font-bold text-purple-700">Edit Course</h2>
      {isApproved && (
        <div className="p-3 mb-4 text-sm text-blue-700 bg-blue-100 rounded">
          This course is <strong>approved</strong>. You can only update
          non-critical fields (like price, description, and thumbnail).
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full p-2 border rounded"
          required
          disabled={isApproved}
        />
        <input
          name="moduleCode"
          value={form.moduleCode}
          onChange={handleChange}
          placeholder="Module Code"
          className="w-full p-2 border rounded"
          required
          disabled={true}
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className={`w-full p-2 border rounded ${
            form.category ? "text-black" : "text-gray-400"
          }`}
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
        <input
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          className="w-full p-2 border rounded"
        />
        {/* Thumbnail file input */}
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          {selectedFile && (
            <p className="mt-1 text-sm text-gray-600">Selected: {selectedFile.name}</p>
          )}
        </div>

        {uploadProgress > 0 && (
          <div className="mt-3">
            <div className="flex justify-between mb-1 text-sm text-gray-700">
              <span>Uploading Thumbnail...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 transition-all duration-300 bg-green-600 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 text-white bg-purple-700 rounded"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Course"}
        </button>
      </form>
      <button
        onClick={() => navigate(`/instructor/dashboard/manage-content/${id}`)}
        className="px-4 py-2 mt-4 text-white bg-purple-600 rounded"
      >
        Manage Course Content
      </button>
    </div>
  );
}
