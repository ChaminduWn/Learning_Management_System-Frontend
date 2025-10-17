import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Menu, LogOut, User as UserIcon, GraduationCap } from "lucide-react";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Role-based theme colors
  const roleColor =
    user?.role === "Admin"
      ? "bg-red-600"
      : user?.role === "Instructor"
      ? "bg-blue-600"
      : user?.role === "Student"
      ? "bg-green-600"
      : "bg-purple-700";

  return (
    <header className={`${roleColor} text-white px-6 py-3 flex justify-between items-center shadow-md`}>
      <Link to="/" className="flex items-center gap-2 text-xl font-bold">
        <GraduationCap size={28} />
        <span>LMS Platform</span>
      </Link>

      {user ? (
        <div className="relative">
          <button
            className="flex items-center gap-2 focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <img
              src={user.profilePicture}
              alt="Profile"
              className="object-cover w-10 h-10 border-2 border-white rounded-full"
            />
            <span className="font-medium">{user.name}</span>
            <Menu size={20} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 w-48 mt-2 text-gray-800 bg-white rounded-lg shadow-lg">
              <Link
                to="/profile"
                className="flex items-center px-4 py-2 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                <UserIcon size={16} className="mr-2" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <Link to="/login" className="mr-4 hover:underline">
            Login
          </Link>
          <Link to="/register" className="hover:underline">
            Register
          </Link>
        </div>
      )}
    </header>
  );
}
