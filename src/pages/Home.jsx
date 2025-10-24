import React, { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, BookOpen, Users, Clock, ArrowRight } from "lucide-react";

const Home = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const today = new Date();
  const isToday = (day) =>
    currentMonth.getMonth() === today.getMonth() &&
    currentMonth.getFullYear() === today.getFullYear() &&
    day === today.getDate();

  const events = {
    5: { title: "Math Quiz", type: "exam" },
    12: { title: "Project Submission", type: "assignment" },
    20: { title: "Guest Lecture", type: "event" },
  };

  return (
    <>
      {/* Hero Banner */}
      <section className="relative overflow-hidden text-white bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container relative z-10 px-4 py-24 mx-auto text-center max-w-7xl">
          <h1 className="text-4xl font-bold md:text-6xl">
            Welcome to <span className="text-yellow-300">EduLearn</span>
          </h1>
          <p className="max-w-2xl mx-auto mt-4 text-lg opacity-90">
            Empower your learning journey with interactive courses, live sessions, and a vibrant community.
          </p>
          <div className="flex flex-col gap-4 mt-8 sm:flex-row sm:justify-center">
            <a
              href="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 text-lg font-medium text-purple-700 transition-all bg-white rounded-lg shadow-lg hover:shadow-xl hover:scale-105"
            >
              Explore Courses <ArrowRight size={20} />
            </a>
            <a
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 text-lg font-medium transition-all border-2 border-white rounded-lg hover:bg-white/10 backdrop-blur-sm"
            >
              Get Started Free
            </a>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="p-6 text-center transition-all bg-white shadow-md rounded-xl hover:shadow-xl">
              <div className="inline-flex p-3 mb-4 bg-indigo-100 rounded-full">
                <BookOpen className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold">Rich Courses</h3>
              <p className="mt-2 text-gray-600">Learn from industry experts with structured content.</p>
            </div>
            <div className="p-6 text-center transition-all bg-white shadow-md rounded-xl hover:shadow-xl">
              <div className="inline-flex p-3 mb-4 rounded-full bg-emerald-100">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold">Community</h3>
              <p className="mt-2 text-gray-600">Connect with peers and mentors globally.</p>
            </div>
            <div className="p-6 text-center transition-all bg-white shadow-md rounded-xl hover:shadow-xl">
              <div className="inline-flex p-3 mb-4 bg-purple-100 rounded-full">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold">Flexible Schedule</h3>
              <p className="mt-2 text-gray-600">Learn at your own pace, anytime, anywhere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto max-w-7xl">
          <h2 className="mb-8 text-3xl font-bold text-center text-gray-800">Upcoming Events</h2>
          <div className="max-w-2xl p-6 mx-auto shadow-inner bg-gray-50 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-700">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-2 transition-colors rounded-lg hover:bg-gray-200"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-2 transition-colors rounded-lg hover:bg-gray-200"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="py-2 text-xs font-medium text-gray-500">
                  {day}
                </div>
              ))}

              {Array.from({ length: firstDay }, (_, i) => (
                <div key={`empty-${i}`} className="py-3"></div>
              ))}

              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const event = events[day];
                return (
                  <div
                    key={day}
                    className={`
                      relative py-3 text-sm font-medium transition-all rounded-lg
                      ${isToday(day) ? "bg-indigo-600 text-white shadow-md" : "hover:bg-gray-100"}
                    `}
                  >
                    {day}
                    {event && (
                      <div className="absolute h-1 rounded-full inset-x-1 bottom-1"
                        style={{
                          backgroundColor: event.type === "exam" ? "#f59e0b" : event.type === "assignment" ? "#10b981" : "#8b5cf6"
                        }}
                      ></div>
                    )}
                  </div>
                );
              })}
            </div>

            {Object.keys(events).length > 0 && (
              <div className="mt-6 space-y-2">
                {Object.entries(events).map(([day, event]) => (
                  <div key={day} className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm">
                    <div className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: event.type === "exam" ? "#f59e0b" : event.type === "assignment" ? "#10b981" : "#8b5cf6"
                      }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">
                      {event.title} <span className="text-gray-500">— Day {day}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;