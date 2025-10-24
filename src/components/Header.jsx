import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { 
  Menu, 
  LogOut, 
  LayoutDashboard, 
  GraduationCap, 
  User,
  Settings,
  Bell,
  Search,
  X,
  ChevronDown,
  BookOpen,
  Home,
  Phone,
  Info
} from "lucide-react";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  const DEFAULT_AVATAR = "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png";

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    setMobileMenuOpen(false);
    logout();
    navigate("/login");
  };

  // Close menus when route changes
  useEffect(() => {
    setMenuOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const roleTheme = {
    Admin: {
      gradient: "from-slate-700 to-slate-800",
      badge: "bg-slate-100 text-slate-700",
      hover: "hover:bg-slate-700"
    },
    Instructor: {
      gradient: "from-indigo-600 to-indigo-700",
      badge: "bg-indigo-100 text-indigo-700",
      hover: "hover:bg-indigo-700"
    },
    Student: {
      gradient: "from-purple-600 to-purple-700",
      badge: "bg-emerald-100 text-emerald-700",
      hover: "hover:bg-emerald-700"
    },
    default: {
      gradient: "from-purple-600 to-purple-700",
      badge: "bg-purple-100 text-purple-700",
      hover: "hover:bg-purple-700"
    }
  };

  const theme = roleTheme[user?.role] || roleTheme.default;

  const getDashboardInfo = () => {
    switch (user?.role) {
      case "Admin":
        return { route: "/admin/dashboard", label: "Dashboard" };
      case "Instructor":
        return { route: "/instructor/dashboard", label: "Dashboard" };
      case "Student":
        return { route: "/student/dashboard", label: "Dashboard" };
      default:
        return { route: "/profile", label: "Profile" };
    }
  };

  const dashboardInfo = getDashboardInfo();
  const showCommonNav = !user || user.role === "Student";

  const navLinks = [
    { path: "/", label: "Home", icon: Home },
    { path: "/courses", label: "Courses", icon: BookOpen },
    { path: "/contact", label: "Contact", icon: Phone },
    { path: "/about", label: "About", icon: Info },
  ];

  const isActivePath = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header 
      className={`
        bg-gradient-to-r ${theme.gradient} text-white 
        sticky top-0 z-50 transition-all duration-300
        ${scrolled ? "shadow-lg py-2" : "shadow-md py-3"}
      `}
    >
      <div className="container flex items-center justify-between px-4 mx-auto max-w-7xl">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 text-xl font-bold transition-transform hover:scale-105"
        >
          <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
            <GraduationCap size={28} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-extrabold tracking-tight">EduLearn</span>
            <span className="text-[10px] font-normal opacity-90">Learning Management System</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        {showCommonNav && (
          <nav className="items-center hidden gap-1 lg:flex">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActivePath(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium 
                    transition-all duration-200 flex items-center gap-2
                    ${active 
                      ? "bg-white/25 backdrop-blur-sm shadow-inner" 
                      : "hover:bg-white/15"
                    }
                  `}
                >
                  <Icon size={16} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Admin/Instructor Direct Dashboard Link */}
        {user && (user.role === "Admin" || user.role === "Instructor") && (
          <nav className="items-center hidden gap-1 lg:flex">
            <Link
              to={dashboardInfo.route}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium 
                transition-all duration-200 flex items-center gap-2
                ${location.pathname.startsWith(dashboardInfo.route.split('/').slice(0, 3).join('/'))
                  ? "bg-white/25 backdrop-blur-sm shadow-inner" 
                  : "hover:bg-white/15"
                }
              `}
            >
              <LayoutDashboard size={16} />
              <span>{dashboardInfo.label}</span>
            </Link>
          </nav>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* User Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  className="flex items-center gap-2 px-3 py-1.5 transition-all rounded-lg hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <img
                    src={user.profilePicture || DEFAULT_AVATAR}
                    alt="Profile"
                    className="object-cover border-2 rounded-full w-9 h-9 border-white/50"
                    onError={(e) => {
                      e.target.src = DEFAULT_AVATAR;
                    }}
                  />
                  <div className="hidden text-left md:block">
                    <div className="text-sm font-semibold leading-tight">{user.name}</div>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform duration-200 hidden md:block ${menuOpen ? "rotate-180" : ""}`} 
                  />
                </button>

                {/* Dropdown Menu */}
                {menuOpen && (
                  <div className="absolute right-0 w-64 mt-2 overflow-hidden text-gray-800 bg-white shadow-2xl rounded-xl">
                    <div className={`bg-gradient-to-r ${theme.gradient} text-white p-4`}>
                      <div className="flex items-center gap-3">
                        <img
                          src={user.profilePicture || DEFAULT_AVATAR}
                          alt="Profile"
                          className="object-cover border-2 border-white rounded-full w-14 h-14"
                          onError={(e) => {
                            e.target.src = DEFAULT_AVATAR;
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{user.name}</div>
                          <div className="text-xs opacity-90">{user.email}</div>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <Link
                        to={dashboardInfo.route}
                        className="flex items-center px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        <LayoutDashboard size={18} className="mr-3 text-gray-500" />
                        <span className="font-medium">{dashboardInfo.label}</span>
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        <User size={18} className="mr-3 text-gray-500" />
                        <span className="font-medium">My Profile</span>
                      </Link>
                    </div>

                    <div className="border-t">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                      >
                        <LogOut size={18} className="mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                to="/login" 
                className="px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-white/20"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 text-sm font-medium transition-all bg-white rounded-lg shadow-md text-slate-800 hover:shadow-lg hover:scale-105"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="p-2 transition-colors rounded-lg lg:hidden hover:bg-white/20"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t lg:hidden border-white/20 bg-black/20 backdrop-blur-md">
          <nav className="container px-4 py-4 mx-auto space-y-1 max-w-7xl">
            {showCommonNav ? (
              navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActivePath(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium 
                      transition-all duration-200
                      ${active 
                        ? "bg-white/25 backdrop-blur-sm" 
                        : "hover:bg-white/15"
                      }
                    `}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon size={18} />
                    <span>{link.label}</span>
                  </Link>
                );
              })
            ) : (
              <Link
                to={dashboardInfo.route}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium 
                  transition-all duration-200
                  ${location.pathname.startsWith(dashboardInfo.route.split('/').slice(0, 3).join('/'))
                    ? "bg-white/25 backdrop-blur-sm" 
                    : "hover:bg-white/15"
                  }
                `}
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard size={18} />
                <span>{dashboardInfo.label}</span>
              </Link>
            )}
            
            {user && (
              <>
                <div className="h-px my-2 bg-white/20"></div>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg hover:bg-white/15"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={18} />
                  <span>My Profile</span>
                </Link>
               
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full gap-3 px-4 py-3 text-sm font-medium text-red-200 transition-colors rounded-lg hover:bg-red-500/20"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}