import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";

export default function AddCourse() {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({ title: "", moduleCode: "", description: "", category: "", price: "", thumbnail: "" });
  const [loading, setLoading] = useState(false);

  const categories = [
  "Programming & Development",
  "Design & Multimedia",
  "Business & Management",
  "Cybersecurity & Networking",
  "Personal Development",
];

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error");
      toast.success("Course created and pending admin approval.");
      setForm({ title: "", moduleCode: "", description: "", category: "", price: "", thumbnail: "" });
    } catch (err) {
      toast.error(err.message || "Error creating course");
      
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl p-6 bg-white rounded shadow">
      <h2 className="mb-4 text-2xl font-bold text-purple-700">Add Course</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="w-full p-2 border rounded" required />
        <input name="moduleCode" value={form.moduleCode} onChange={handleChange} placeholder="Module Code (e.g. CS101)" className="w-full p-2 border rounded" required />
        <select name="category" value={form.category} onChange={handleChange}   className={`w-full p-2 border rounded text-gray-500 ${form.category ? "text-black" : "text-gray-400"}`} required >
           <option value="">Select Category</option>
                  {categories.map((cat) => (
           <option key={cat} value={cat}>{cat}</option>
                    ))}
        </select>
        {/* <input name="category" value={form.category} onChange={handleChange} placeholder="Category" className="w-full p-2 border rounded" /> */}
        <input name="price" value={form.price} onChange={handleChange} placeholder="Price" className="w-full p-2 border rounded" />
        <input name="thumbnail" value={form.thumbnail} onChange={handleChange} placeholder="Thumbnail URL (optional)" className="w-full p-2 border rounded" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full p-2 border rounded" />
        <button type="submit" className="px-4 py-2 text-white bg-purple-700 rounded" disabled={loading}>{loading ? "Creating..." : "Create Course"}</button>
      </form>
    </div>
  );
}
