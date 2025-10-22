import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { stripePromise } from "../App"; 

// Payment Form Component
// ==========================
function PaymentForm({ clientSecret, course }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) {
      toast.error("Stripe not loaded");
      return;
    }

    setProcessing(true);
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: user.name || "Anonymous",
              email: user.email,
            },
          },
        }
      );

      if (error) throw new Error(error.message);

      if (paymentIntent.status === "succeeded") {
        // Step 1️⃣: Record payment in backend
        const res = await fetch("http://localhost:5000/api/payments/process", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            courseId: course._id,
            amount: course.price,
            paymentIntentId: paymentIntent.id,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        toast.success("Payment successful! Enrolling you in the course...");

        // Step 2️⃣: Automatically enroll the student after payment
        const enrollRes = await fetch(
          `http://localhost:5000/api/courses/${course._id}/enroll`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const enrollData = await enrollRes.json();
        if (!enrollRes.ok)
          throw new Error(enrollData.message || "Enrollment failed");

        // Step 3️⃣: Redirect to the course content
        setTimeout(() => {
          navigate(`/student/dashboard/course/${course._id}`);
        }, 1500);
      }
    } catch (err) {
      toast.error(err.message || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePayment}>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Card Details
        </label>
        <div className="p-3 border rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": { color: "#aab7c4" },
                },
                invalid: { color: "#9e2146" },
              },
            }}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Test card: 4242 4242 4242 4242 | Exp: 12/34 | CVV: 123
        </p>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          type="button"
          onClick={() => navigate("/courses")}
          className="flex-1 px-6 py-3 font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
          disabled={processing}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={processing || !stripe || !elements}
        >
          {processing ? "Processing..." : `Pay $${course.price}`}
        </button>
      </div>
    </form>
  );
}

// ==========================
// Main Payment Page
// ==========================
export default function Payment() {
  const { id: courseId } = useParams(); // ✅ Fixed param name
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseAndIntent = async () => {
      try {
        // Fetch course details
        const courseRes = await fetch(
          `http://localhost:5000/api/courses/${courseId}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        const courseData = await courseRes.json();
        if (!courseRes.ok) throw new Error(courseData.message);

        // Redirect if free course
        if (courseData.price === 0) {
          toast.info("This is a free course!");
          navigate("/courses");
          return;
        }

        setCourse(courseData);

        // Create payment intent
        const intentRes = await fetch(
          "http://localhost:5000/api/payments/create-intent",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ courseId }),
          }
        );
        const intentData = await intentRes.json();
        if (!intentRes.ok) throw new Error(intentData.message);

        setClientSecret(intentData.clientSecret);
      } catch (err) {
        toast.error(err.message);
        navigate("/courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndIntent();
  }, [courseId, user.token, navigate]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!course || !clientSecret) return null;

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen py-8 bg-gray-50">
        <div className="max-w-4xl px-4 mx-auto">
          <div className="p-6 mb-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-2xl font-bold">Complete Your Purchase</h2>

            <div className="pb-4 mb-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                {course.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600">{course.moduleCode}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-gray-700">Course Price:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${course.price}
                </span>
              </div>
            </div>

            <PaymentForm clientSecret={clientSecret} course={course} />

            <div className="p-4 mt-6 border border-yellow-200 rounded-lg bg-yellow-50">
              <p className="text-sm text-yellow-800">
                <strong>Test Mode:</strong> Use the test card above for
                simulation. No real charge will occur.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Elements>
  );
}