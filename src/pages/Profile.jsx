import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Profile() {
  const { user, login } = useContext(AuthContext);
  const DEFAULT_AVATAR =
    "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png";

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    phone: "",
    address: "",
    profilePicture: DEFAULT_AVATAR,
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        phone: user.phone || "",
        address: user.address || "",
        profilePicture: user.profilePicture || DEFAULT_AVATAR,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Instant preview
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, profilePicture: previewUrl }));

    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", "lms_uploads"); // replace with your preset
    form.append("folder", "lms_profiles");


    try {
      setUploading(true);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/dnrq2pn3p/image/upload`,
        {
          method: "POST",
          body: form,
        }
      );
      const data = await res.json();
      // Update with actual uploaded URL
      setFormData((prev) => ({ ...prev, profilePicture: data.secure_url }));
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Image upload failed");
      setFormData((prev) => ({ ...prev, profilePicture: DEFAULT_AVATAR }));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, profilePicture: DEFAULT_AVATAR }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submission while uploading
    if (uploading) {
      alert("Please wait for the image to finish uploading.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) throw new Error("Failed to update profile");

      const data = await res.json();
      login(data);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl p-6 mx-auto mt-8 bg-white shadow-md rounded-xl">
      <h2 className="mb-6 text-2xl font-semibold text-purple-700">My Profile</h2>

      <div className="flex items-center gap-6 mb-6">
        <div className="relative">
          <img
            src={formData.profilePicture}
            alt="Profile"
            className="object-cover w-24 h-24 border rounded-full"
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-white bg-black bg-opacity-50 rounded-full">
              Uploading...
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {formData.profilePicture !== DEFAULT_AVATAR && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="px-2 py-1 text-sm text-white bg-red-500 rounded-md hover:bg-red-600"
            >
              Remove Image
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-gray-700">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          ></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700">Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-gray-700">Address</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || uploading}
          className="px-4 py-2 text-white transition bg-purple-700 rounded-md hover:bg-purple-800"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
