import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-4xl font-bold text-gray-800">Get In Touch</h1>
          <p className="text-lg text-gray-600">
            We're here to help with your learning journey
          </p>
        </div>

        {/* Main Contact Card */}
        <div className="p-8 mb-8 bg-white shadow-xl rounded-2xl">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <h2 className="mb-6 text-2xl font-semibold text-gray-800">
                  Contact Information
                </h2>
                
                {/* Email */}
                <div className="flex items-start mb-6">
                  <div className="p-3 mr-4 bg-blue-100 rounded-lg">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-800">Email</h3>
                    <p className="text-gray-600">support@lmsystem.com</p>
                    <p className="text-gray-600">info@lmsystem.com</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start mb-6">
                  <div className="p-3 mr-4 bg-green-100 rounded-lg">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-800">Phone</h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-gray-600">+1 (555) 765-4321</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start">
                  <div className="p-3 mr-4 bg-purple-100 rounded-lg">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-800">Address</h3>
                    <p className="text-gray-600">
                      123 Education Street<br />
                      Learning District<br />
                      New York, NY 10001
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Office Hours */}
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <div className="flex items-center mb-4">
                  <Clock className="w-6 h-6 mr-3 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Office Hours</h3>
                </div>
                <div className="space-y-2 text-gray-600">
                  <p className="flex justify-between">
                    <span className="font-medium">Monday - Friday:</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">Saturday:</span>
                    <span>10:00 AM - 4:00 PM</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-medium">Sunday:</span>
                    <span>Closed</span>
                  </p>
                </div>
              </div>

              {/* Support Info */}
              <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
                <div className="flex items-center mb-4">
                  <MessageSquare className="w-6 h-6 mr-3 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Support</h3>
                </div>
                <p className="mb-3 text-gray-600">
                  Need immediate assistance? Our support team is available 24/7 through live chat.
                </p>
                <p className="text-sm text-gray-500">
                  Average response time: 2-3 hours
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="pt-8 mt-8 border-t border-gray-200">
            <h3 className="mb-3 text-lg font-semibold text-gray-800">
              What We Can Help You With
            </h3>
            <div className="grid gap-4 text-gray-600 md:grid-cols-3">
              <div className="flex items-center">
                <div className="w-2 h-2 mr-3 bg-blue-500 rounded-full"></div>
                <span>Course Enrollment</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 mr-3 bg-blue-500 rounded-full"></div>
                <span>Technical Support</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 mr-3 bg-blue-500 rounded-full"></div>
                <span>Account Issues</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 mr-3 bg-blue-500 rounded-full"></div>
                <span>Payment Questions</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 mr-3 bg-blue-500 rounded-full"></div>
                <span>Certificate Inquiries</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 mr-3 bg-blue-500 rounded-full"></div>
                <span>General Feedback</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Button */}
        <div className="text-center">
          <button
            onClick={() => navigate("/feedback")}
            className="px-8 py-3 font-semibold text-white transition transform bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 hover:scale-105"
          >
            For Request
          </button>
        </div>
      </div>
    </div>
  );
}