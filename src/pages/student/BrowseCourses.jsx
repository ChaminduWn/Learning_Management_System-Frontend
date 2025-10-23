import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function BrowseCourses() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    // Filter courses based on search query and price range
    let filtered = courses;

    // Search by course name or fee
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.price.toString().includes(query)
      );
    }

    // Filter by price range
    if (priceFilter !== "all") {
      if (priceFilter === "free") {
        filtered = filtered.filter((course) => course.price === 0);
      } else if (priceFilter === "0-50") {
        filtered = filtered.filter((course) => course.price > 0 && course.price <= 50);
      } else if (priceFilter === "50-100") {
        filtered = filtered.filter((course) => course.price > 50 && course.price <= 100);
      } else if (priceFilter === "100+") {
        filtered = filtered.filter((course) => course.price > 100);
      }
    }

    setFilteredCourses(filtered);
  }, [searchQuery, priceFilter, courses]);

  const fetchCourses = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/courses/approved", {
        headers: user ? { Authorization: `Bearer ${user.token}` } : {},
      });
      const data = await res.json();

      if (!Array.isArray(data)) {
        toast.error(data.message || "Unexpected response format");
        setCourses([]);
        setFilteredCourses([]);
      } else {
        setCourses(data);
        setFilteredCourses(data);
      }
    } catch (err) {
      toast.error("Error loading courses");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (course) => {
    if (!user || user.role !== "Student") {
      toast.error("Please log in as a student to enroll");
      navigate("/login");
      return;
    }

    if (course.price === 0) {
      try {
        const res = await fetch(`http://localhost:5000/api/courses/${course._id}/enroll`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        toast.success("Successfully enrolled!");
        navigate(`/student/dashboard/course/${course._id}`);
      } catch (err) {
        toast.error(err.message);
      }
    } else {
      navigate(`/payment/${course._id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-4 border-gray-200 rounded-full border-t-green-600 animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-gray-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-8 text-3xl font-extrabold text-center text-gray-900">
          Explore Our Courses
        </h2>
        <div className="flex flex-col gap-4 mb-8 sm:flex-row">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by course name or price..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
          <div className="w-full mb-10 sm:w-48">
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="all">All Prices</option>
              <option value="free">Free</option>
              <option value="0-10000">0 - 10000</option>
              <option value="10000-50000">10000 - 50000</option>
              <option value="50000+">50000+</option>
            </select>
          </div>
        </div>
        {filteredCourses.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg text-gray-600">
              {searchQuery || priceFilter !== "all"
                ? "No courses match your search or filter."
                : "No courses available at the moment."}
            </p>
            <button
              onClick={fetchCourses}
              className="px-6 py-2 mt-4 text-white transition duration-300 bg-green-600 rounded-lg hover:bg-green-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ">

            {filteredCourses.map((course) => (
              <div
                key={course._id}
                className="overflow-hidden transition duration-300 transform bg-white rounded-lg shadow-lg hover:scale-105"
              >
                <div className="h-48 bg-gray-200">
                  <img
                    src={course.thumbnail || "https://via.placeholder.com/400x200"}
                    alt={course.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">{course.title}</h3>
                  <p className="mb-4 text-gray-600 line-clamp-3">{course.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-500">
                      {course.price === 0 ? "Free" : `Rs.${course.price}`}
                    </span>
                    <span className="text-sm text-gray-500">
                      {course.duration || "Self-paced"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleEnroll(course)}
                    className="w-full px-4 py-2 text-white transition duration-300 bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    {course.price === 0 ? "Enroll Now" : "Pay & Enroll"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}