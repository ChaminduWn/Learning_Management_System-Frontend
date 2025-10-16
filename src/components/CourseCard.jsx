import React from "react";

export default function CourseCard({ course, onDelete, onEdit }) {
  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex items-start space-x-4">
        <img src={course.thumbnail || "/placeholder-300x200.png"} alt={course.title} className="object-cover w-40 h-24 rounded" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{course.title} <span className="text-sm text-gray-500">({course.moduleCode})</span></h3>
          <p className="mt-1 text-sm text-gray-600">{course.description?.slice(0, 120)}</p>
          <div className="mt-2 text-sm">
            <span className="font-medium">Category:</span> {course.category} &nbsp;|&nbsp;
            <span className="font-medium">Price:</span> Rs. {course.price}
          </div>
          <div className="mt-2">
            <span className={`px-2 py-1 rounded text-xs ${course.status === "Pending" ? "bg-yellow-100 text-yellow-800" : course.status === "Approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {course.status}
            </span>
            {course.status === "Rejected" && <div className="mt-2 text-sm text-red-600">Reason: {course.rejectReason}</div>}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={() => onEdit && onEdit(course)} className="px-3 py-1 text-white bg-blue-600 rounded">Edit</button>
        <button onClick={() => onDelete && onDelete(course._id)} className="px-3 py-1 text-white bg-red-600 rounded">Delete</button>
      </div>
    </div>
  );
}
