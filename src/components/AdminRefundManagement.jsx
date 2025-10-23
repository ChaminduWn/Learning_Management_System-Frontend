import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { FaUndo, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";

export default function AdminRefundManagement() {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refunding, setRefunding] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refundReason, setRefundReason] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/payments", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Filter only completed payments (eligible for refund)
      const completedPayments = data.filter((p) => p.status === "completed");
      setPayments(completedPayments);
    } catch (err) {
      toast.error(err.message || "Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  const initiateRefund = (payment) => {
    setSelectedPayment(payment);
    setShowRefundModal(true);
  };

  const confirmRefund = async () => {
    if (!refundReason.trim()) {
      toast.error("Please provide a reason for the refund");
      return;
    }

    setRefunding(selectedPayment._id);
    try {
      const res = await fetch(
        `http://localhost:5000/api/payments/${selectedPayment._id}/refund`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: refundReason }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Payment refunded successfully");
      setShowRefundModal(false);
      setRefundReason("");
      setSelectedPayment(null);
      fetchPayments();
    } catch (err) {
      toast.error(err.message || "Failed to refund payment");
    } finally {
      setRefunding(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading refundable payments...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">
            Refund Management
          </h1>
          <p className="text-gray-600">
            Process refunds for completed payments
          </p>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-600">Refundable Payments</p>
            <p className="text-2xl font-bold text-blue-600">{payments.length}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Refundable Amount</p>
            <p className="text-2xl font-bold text-green-600">
              ${payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
            </p>
          </div>
          <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
            <div className="flex items-center gap-2">
              <FaExclamationTriangle className="text-yellow-600" />
              <p className="text-sm font-medium text-yellow-800">
                Refunds cannot be undone
              </p>
            </div>
          </div>
        </div>

        {/* Payments List */}
        {payments.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-lg shadow">
            <FaCheckCircle className="mx-auto mb-4 text-6xl text-green-300" />
            <h3 className="mb-2 text-xl font-semibold text-gray-700">
              No Refundable Payments
            </h3>
            <p className="text-gray-500">
              All payments have been processed or refunded.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Token
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Student
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Course
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Payment Date
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-semibold text-gray-900">
                        #{payment.tokenNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.student?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.student?.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {payment.course?.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.course?.moduleCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">
                        ${payment.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(payment.paidAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => initiateRefund(payment)}
                        disabled={refunding === payment._id}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                      >
                        <FaUndo />
                        {refunding === payment._id ? "Processing..." : "Refund"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Refund Confirmation Modal */}
      {showRefundModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                <FaExclamationTriangle className="text-2xl text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Confirm Refund
              </h2>
            </div>

            <div className="p-4 mb-4 border border-red-200 rounded-lg bg-red-50">
              <p className="mb-2 text-sm font-medium text-red-800">
                ⚠️ This action cannot be undone
              </p>
              <p className="text-xs text-red-700">
                The student will be unenrolled from the course and the payment
                will be refunded to their original payment method.
              </p>
            </div>

            <div className="p-4 mb-4 rounded-lg bg-gray-50">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Token:</span>
                  <span className="font-mono font-semibold">
                    #{selectedPayment.tokenNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Student:</span>
                  <span className="font-semibold">
                    {selectedPayment.student?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Course:</span>
                  <span className="font-semibold">
                    {selectedPayment.course?.title}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">Refund Amount:</span>
                  <span className="text-lg font-bold text-red-600">
                    ${selectedPayment.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Reason for Refund *
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter the reason for this refund..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                rows="3"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRefundModal(false);
                  setSelectedPayment(null);
                  setRefundReason("");
                }}
                className="flex-1 px-4 py-2 font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={refunding}
              >
                Cancel
              </button>
              <button
                onClick={confirmRefund}
                disabled={refunding || !refundReason.trim()}
                className="flex-1 px-4 py-2 font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {refunding ? "Processing..." : "Confirm Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}