import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Calculator, 
  QrCode, 
  MapPin,
  Cpu, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';
import SustainabilityChatbot from '../components/chat/SustainabilityChatbot';

const LandingPage = () => {

  return (
    <div className="space-y-16 py-10">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>EcoPulse — Sustainable College Campus System</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight">
          Empowering Students to Build a <span className="text-emerald-600 underline decoration-emerald-300">Greener Campus</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Track personal carbon footprints, complete AI-powered daily eco-challenges, verify sustainable deeds at smart dustbin QR stations, and explore your real aerial campus map.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/register"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-200 transition"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 shadow-sm transition"
          >
            <span>Explore Dashboard Preview</span>
          </Link>
        </div>
      </section>

      {/* Feature Architecture Matrix */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Full-Stack Sustainability Modules</h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            Intelligent campus sustainability tools designed for students, faculty, and administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-emerald-300 transition">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl w-fit mb-4">
              <Calculator className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Carbon Footprint Calculator</h3>
            <p className="text-sm text-slate-600 mt-2">
              Quantify weekly travel, dietary choices, dorm power usage, and waste generation in kg CO2e with personalized tips.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-medium text-emerald-600">Active</span>
              <Link to="/calculator" className="text-slate-500 hover:text-emerald-600">View Page →</Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-emerald-300 transition">
            <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl w-fit mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">AI Daily Sustainability Challenges</h3>
            <p className="text-sm text-slate-600 mt-2">
              Personalized micro-actions generated using Google Gemini AI, backed with an offline fallback generator for offline resiliency.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-medium text-indigo-600">Active</span>
              <Link to="/challenges" className="text-slate-500 hover:text-indigo-600">View Page →</Link>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-emerald-300 transition">
            <div className="p-3 bg-sky-100 text-sky-700 rounded-xl w-fit mb-4">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">QR-Verified Green Deeds</h3>
            <p className="text-sm text-slate-600 mt-2">
              Physical campus stations (water refill stations, solar benches, recycling hubs) reward anti-fraud verified eco-points.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-medium text-sky-600">Active</span>
              <Link to="/qr-scan" className="text-slate-500 hover:text-sky-600">View Page →</Link>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-emerald-300 transition">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl w-fit mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Campus Aerial Map &amp; Smart Bins</h3>
            <p className="text-sm text-slate-600 mt-2">
              Interactive college aerial photography with live IoT smart dustbin telemetry, fill level alerts, and building green ratings.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-medium text-emerald-600">Live Campus View</span>
              <Link to="/campus-3d" className="text-slate-500 hover:text-emerald-600">View Page →</Link>
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-emerald-300 transition">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl w-fit mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">IoT Smart Dustbin Telemetry</h3>
            <p className="text-sm text-slate-600 mt-2">
              ESP32 ultrasonic fill-level sensors monitor campus bins in real-time, preventing overflows with live telemetry support.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-medium text-emerald-600">IoT Connected</span>
              <Link to="/smart-bin" className="text-slate-500 hover:text-emerald-600">Smart Bins →</Link>
            </div>
          </div>

          {/* Card 6 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-emerald-300 transition">
            <div className="p-3 bg-purple-100 text-purple-700 rounded-xl w-fit mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Proof of Green Deed Credentials</h3>
            <p className="text-sm text-slate-600 mt-2">
              Cryptographically verifiable achievement badges for student resumes and milestone sustainability awards.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-medium text-purple-600">Verifiable</span>
              <Link to="/profile" className="text-slate-500 hover:text-purple-600">View Badges →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Sustainability Chatbot */}
      <SustainabilityChatbot />
    </div>
  );
};

export default LandingPage;
