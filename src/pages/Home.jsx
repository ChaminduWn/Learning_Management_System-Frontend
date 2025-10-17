import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { BookOpen, Users, ClipboardList } from "lucide-react";

export default function Home() {
  const { user } = useContext(AuthContext);

  return (
    
    <div className="p-8 text-center min-h-[80vh] bg-gray-50">
      <h1 className="mb-4 text-3xl font-bold text-purple-700">
        Welcome to LMS Platform
      </h1>

      {user ? (
        <>
          <p className="mb-8 text-lg text-gray-700">
            Hello, <span className="font-semibold">{user.name}</span> 👋 <br />
            You are logged in as <b>{user.role}</b>.
          </p>

          <div className="grid max-w-4xl gap-6 mx-auto sm:grid-cols-3">
            {/* Role-based cards */}
            {user.role === "Student" && (
              <>
                <Link
                  to="/courses"
                  className="flex flex-col items-center p-6 transition bg-white shadow-md rounded-xl hover:shadow-lg"
                >
                  <BookOpen size={40} className="mb-3 text-green-600" />
                  <h3 className="font-semibold text-gray-800">My Courses</h3>
                  <p className="text-sm text-gray-500">
                    View and manage enrolled courses
                  </p>
                </Link>

                <Link
                  to="/profile"
                  className="flex flex-col items-center p-6 transition bg-white shadow-md rounded-xl hover:shadow-lg"
                >
                  <Users size={40} className="mb-3 text-blue-600" />
                  <h3 className="font-semibold text-gray-800">Profile</h3>
                  <p className="text-sm text-gray-500">
                    View or update your profile
                  </p>
                </Link>
              </>
            )}

            {user.role === "Instructor" && (
              <>
                <Link
                  to="/instructor/courses"
                  className="flex flex-col items-center p-6 transition bg-white shadow-md rounded-xl hover:shadow-lg"
                >
                  <ClipboardList size={40} className="mb-3 text-blue-600" />
                  <h3 className="font-semibold text-gray-800">Manage Courses</h3>
                  <p className="text-sm text-gray-500">
                    Create and edit your courses
                  </p>
                </Link>

                <Link
                  to="/students"
                  className="flex flex-col items-center p-6 transition bg-white shadow-md rounded-xl hover:shadow-lg"
                >
                  <Users size={40} className="mb-3 text-green-600" />
                  <h3 className="font-semibold text-gray-800">My Students</h3>
                  <p className="text-sm text-gray-500">
                    Track student progress and feedback
                  </p>
                </Link>
              </>
            )}

            {user.role === "Admin" && (
              <>
                <Link
                  to="/admin/users"
                  className="flex flex-col items-center p-6 transition bg-white shadow-md rounded-xl hover:shadow-lg"
                >
                  <Users size={40} className="mb-3 text-red-600" />
                  <h3 className="font-semibold text-gray-800">User Management</h3>
                  <p className="text-sm text-gray-500">
                    View, activate or deactivate users
                  </p>
                </Link>

                <Link
                  to="/admin/courses"
                  className="flex flex-col items-center p-6 transition bg-white shadow-md rounded-xl hover:shadow-lg"
                >
                  <BookOpen size={40} className="mb-3 text-purple-600" />
                  <h3 className="font-semibold text-gray-800">All Courses</h3>
                  <p className="text-sm text-gray-500">
                    Manage course catalog and details
                  </p>
                </Link>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="mb-6 text-lg text-gray-700">
            Please <Link to="/login" className="text-purple-600 underline">login</Link> or{" "}
            <Link to="/register" className="text-purple-600 underline">register</Link> to continue.
          </p>
        </>
      )}
    </div>
  );
}
