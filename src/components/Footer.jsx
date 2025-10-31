import React from "react";

export default function Footer() {
  return (
    <footer className="bottom-0 left-0 right-0 z-20 py-4 text-center text-gray-200 bg-gray-800 ">
      <p>&copy; {new Date().getFullYear()} LMS Platform. All Rights Reserved.</p>
      <p className="mt-1 text-sm text-gray-400">
        Learn. Teach. Grow.
      </p>
    </footer>
  );
}