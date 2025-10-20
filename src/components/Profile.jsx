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

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [updatingPassword, setUpdatingPassword] = useState(false);

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
        
        setFormData({
          name: data.name || "",
          bio: data.bio || "",
          phone: data.phone || "",
          address: data.address || "",
          profilePicture: data.profilePicture || DEFAULT_AVATAR,
        });

        login({ 
          ...data, 
          token: user.token,
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
  }, []);

  // Helper function to remove emojis and special characters
  const removeEmojis = (text) => {
    return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    // Phone number: only allow numbers, +, spaces, and hyphens
    if (name === "phone") {
      sanitizedValue = value.replace(/[^\d\s+\-()]/g, '');
    } else {
      // Remove emojis from all other text fields
      sanitizedValue = removeEmojis(value);
    }

    setFormData({ ...formData, [name]: sanitizedValue });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

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
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, profilePicture: DEFAULT_AVATAR }));
  };

  const validatePhone = (phone) => {
    if (!phone) return true; // Phone is optional
    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    // Allow + at start and then 7-15 digits
    const phoneRegex = /^\+?\d{7,15}$/;
    return phoneRegex.test(cleanPhone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (uploading) {
      toast.error("Please wait for the image to finish uploading.");
      return;
    }

    // Validate phone number
    if (formData.phone && !validatePhone(formData.phone)) {
      toast.error("Please enter a valid phone number");
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
      login(data);
      toast.success("✅ Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("⚠️ Error updating profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setUpdatingPassword(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/update-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          newPassword: passwordData.newPassword,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update password");
      }

      toast.success("✅ Password updated successfully!");
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error(error);
      toast.error(error.message || "⚠️ Error updating password. Please try again.");
    } finally {
      setUpdatingPassword(false);
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
    <div className="max-w-3xl p-6 mx-auto mt-8 mb-8 space-y-6">
      {/* Profile Information Section */}
      <div className="p-6 bg-white shadow-md rounded-xl">
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
            <label className="block text-gray-700">Name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows="3"
              placeholder="Tell us about yourself..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-gray-700">Phone</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                type="tel"
                placeholder="+94 77 123 4567"
              />
              <p className="mt-1 text-xs text-gray-500">Numbers only (with optional +, spaces, hyphens)</p>
            </div>

            <div>
              <label className="block text-gray-700">Address</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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

      {/* Password Update Section */}
      <div className="p-6 bg-white shadow-md rounded-xl">
        <h2 className="mb-6 text-2xl font-semibold text-purple-700">Update Password</h2>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">New Password *</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter new password"
              required
              minLength={6}
            />
            <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
          </div>

          <div>
            <label className="block text-gray-700">Confirm New Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Confirm new password"
              required
              minLength={6}
            />
            {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={updatingPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            className="px-4 py-2 text-white transition bg-purple-700 rounded-md hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updatingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}