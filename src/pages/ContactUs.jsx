import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageSquare, 
  HeadphonesIcon, 
  Shield, 
  ArrowRight,
  Send
} from 'lucide-react';

export default function ContactPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-4 py-16 bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <div className="max-w-5xl mx-auto">
        {/* Hero Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 md:text-5xl">
            Get In Touch
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            We’re here to help with your learning journey — anytime, anywhere.
          </p>
        </div>

        {/* Main Contact Card */}
        <div className="p-8 mb-10 bg-white border shadow-xl rounded-3xl backdrop-blur-sm border-white/20">
          <div className="grid gap-10 md:grid-cols-2">
            {/* Left: Contact Info */}
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-800">Contact Information</h2>

              {/* Email */}
              <div className="flex items-start group">
                <div className="flex items-center justify-center w-12 h-12 mr-4 transition-all bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl group-hover:scale-110">
                  <Mail className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-gray-800">Email Us</h3>
                  <a href="mailto:support@lmsystem.com" className="text-indigo-600 hover:underline">support@lmsystem.com</a>
                  <br />
                  <a href="mailto:info@lmsystem.com" className="text-indigo-600 hover:underline">info@lmsystem.com</a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start group">
                <div className="flex items-center justify-center w-12 h-12 mr-4 transition-all bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl group-hover:scale-110">
                  <Phone className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-gray-800">Call Us</h3>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                  <p className="text-gray-600">+1 (555) 765-4321</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start group">
                <div className="flex items-center justify-center w-12 h-12 mr-4 transition-all bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl group-hover:scale-110">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-gray-800">Visit Us</h3>
                  <p className="leading-relaxed text-gray-600">
                    123 Education Street<br />
                    Learning District<br />
                    New York, NY 10001
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Support & Hours */}
            <div className="space-y-6">
              {/* Office Hours */}
              <div className="p-6 transition-all bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl hover:shadow-md">
                <div className="flex items-center mb-4">
                  <Clock className="w-6 h-6 mr-3 text-indigo-600" />
                  <h3 className="text-lg font-bold text-gray-800">Office Hours</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium">Mon - Fri</span>
                    <span className="text-indigo-600">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Saturday</span>
                    <span className="text-indigo-600">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Sunday</span>
                    <span className="text-red-600">Closed</span>
                  </div>
                </div>
              </div>

              {/* Live Support */}
              <div className="p-6 transition-all bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl hover:shadow-md">
                <div className="flex items-center mb-4">
                  <HeadphonesIcon className="w-6 h-6 mr-3 text-emerald-600" />
                  <h3 className="text-lg font-bold text-gray-800">24/7 Live Support</h3>
                </div>
                <p className="mb-2 text-gray-700">
                  Chat with us instantly — average response in <strong className="text-emerald-600">2 minutes</strong>.
                </p>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-md hover:scale-105">
                  <MessageSquare size={16} />
                  Start Chat
                </button>
              </div>
            </div>
          </div>

          {/* Help Topics */}
          <div className="pt-8 mt-10 border-t border-gray-200">
            <h3 className="mb-5 text-lg font-bold text-gray-800">We Can Help You With</h3>
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
              {[
                { icon: Shield, label: "Course Enrollment" },
                { icon: HeadphonesIcon, label: "Technical Support" },
                { icon: Shield, label: "Account Issues" },
                { icon: Shield, label: "Payment Questions" },
                { icon: Shield, label: "Certificate Inquiries" },
                { icon: MessageSquare, label: "General Feedback" }
              ].map((item, i) => (
                <div key={i} className="flex items-center p-3 transition-all bg-gray-50 rounded-xl hover:bg-indigo-50 hover:shadow-sm">
                  <item.icon size={16} className="mr-2 text-indigo-600" />
                  <span className="font-medium text-gray-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
}