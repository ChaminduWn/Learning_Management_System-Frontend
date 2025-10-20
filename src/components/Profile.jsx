import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

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
  const [fetchingProfile, setFetchingProfile] = useState(true);

  // Fetch user profile data from backend on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user || !user.token) {
        setFetchingProfile(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/auth/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        
        // Update form with fetched data
        setFormData({
          name: data.name || "",
          bio: data.bio || "",
          phone: data.phone || "",
          address: data.address || "",
          profilePicture: data.profilePicture || DEFAULT_AVATAR,
        });

        // Update context with complete user data (including token)
        login({ 
          ...data, 
          token: user.token, // Keep the existing token
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setFetchingProfile(false);
      }
    };

    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - we want this behavior

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Instant preview
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, profilePicture: previewUrl }));

    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", "lms_uploads");
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

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      // Update with actual uploaded URL
      setFormData((prev) => ({ ...prev, profilePicture: data.secure_url }));
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Image upload failed. Please try again.");
      setFormData((prev) => ({ 
        ...prev, 
        profilePicture: user?.profilePicture || DEFAULT_AVATAR 
      }));
    } finally {
      setUploading(false);
      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, profilePicture: DEFAULT_AVATAR }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submission while uploading
    if (uploading) {
      toast.error("Please wait for the image to finish uploading.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const data = await res.json();
      
      // IMPORTANT: Update context with the response data
      // This will trigger re-render in Header component
      login(data);
      
      toast.success("✅ Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("⚠️ Error updating profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl p-6 mx-auto mt-8 bg-white shadow-md rounded-xl">
      <h2 className="mb-6 text-2xl font-semibold text-purple-700">My Profile</h2>

      <div className="flex items-center gap-6 mb-6">
        <div className="relative">
          <img
            src={formData.profilePicture}
            alt="Profile"
            className="object-cover w-24 h-24 border rounded-full"
            onError={(e) => {
              e.target.src = DEFAULT_AVATAR;
            }}
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-white bg-black bg-opacity-50 rounded-full">
              Uploading...
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload}
            disabled={uploading}
            className="text-sm"
          />
          {formData.profilePicture !== DEFAULT_AVATAR && (
            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={uploading}
              className="px-2 py-1 text-sm text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-50"
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
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            rows="3"
            placeholder="Tell us about yourself..."
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
              type="tel"
              placeholder="+94 77 123 4567"
            />
          </div>

          <div>
            <label className="block text-gray-700">Address</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              placeholder="City, Country"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || uploading}
          className="px-4 py-2 text-white transition bg-purple-700 rounded-md hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}