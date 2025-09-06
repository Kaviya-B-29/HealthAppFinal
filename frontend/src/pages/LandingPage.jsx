import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage(){
  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="bg-gradient-to-r from-green-600 to-emerald-500 text-white py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Your health, simplified</h1>
          <p className="text-lg md:text-xl mb-6">Track workouts, nutrition, and mood in one place — set goals and view progress with handy charts.</p>
          <div className="space-x-4">
            <Link to="/login" className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold">Login</Link>
            <Link to="/register" className="bg-white/30 border border-white text-white px-6 py-3 rounded-lg">Register</Link>
          </div>
        </div>
      </section>
      <section className="py-16 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
        <div>
          <h3 className="text-2xl font-bold mb-3">Fitness Tracking</h3>
          <p className="text-gray-700">Log runs, cycles, strength training and record duration, distance and calories.</p>
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-3">Nutrition Planning</h3>
          <p className="text-gray-700">Log meals and track calories/macros. Set targets for weight loss or muscle gain.</p>
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-3">Goals & Reminders</h3>
          <p className="text-gray-700">Set personal goals and receive simple reminders to stay on track.</p>
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-3">Mental Wellness</h3>
          <p className="text-gray-700">Keep a short mood log and view trends over time.</p>
        </div>
      </section>
      <section className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold mb-3">Why choose this app?</h3>
          <p className="text-gray-700">Lightweight, privacy-first, and designed for quick daily use.</p>
        </div>
      </section>
    </div>
  );
}
