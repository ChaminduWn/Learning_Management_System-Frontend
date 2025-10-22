import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { Award, Download, User } from "lucide-react";

export default function CertificateGenerator() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || "");
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date] = useState(new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }));
  const [showCertificate, setShowCertificate] = useState(false);
  const certificateRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.token) {
      toast.error("Please log in to Claim certificate");
      navigate("/login");
      return;
    }
    fetchCourse();
  }, [id, user, navigate]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch course");
      
      if (!data.isEnrolled) {
        toast.error("You must be enrolled in this course");
        navigate("/courses");
        return;
      }

      if (data.progress !== 100) {
        toast.error("You must complete all modules before generating certificate");
        navigate(`/student/dashboard/course/${id}`);
        return;
      }

      setCourse(data);
    } catch (err) {
      toast.error(err.message);
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setShowCertificate(true);
    toast.success("Certificate generated! You can now download or print it.");
  };

  const handleDownload = () => {
    window.print();
  };

  const handleReset = () => {
    setShowCertificate(false);
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!course) {
    return null;
  }

  if (showCertificate) {
    return (
      <div className="min-h-screen p-4 bg-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 mb-4 print:hidden">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-white bg-gray-600 rounded hover:bg-gray-700"
            >
              Edit Details
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
            >
              <Download size={20} />
              Download/Print
            </button>
          </div>

          <div 
            ref={certificateRef}
            id="certificate-print"
            className="bg-white shadow-lg"
            style={{
              width: '100%',
              minHeight: '600px',
              padding: '3rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <div className="flex flex-col h-full p-12 bg-white border-8 border-yellow-400 border-double" style={{ minHeight: '500px' }}>
              <div className="text-center">
                <Award className="w-20 h-20 mx-auto mb-4 text-purple-600" />
                <h1 className="mb-2 font-serif text-5xl font-bold text-gray-800">
                  Certificate of Completion
                </h1>
                <div className="w-32 h-1 mx-auto mb-1 bg-gradient-to-r from-purple-600 to-pink-600"></div>
              </div>

              <div className="flex flex-col justify-center flex-grow py-8 space-y-2 text-center">
                <p className="text-xl text-gray-600">This is to certify that</p>
                <h2 className="inline-block px-8 pb-2 mx-auto font-serif text-4xl font-bold text-gray-800 border-b-2 border-gray-300">
                  {name}
                </h2>
                <p className="text-xl text-gray-600">has successfully completed</p>
                <h3 className="text-3xl font-semibold text-purple-700">
                  {course.title}
                </h3>
                <p className="mt-4 text-lg text-gray-500">
                  Completed on {date}
                </p>
              </div>

              <div className="flex items-center justify-between pt-8 mt-auto">
                <div className="flex-1 text-center">
                  <div className="w-40 mx-auto mb-2 border-t-2 border-gray-400"></div>
                  <p className="text-sm text-gray-600">Instructor Signature</p>
                </div>
                <div className="flex-1 text-center">
                  <Award className="w-16 h-16 mx-auto text-purple-600" />
                </div>
                <div className="flex-1 text-center">
                  <div className="w-40 mx-auto mb-2 border-t-2 border-gray-400"></div>
                  <p className="text-sm text-gray-600">Director Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #certificate-print, #certificate-print * {
              visibility: visible;
            }
            #certificate-print {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-100 to-pink-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
        <div className="mb-6 text-center">
          <Award className="w-16 h-16 mx-auto mb-4 text-purple-600" />
          <h2 className="mb-2 text-3xl font-bold text-gray-800">Claim Certificate</h2>
          <p className="text-gray-600">Congratulations on completing the course!</p>
        </div>

        <div className="p-4 mb-6 rounded-lg bg-purple-50">
          <p className="mb-1 text-sm text-gray-600">Course</p>
          <p className="text-lg font-semibold text-gray-800">{course.title}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              <User className="inline w-4 h-4 mr-1" />
              Your Name (as it should appear on certificate)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Completion Date
            </label>
            <input
              type="text"
              value={date}
              disabled
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>

          <button
            onClick={handleGenerate}
            className="w-full px-6 py-3 font-semibold text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl"
          >
            Claim Certificate
          </button>
        </div>
      </div>
    </div>
  );
}