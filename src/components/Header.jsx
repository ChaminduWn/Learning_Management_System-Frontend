import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Menu, LogOut, User as UserIcon, GraduationCap } from "lucide-react";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const DEFAULT_AVATAR = "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png";

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

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/courses", label: "Courses" },
    // { path: "/support", label: "Support" },
  ];

  return (
    <header className={`${roleColor} text-white px-6 py-3 flex justify-between items-center shadow-md`}>
      <Link to="/" className="flex items-center gap-2 text-xl font-bold">
        <GraduationCap size={28} />
        <span>LMS Platform</span>
      </Link>

      {/* Navigation Tabs */}
      <nav className="hidden gap-6 text-sm font-medium md:flex">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`hover:underline transition ${
              location.pathname === link.path ? "underline font-semibold" : ""
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {user ? (
        <div className="relative">
          <button
            className="flex items-center gap-2 focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <img
              src={user.profilePicture || DEFAULT_AVATAR}
              alt="Profile"
              className="object-cover w-10 h-10 border-2 border-white rounded-full"
              onError={(e) => {
                e.target.src = DEFAULT_AVATAR;
              }}
            />
            <span className="font-medium">{user.name}</span>
            <Menu size={20} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 z-50 w-48 mt-2 text-gray-800 bg-white rounded-lg shadow-lg">
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