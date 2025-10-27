import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Loader2, AlertTriangle, CheckCircle, RotateCcw, X } from "lucide-react";
import { toast } from "react-toastify";

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-xl text-slate-600"
        >
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          Loading refundable payments...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-slate-50 via-white to-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl">
              <RotateCcw className="w-6 h-6 text-slate-700" />
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900">
              Refund Management
            </h1>
          </div>
          <p className="text-slate-600">Process refunds for completed payments</p>
        </motion.div>

        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 gap-4 mt-6 mb-6 md:grid-cols-3"
        >
          <div className="p-4 transition-all duration-300 bg-white shadow-md rounded-2xl hover:shadow-lg">
            <p className="text-sm text-slate-600">Refundable Payments</p>
            <p className="text-2xl font-bold text-indigo-600">{payments.length}</p>
          </div>
          <div className="p-4 transition-all duration-300 bg-white shadow-md rounded-2xl hover:shadow-lg">
            <p className="text-sm text-slate-600">Total Refundable Amount</p>
            <p className="text-2xl font-bold text-green-600">
             LKR  {payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
            </p>
          </div>
          <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-2xl">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm font-medium text-yellow-800">
                Refunds cannot be undone
              </p>
            </div>
          </div>
        </motion.div>

        {/* Payments List */}
        {payments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-12 text-center bg-white shadow-md rounded-2xl"
          >
            <CheckCircle className="mx-auto mb-4 text-6xl text-green-300" />
            <h3 className="mb-2 text-xl font-semibold text-slate-700">
              No Refundable Payments
            </h3>
            <p className="text-slate-500">
              All payments have been processed or refunded.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="overflow-x-auto bg-white shadow-md rounded-2xl"
          >
            <table className="min-w-full">
              <thead className="bg-slate-800 text-slate-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase">
                    Token
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase">
                    Student
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase">
                    Course
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase">
                    Payment Date
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {payments.map((payment, index) => (
                  <motion.tr
                    key={payment._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-semibold text-slate-900">
                        #{payment.tokenNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {payment.student?.name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {payment.student?.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">
                        {payment.course?.title}
                      </div>
                      <div className="text-sm text-slate-500">
                        {payment.course?.moduleCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-900">
                        {payment.amount.toFixed(2)} LKR
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                      {new Date(payment.paidAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => initiateRefund(payment)}
                        disabled={refunding === payment._id}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 transition-all duration-200 rounded-lg bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RotateCcw size={16} />
                        {refunding === payment._id ? (
                          <>
                            Processing... <Loader2 className="w-4 h-4 animate-spin" />
                          </>
                        ) : (
                          "Refund"
                        )}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* Refund Confirmation Modal */}
        {showRefundModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          >
            <div className="w-full max-w-md p-6 bg-white shadow-xl rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  Confirm Refund
                </h2>
              </div>

              <div className="p-4 mb-4 border border-red-200 rounded-xl bg-red-50">
                <p className="mb-2 text-sm font-medium text-red-800">
                  <AlertTriangle className="inline-block w-4 h-4 mr-1" />
                  This action cannot be undone
                </p>
                <p className="text-xs text-red-700">
                  The student will be unenrolled from the course and the payment
                  will be refunded to their original payment method.
                </p>
              </div>

              <div className="p-4 mb-4 rounded-xl bg-slate-50">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Token:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      #{selectedPayment.tokenNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Student:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedPayment.student?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Course:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedPayment.course?.title}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="text-slate-600">Refund Amount:</span>
                    <span className="text-lg font-bold text-red-600">
                      {selectedPayment.amount.toFixed(2)} LKR
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Reason for Refund *
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Enter the reason for this refund..."
                  className="w-full px-3 py-2 text-sm transition-all border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                  className="flex-1 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={refunding}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRefund}
                  disabled={refunding || !refundReason.trim()}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {refunding ? (
                    <>
                      Processing... <Loader2 className="inline-block w-4 h-4 ml-2 animate-spin" />
                    </>
                  ) : (
                    "Confirm Refund"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}