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
import EditCourse from "./pages/courses/EditCourse";
import MyCourses from "./pages/courses/MyCourses";
import AddCourse from "./pages/courses/AddCourse";
import Profile from "./components/Profile";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import ManageCourseContent from "./pages/courses/ManageCourseContent";
import CourseView from "./pages/student/CourseView";
import BrowseCourses from "./pages/student/BrowseCourses";
import CertificateGenerator from "./pages/student/CertificateGenerator";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Payment from "./pages/Payment";
import AdminRefundManagement from "./components/AdminRefundManagement";
import AdminPayments from "./pages/AdminPayments";
import StudentPaymentHistory from "./pages/StudentPaymentHistory";
import PaymentReceipt from "./pages/PaymentReceipt";

console.log("Stripe Publishable Key:", process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const stripeKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
if (!stripeKey) {
  console.error("Error: REACT_APP_STRIPE_PUBLISHABLE_KEY is not defined in .env");
}
export const stripePromise = stripeKey ? loadStripe(stripeKey) : null;


function App() {
  return (
    
    <Router>
      <ToastContainer position="top-right" autoClose={900} hideProgressBar={false} newestOnTop={false} closeOnClick
        rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" style={{ top: '80px' }}
      />
      
      <Routes>
        <Route element={<Layout />}>
        
        <Route path="/" element={<Home />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/courses" element={<BrowseCourses />} />    
        <Route path="/student/dashboard/certificate/:id" element={<CertificateGenerator />} />

        <Route path="payments/receipt/:id" element={<PaymentReceipt />} />

          


        

  
        

         <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/payment/:id"
            element={
              <PrivateRoute roles={["Student"]}>
                <Elements stripe={stripePromise}>
                  <Payment />
                </Elements>
              </PrivateRoute>
            }
          />
                

        {/* Protected routes */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute roles={["Admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminUserManagement />} />
          <Route path="profile" element={<Profile />} />
          <Route path="users" element={<AdminUserManagement />} />
          <Route path="course" element={<AdminCourseApproval />} />
          <Route path="refund" element={<AdminRefundManagement />} />
          <Route path="payments" element={<AdminPayments />} />  

          
        </Route>

        <Route
          path="/instructor/dashboard"
          element={
            <PrivateRoute roles={["Instructor"]}>
              <InstructorDashboard />
            </PrivateRoute>
          }
        >
          <Route path="profile" element={<Profile />} />
          <Route path="my-courses" element={<MyCourses />} />
          <Route path="add" element={<AddCourse />} />
          <Route path="edit-course/:id" element={<EditCourse />} />
          <Route path="manage-content/:courseId" element={<ManageCourseContent />} />
        </Route>

        <Route
          path="/student/dashboard"
          element={
            <PrivateRoute roles={["Student"]}>
              <StudentDashboard />
            </PrivateRoute>
          }
        >
          <Route path="profile" element={<Profile />} />
          <Route path="course/:id" element={<CourseView />} />
          <Route path="payments" element={<StudentPaymentHistory />} /> 
          <Route path="payments/receipt/:id" element={<PaymentReceipt />} />
          
        </Route>

       
        <Route
          path="/unauthorized"
          element={
            <h1 className="mt-20 text-2xl text-center text-red-600">
              Access Denied 🚫
            </h1>
          }
        />
        </Route>
      </Routes>
      
    </Router>
  );
}

export default App;
