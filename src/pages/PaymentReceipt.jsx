import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { FaDownload, FaPrint, FaArrowLeft, FaCheckCircle } from "react-icons/fa";

export default function PaymentReceipt() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayment();
  }, [id]);

  const fetchPayment = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/payments/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setPayment(data);
    } catch (err) {
      toast.error(err.message || "Failed to fetch payment details");
      navigate("/student/payments");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const receiptContent = document.getElementById("receipt-content");
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt - ${payment.tokenNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .receipt { max-width: 800px; margin: 0 auto; }
            .header { text-align: center;  margin-bottom: 40px; border-bottom: 3px solid #333; padding-bottom: 20px; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; color: #555; }
            .value { color: #333; }
            .total { font-size: 24px; font-weight: bold; color: #16a34a; margin-top: 20px; padding-top: 20px; border-top: 2px solid #333; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          ${receiptContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading receipt...</div>
      </div>
    );
  }

  if (!payment) return null;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Action Buttons - Don't print these */}
        <div className="flex gap-4 mb-6 print:hidden">
          <button
            onClick={() => navigate("/student/payments")}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FaArrowLeft /> Back to Payments
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <FaPrint /> Print Receipt
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
          >
            <FaDownload /> Download PDF
          </button>
        </div>

        {/* Receipt Content */}
        <div id="receipt-content" className="p-8 bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="pb-6 mb-8 text-center border-b-4 border-blue-600">
            <h1 className="mb-2 text-3xl font-bold text-gray-800">
              Payment Receipt
            </h1>
            <p className="text-gray-600">Learning Management System</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <FaCheckCircle className="text-2xl text-green-600" />
              <span className="text-lg font-semibold text-green-600">
                Payment Successful
              </span>
            </div>
          </div>

          {/* Token Number - Prominent Display */}
          <div className="p-6 mb-8 text-center border-2 border-blue-200 rounded-lg bg-blue-50">
            <p className="mb-2 text-sm font-medium text-gray-600">
              Payment Token Number
            </p>
            <p className="text-4xl font-bold text-blue-600">
              #{payment.tokenNumber}
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Save this token for your records
            </p>
          </div>

          {/* Payment Details */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-gray-800">
              Payment Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between py-3 border-b">
                <span className="font-medium text-gray-600">Transaction ID:</span>
                <span className="font-mono text-sm text-gray-800">
                  {payment.stripePaymentIntentId}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="font-medium text-gray-600">Payment Date:</span>
                <span className="text-gray-800">
                  {new Date(payment.paidAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="font-medium text-gray-600">Payment Method:</span>
                <span className="text-gray-800 capitalize">
                  {payment.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="font-medium text-gray-600">Status:</span>
                <span className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full">
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Student Information */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-gray-800">
              Student Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between py-3 border-b">
                <span className="font-medium text-gray-600">Name:</span>
                <span className="text-gray-800">{payment.student?.name}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="font-medium text-gray-600">Email:</span>
                <span className="text-gray-800">{payment.student?.email}</span>
              </div>
            </div>
          </div>

          {/* Course Information */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-gray-800">
              Course Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between py-3 border-b">
                <span className="font-medium text-gray-600">Course Title:</span>
                <span className="text-gray-800">{payment.course?.title}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="font-medium text-gray-600">Module Code:</span>
                <span className="text-gray-800">{payment.course?.moduleCode}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="font-medium text-gray-600">Course Price:</span>
                <span className="text-gray-800">
                  ${payment.course?.price?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Amount Paid */}
          <div className="pt-6 mb-8 border-t-4 border-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-800">
                Total Amount Paid:
              </span>
              <span className="text-4xl font-bold text-green-600">
                ${payment.amount.toFixed(2)}
              </span>
            </div>
            <p className="mt-2 text-sm text-right text-gray-500">
              {payment.currency}
            </p>
          </div>

          {/* Footer */}
          <div className="pt-6 mt-8 text-center border-t">
            <p className="mb-2 text-sm text-gray-600">
              Thank you for your purchase!
            </p>
            <p className="text-xs text-gray-500">
              This is an official receipt for your payment. Keep it for your records.
            </p>
            <p className="mt-4 text-xs text-gray-400">
              Generated on {new Date().toLocaleDateString()} • Learning Management System
            </p>
          </div>
        </div>

        {/* Additional Info - Don't print this */}
        <div className="p-4 mt-6 border border-blue-200 rounded-lg bg-blue-50 print:hidden">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> If you need to refund this payment, please
            contact the administrator. Refunds typically take 5-10 business days
            to process.
          </p>
        </div>
      </div>
    </div>
  );
}