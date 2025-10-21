import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

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
      let thumbnailUrl = form.thumbnail;
      if (selectedFile) {
        thumbnailUrl = await uploadToCloudinary(selectedFile);
      }

      const res = await fetch("http://localhost:5000/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ ...form, thumbnail: thumbnailUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Course added successfully!");
      navigate("/instructor/dashboard/my-courses");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl p-6 mx-auto mt-10 bg-white rounded shadow">
      <h2 className="mb-4 text-2xl font-bold text-purple-700">Add Course</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="moduleCode"
          value={form.moduleCode}
          onChange={handleChange}
          placeholder="Module Code (e.g. CS101)"
          className="w-full p-2 border rounded"
          required
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
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

        <div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="w-full p-2 border rounded"
          />
          {selectedFile && <p className="mt-1 text-sm text-gray-600">Selected: {selectedFile.name}</p>}
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
          {loading ? "Creating..." : "Create Course"}
        </button>
      </form>
    </div>
  );
}
