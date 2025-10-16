import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export default function AdminCourseApproval() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [reason, setReason] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("http://localhost:5000/api/courses", {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await res.json();
      setCourses(data);
    })();
  }, [user]);

  const approve = async (id) => {
    await fetch(`http://localhost:5000/api/courses/${id}/approve`, { method: "PATCH", headers: { Authorization: `Bearer ${user.token}` }});
    setCourses(prev => prev.map(c => c._id === id ? {...c, status: "Approved"} : c));
  };

  const reject = async (id) => {
    if (!reason) { alert("Provide a reason"); return; }
    await fetch(`http://localhost:5000/api/courses/${id}/reject`, {
      method: "PATCH",
      headers: { "Content-Type":"application/json", Authorization: `Bearer ${user.token}` },
      body: JSON.stringify({ reason })
    });
    setCourses(prev => prev.map(c => c._id === id ? {...c, status: "Rejected", rejectReason: reason} : c));
    setReason(""); setSelected(null);
  };

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold text-purple-700">Course Approvals</h1>
      <div className="space-y-4">
        {courses.map(c => (
          <div key={c._id} className="flex justify-between p-4 bg-white rounded shadow">
            <div>
              <div className="font-semibold">{c.title} <span className="text-sm text-gray-500">({c.moduleCode})</span></div>
              <div className="text-sm text-gray-600">By: {c.instructorId?.name} - {c.status}</div>
              {c.status === "Rejected" && <div className="text-red-600">Reason: {c.rejectReason}</div>}
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => approve(c._id)} className="px-3 py-1 text-white bg-green-600 rounded">Approve</button>
              <button onClick={() => setSelected(c._id)} className="px-3 py-1 text-white bg-red-600 rounded">Reject</button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="mt-4">
          <textarea className="w-full p-2 border rounded" placeholder="Reject reason" value={reason} onChange={e=>setReason(e.target.value)} />
          <div className="mt-2 text-right">
            <button onClick={() => reject(selected)} className="px-4 py-2 text-white bg-red-600 rounded">Submit Reject</button>
            <button onClick={() => { setSelected(null); setReason(""); }} className="px-4 py-2 ml-2 bg-gray-300 rounded">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
