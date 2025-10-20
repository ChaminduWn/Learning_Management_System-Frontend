import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

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
        alert(err.message);
      }
    };
    fetchCourse();
  }, [id, user.token]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error updating course");

      alert(
        form.status === "Approved"
          ? "Minor updates saved successfully."
          : "Course updated successfully and pending admin re-approval."
      );
      navigate("/instructor/dashboard/my-courses");
    } catch (err) {
      alert(err.message);
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
        <input
          name="thumbnail"
          value={form.thumbnail}
          onChange={handleChange}
          placeholder="Thumbnail URL"
          className="w-full p-2 border rounded"
        />
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
