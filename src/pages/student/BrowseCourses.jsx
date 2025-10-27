import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Search, Filter, DollarSign, Clock, BookOpen, ArrowRight } from "lucide-react";

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
    let filtered = courses;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.price.toString().includes(query)
      );
    }

    if (priceFilter !== "all") {
      if (priceFilter === "free") {
        filtered = filtered.filter((course) => course.price === 0);
      } else if (priceFilter === "0-10000") {
        filtered = filtered.filter((course) => course.price > 0 && course.price <= 10000);
      } else if (priceFilter === "10000-50000") {
        filtered = filtered.filter((course) => course.price > 10000 && course.price <= 50000);
      } else if (priceFilter === "50000+") {
        filtered = filtered.filter((course) => course.price > 50000);
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center p-8 bg-white shadow-lg rounded-2xl">
          <div className="w-16 h-16 border-4 border-t-4 border-gray-200 rounded-full border-t-indigo-600 animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-gray-50 via-white to-gray-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Hero Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Courses</span>
          </h1>
          <p className="max-w-2xl mx-auto mt-3 text-lg text-gray-600">
            Discover high-quality courses tailored to your learning goals.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 p-6 mb-10 bg-white shadow-md rounded-2xl backdrop-blur-sm sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search by name or price..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 pl-10 pr-4 text-sm transition-all border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="relative sm:w-56">
            <Filter className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="w-full py-3 pl-10 pr-8 text-sm transition-all bg-white border border-gray-200 appearance-none rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Prices</option>
              <option value="free">Free</option>
              <option value="0-10000">0 - 10,000</option>
              <option value="10000-50000">10,000 - 50,000</option>
              <option value="50000+">50,000+</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* No Results */}
        {filteredCourses.length === 0 ? (
          <div className="p-12 text-center bg-white shadow-inner rounded-2xl">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-gray-100 rounded-full">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-700">
              {searchQuery || priceFilter !== "all"
                ? "No courses match your filters."
                : "No courses available yet."}
            </p>
            <button
              onClick={fetchCourses}
              className="inline-flex items-center gap-2 px-6 py-3 mt-4 font-medium text-white transition-all bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:scale-105"
            >
              <ArrowRight size={18} />
              Refresh Courses
            </button>
          </div>
        ) : (
          /* Course Grid */
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <div
                key={course._id}
                className="overflow-hidden transition-all duration-300 bg-white shadow-md rounded-2xl hover:shadow-xl hover:-translate-y-1 group"
              >
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    src={course.thumbnail || "https://via.placeholder.com/400x200?text=Course"}
                    alt={course.title}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/400x200?text=No+Image";
                    }}
                  />
                  <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black/50 to-transparent group-hover:opacity-100"></div>
                  {course.price === 0 && (
                    <span className="absolute px-3 py-1 text-xs font-bold text-white rounded-full bg-emerald-600 top-3 left-3">
                      FREE
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="mb-2 text-xl font-bold text-gray-900 transition-colors line-clamp-2 group-hover:text-indigo-600">
                    {course.title}
                  </h3>
                  <p className="mb-4 text-sm text-gray-600 line-clamp-2">{course.description}</p>

                  {/* Meta */}
                  <div className="flex items-center justify-between mb-5 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      {/* <DollarSign size={16} className="text-emerald-600" /> */}
                      
                      <span className="font-semibold">
                        {course.price === 0 ? "Free" : `${course.price.toLocaleString()} LKR`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock size={16} />
                      <span>{course.duration || "Self-paced"}</span>
                    </div>
                  </div>

                  {/* Enroll Button */}
                  <button
                    onClick={() => handleEnroll(course)}
                    className={`
                      w-full py-3 px-4 rounded-xl font-medium text-white transition-all duration-300
                      flex items-center justify-center gap-2
                      ${course.price === 0
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-md hover:shadow-lg"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg"
                      }
                      transform hover:scale-105
                    `}
                  >
                    {course.price === 0 ? (
                      <>
                        Enroll Now <ArrowRight size={18} />
                      </>
                    ) : (
                      <>
                        Pay & Enroll <ArrowRight size={18} />
                      </>
                    )}
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