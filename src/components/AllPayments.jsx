import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { FaReceipt, FaArrowLeft, FaSearch } from "react-icons/fa";

export default function AllPayments() {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [tokenSearch, setTokenSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/payments/", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setPayments(data);
      setFilteredPayments(data);
    } catch (err) {
      toast.error(err.message || "Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = payments;

    // Filter by token number (case-insensitive)
    if (tokenSearch.trim() !== "") {
      filtered = filtered.filter((payment) =>
        String(payment.tokenNumber || "")
          .toLowerCase()
          .includes(tokenSearch.toLowerCase())
      );
    }

    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      filtered = filtered.filter((payment) => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate >= start && paymentDate <= end;
      });
    }

    setFilteredPayments(filtered);
  }, [tokenSearch, startDate, endDate, payments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading payments...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-800">
                All Payments
              </h1>
              <p className="text-gray-600">List of all payment transactions</p>
            </div>
            <button
              onClick={() => navigate("/admin/dashboard/payments")}
              className="flex items-center gap-2 px-4 py-2 font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FaArrowLeft className="text-gray-600" />
              Back
            </button>
          </div>
        </div>

        <div className="grid gap-4 mb-6 md:grid-cols-3">
          {/* Token number search */}
          <div className="relative">
            <FaSearch className="absolute text-gray-400 left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search by token number"
              value={tokenSearch}
              onChange={(e) => setTokenSearch(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaReceipt className="text-xl text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">
                Payment Transactions
              </h2>
            </div>

            {filteredPayments.length === 0 ? (
              <p className="text-gray-600">No payments found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-600 border-b">
                      <th className="p-4">ID</th>
                      <th className="p-4">Token Number</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment._id} className="border-b hover:bg-gray-50">
                        <td className="p-4">{payment._id}</td>
                        <td className="p-4">
                          {payment.tokenNumber ? String(payment.tokenNumber) : "N/A"}
                        </td>
                        <td className="p-4">${payment.amount.toFixed(2)}</td>
                        <td className="p-4 capitalize">{payment.status}</td>
                        <td className="p-4">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
