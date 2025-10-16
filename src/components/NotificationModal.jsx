import React from "react";

export default function NotificationModal({ open, onClose, messages = [] }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg p-6 bg-white rounded shadow">
        <h3 className="mb-4 text-xl font-bold">Notifications</h3>
        <div className="space-y-3 overflow-auto max-h-64">
          {messages.length === 0 && <div className="text-gray-600">No notifications</div>}
          {messages.map((m, i) => (
            <div key={i} className="p-3 border rounded">
              <div className="text-sm font-medium">{m.title}</div>
              <div className="text-sm text-gray-700">{m.body}</div>
              <div className="mt-1 text-xs text-gray-400">{new Date(m.time).toLocaleString()}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-right">
          <button onClick={onClose} className="px-4 py-2 text-white bg-purple-700 rounded">Close</button>
        </div>
      </div>
    </div>
  );
}
