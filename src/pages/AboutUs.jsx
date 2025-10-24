import React from "react";
import { motion } from "framer-motion";
import { Target, Eye, Handshake, Sparkles, Users, Rocket, Code, Heart } from "lucide-react";

export default function AboutUs() {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

//   const timelineItem = (i: number) => ({
//     hidden: { opacity: 0, x: i % 2 === 0 ? -50 : 50 },
//     visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay: i * 0.15 } }
//   });

  const timelineItem = (i) => ({
  hidden: { opacity: 0, x: i % 2 === 0 ? -50 : 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay: i * 0.15 } }
});

  return (
    <div className="min-h-screen px-4 py-16 bg-gradient-to-br from-gray-50 via-white to-indigo-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Hero */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="mb-4 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 md:text-5xl">
            About EduLearn
          </h1>
          <p className="max-w-3xl mx-auto text-lg leading-relaxed text-gray-600">
            Welcome to <span className="font-bold text-indigo-600">EduLearn</span> — a next-generation learning platform designed to connect passionate instructors with eager learners worldwide. We believe education should be accessible, affordable, and impactful.
          </p>
        </motion.div>

        {/* Mission / Vision / Values */}
        <motion.div
          className="grid grid-cols-1 gap-8 mb-20 md:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {[
            {
              icon: Target,
              title: "Our Mission",
              desc: "To make quality education accessible, affordable, and transformative for everyone — anywhere in the world.",
              gradient: "from-indigo-500 to-indigo-600"
            },
            {
              icon: Eye,
              title: "Our Vision",
              desc: "A world where learning is limitless, personalized, and driven by passion, curiosity, and real-world impact.",
              gradient: "from-purple-500 to-purple-600"
            },
            {
              icon: Handshake,
              title: "Our Values",
              desc: "Excellence, integrity, inclusivity, and continuous growth — in every course, every interaction, every day.",
              gradient: "from-emerald-500 to-emerald-600"
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              variants={item}
              className="relative overflow-hidden transition-all duration-300 bg-white shadow-lg group rounded-2xl hover:shadow-2xl hover:-translate-y-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              <div className="p-8">
                <div className="flex items-center justify-center w-16 h-16 mb-5 transition-all shadow-md bg-gradient-to-br from-white to-gray-100 rounded-2xl group-hover:shadow-lg group-hover:scale-110">
                  <card.icon className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-800">{card.title}</h3>
                <p className="leading-relaxed text-gray-600">{card.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Timeline */}
        <div className="mb-20">
          <motion.h2
            className="mb-12 text-3xl font-bold text-center text-gray-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Our Journey
          </motion.h2>

          <div className="relative max-w-4xl mx-auto">
            <div className="absolute w-1 h-full transform rounded-full opacity-50 left-8 sm:left-1/2 sm:-translate-x-1/2 bg-gradient-to-b from-indigo-200 via-purple-200 to-emerald-200"></div>

            {[
              { year: "2022", title: "The Spark", desc: "Born from a shared passion for learning, a small team launched EduLearn.", icon: Sparkles, color: "indigo" },
              { year: "2023", title: "First 1,000 Learners", desc: "Community grew rapidly with certified courses and live sessions.", icon: Users, color: "purple" },
              { year: "2024", title: "Platform 2.0", desc: "AI recommendations, mobile apps, and seamless UX launched.", icon: Rocket, color: "emerald" },
              { year: "2025", title: "Global Impact", desc: "Now in 50+ countries with 100+ courses and top partnerships.", icon: Code, color: "pink" },
            ].map((event, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={timelineItem(i)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`relative flex items-center mb-12 ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}
              >
                <div className="absolute z-10 transform left-8 sm:left-1/2 sm:-translate-x-1/2">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg border-4 border-${event.color}-500`}>
                    <event.icon className={`w-6 h-6 text-${event.color}-600`} />
                  </div>
                </div>

                <div className={`w-full sm:w-5/12 ${i % 2 === 0 ? "sm:pr-16" : "sm:pl-16"}`}>
                  <div className="p-6 transition-all bg-white shadow-md rounded-2xl hover:shadow-xl">
                    <div className="flex items-center mb-2">
                      <span className={`text-2xl font-bold text-${event.color}-600`}>{event.year}</span>
                      <span className="ml-3 text-lg font-semibold text-gray-800">{event.title}</span>
                    </div>
                    <p className="text-gray-600">{event.desc}</p>
                  </div>
                </div>
                <div className="hidden w-5/12 sm:block"></div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Final Quote */}
        <motion.div
          className="p-10 text-center shadow-inner bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <Heart className="w-12 h-12 mx-auto mb-4 text-pink-600" />
          <h3 className="mb-3 text-2xl font-bold text-gray-800">Built with Love, for Learners</h3>
          <p className="max-w-3xl mx-auto text-lg text-gray-700">
            Our story is still being written — and <span className="font-bold text-indigo-600">you’re part of it</span>. Together, let’s make education more human, joyful, and transformative.
          </p>
        </motion.div>
      </div>
    </div>
  );
}