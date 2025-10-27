import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { FaReceipt, FaCalendarAlt, FaBook, FaDollarSign } from "react-icons/fa";

export default function StudentPaymentHistory() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/payments/my-payments", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setPayments(data);
    } catch (err) {
      toast.error(err.message || "Failed to fetch payment history");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: "bg-green-100 text-green-800",
      refunded: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full ${
          styles[status] || styles.pending
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading payment history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">
            Payment History
          </h1>
          <p className="text-gray-600">
            View all your course purchase transactions
          </p>
        </div>

        {payments.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-lg shadow">
            <FaReceipt className="mx-auto mb-4 text-6xl text-gray-300" />
            <h3 className="mb-2 text-xl font-semibold text-gray-700">
              No Payments Yet
            </h3>
            <p className="text-gray-500">
              You haven't made any course purchases yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment._id}
                className="p-6 transition-shadow bg-white rounded-lg shadow hover:shadow-md"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  {/* Course Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      {payment.course?.thumbnail ? (
                        <img
                          src={payment.course.thumbnail}
                          alt={payment.course.title}
                          className="object-cover w-16 h-16 rounded-lg"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-16 h-16 bg-gray-200 rounded-lg">
                          <FaBook className="text-2xl text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="mb-1 text-lg font-semibold text-gray-800">
                          {payment.course?.title || "Course Deleted"}
                        </h3>
                        <p className="mb-2 text-sm text-gray-500">
                          {payment.course?.moduleCode || "N/A"}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaCalendarAlt className="text-gray-400" />
                          <span>
                            {new Date(payment.paidAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <div className="flex items-center gap-2">
                      <FaDollarSign className="text-green-600" />
                      <span className="text-2xl font-bold text-gray-800">
                        ${payment.amount.toFixed(2)}
                      </span>
                    </div>
                    {getStatusBadge(payment.status)}
                    {payment.tokenNumber && (
                      <div className="px-3 py-1 font-mono text-xs text-gray-700 bg-gray-100 rounded">
                        Token: #{payment.tokenNumber}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      {payment.paymentMethod || "card"} • {payment.currency}
                    </p>
                  </div>
                </div>

                {/* Transaction ID and View Receipt */}
                <div className="pt-4 mt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Transaction ID:{" "}
                    <span className="font-mono">{payment.stripePaymentIntentId}</span>
                  </p>
                  <button
                    onClick={() => navigate(`/payments/receipt/${payment._id}`)}
                    className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                    View Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {payments.length > 0 && (
          <div className="p-6 mt-8 bg-white rounded-lg shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Summary</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-gray-800">{payments.length}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-green-600">
                  LKR
                  {payments
                    .filter((p) => p.status === "completed")
                    .reduce((sum, p) => sum + p.amount, 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600">Refunded</p>
                <p className="text-2xl font-bold text-red-600">
                  {payments.filter((p) => p.status === "refunded").length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}