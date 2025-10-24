import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  X,
  Lock,
  Eye,
  EyeOff,
  Save,
  Loader2,
} from "lucide-react";

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

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
          headers: { Authorization: `Bearer ${user.token}` },
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

        login({ ...data, token: user.token });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setFetchingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Helper function to remove emojis
  const removeEmojis = (text) =>
    text.replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
      ""
    );

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    if (name === "phone") {
      sanitizedValue = value.replace(/[^\d\s+\-()]/g, "");
    } else {
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
        { method: "POST", body: form }
      );

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setFormData((prev) => ({ ...prev, profilePicture: data.secure_url }));
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Image upload failed. Please try again.");
      setFormData((prev) => ({
        ...prev,
        profilePicture: user?.profilePicture || DEFAULT_AVATAR,
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
    if (!phone) return true;
    const cleanPhone = phone.replace(/[\s\-()]/g, "");
    const phoneRegex = /^\+?\d{7,15}$/;
    return phoneRegex.test(cleanPhone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (uploading) {
      toast.error("Please wait for the image to finish uploading.");
      return;
    }

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
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Error updating profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

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
        body: JSON.stringify({ newPassword: passwordData.newPassword }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update password");
      }

      toast.success("Password updated successfully!");
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error updating password.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (fetchingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-gray-50 via-white to-indigo-50 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            My Profile
          </h1>
          <p className="mt-2 text-gray-600">Manage your personal information and password</p>
        </motion.div>

        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-white border shadow-xl rounded-3xl backdrop-blur-sm border-white/20"
        >
          <h2 className="mb-6 text-2xl font-bold text-gray-800">Personal Information</h2>

          {/* Avatar */}
          <div className="flex flex-col items-center gap-6 mb-8 sm:flex-row sm:items-start">
            <div className="relative group">
              <img
                src={formData.profilePicture}
                alt="Profile"
                className="object-cover w-32 h-32 border-4 border-white rounded-full shadow-lg"
                onError={(e) => (e.target.src = DEFAULT_AVATAR)}
              />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 p-2 transition-all rounded-full shadow-lg cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-110">
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <h3 className="text-xl font-bold text-gray-800">{formData.name || "Your Name"}</h3>
              <p className="text-gray-600">{user?.email}</p>
              {formData.profilePicture !== DEFAULT_AVATAR && (
                <button
                  onClick={handleRemoveImage}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 transition-all bg-red-50 rounded-lg hover:bg-red-100"
                >
                  <X size={16} /> Remove Photo
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Name */}
              <div className="relative">
                <User className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="w-full py-3 pl-10 pr-4 text-sm transition-all border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Phone */}
              <div className="relative">
                <Phone className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  type="tel"
                  placeholder="+94 77 123 4567"
                  className="w-full py-3 pl-10 pr-4 text-sm transition-all border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Address */}
              <div className="relative md:col-span-2">
                <MapPin className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="City, Country"
                  className="w-full py-3 pl-10 pr-4 text-sm transition-all border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Tell us about yourself..."
                  className="w-full p-4 text-sm transition-all border border-gray-200 resize-none rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || uploading}
              className="flex items-center justify-center w-full gap-2 py-3 font-medium text-white transition-all shadow-md bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>Saving... <Loader2 className="w-5 h-5 animate-spin" /></>
              ) : (
                <>Save Changes <Save size={18} /></>
              )}
            </button>
          </form>
        </motion.div>

        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-white border shadow-xl rounded-3xl backdrop-blur-sm border-white/20"
        >
          <h2 className="mb-6 text-2xl font-bold text-gray-800">Change Password</h2>

          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* New Password */}
              <div className="relative">
                <Lock className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="New Password"
                  className="w-full py-3 pl-10 pr-12 text-sm transition-all border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 hover:text-indigo-600"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Lock className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm Password"
                  className="w-full py-3 pl-10 pr-12 text-sm transition-all border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 hover:text-indigo-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
              <p className="text-sm text-red-600">Passwords do not match</p>
            )}

            <button
              type="submit"
              disabled={
                updatingPassword ||
                !passwordData.newPassword ||
                !passwordData.confirmPassword ||
                passwordData.newPassword.length < 6
              }
              className="flex items-center justify-center w-full gap-2 py-3 font-medium text-white transition-all shadow-md bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updatingPassword ? (
                <>Updating... <Loader2 className="w-5 h-5 animate-spin" /></>
              ) : (
                <>Update Password <Lock size={18} /></>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}