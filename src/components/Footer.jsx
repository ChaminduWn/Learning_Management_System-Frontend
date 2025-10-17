import React from "react";

export default function Footer() {
  return (
    <footer className="py-4 mt-10 text-center text-gray-200 bg-gray-800">
      <p>&copy; {new Date().getFullYear()} LMS Platform. All Rights Reserved.</p>
      <p className="mt-1 text-sm text-gray-400">
        Learn. Teach. Grow.
      </p>
    </footer>
  );
}
