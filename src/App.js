import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PrivateRoute from "./components/PrivateRoute";
import StudentDashboard from "./pages/student/StudentDashboard";
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourseApproval from "./components/AdminCourseApproval";
import AdminUserManagement from "./components/AdminUserManagement";



function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />


          {/* Protected routes */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute roles={["Admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        >
          <Route path="users" element={<AdminUserManagement />} />
          <Route path="course" element={<AdminCourseApproval />} />
        </Route>

        <Route
          path="/instructor/dashboard"
          element={
            <PrivateRoute roles={["Instructor"]}>
              <InstructorDashboard />
            </PrivateRoute>
          }
        />
          

        <Route
          path="/student/dashboard"
          element={
            <PrivateRoute roles={["Student"]}>
              <StudentDashboard />
            </PrivateRoute>
          }
        />

        {/* Optional unauthorized page */}
        <Route
          path="/unauthorized"
          element={<h1 className="mt-20 text-2xl text-center text-red-600">Access Denied 🚫</h1>}
        />

      </Routes>
    </Router>
  );
}

export default App;