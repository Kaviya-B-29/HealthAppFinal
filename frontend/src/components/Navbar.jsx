import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Bell } from "lucide-react";
import API from "../api/axios";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasNewReminders, setHasNewReminders] = useState(false);
  const dropdownRef = useRef();

  // Fetch reminders from backend
  const fetchReminders = async () => {
    if (!user) return;

    try {
      const res = await API.get("/reminders");
      if (res.data) {
        setReminders(res.data.allReminders || []);
        setHasNewReminders(res.data.hasNew); // backend must send { hasNew: true/false }
      }
    } catch (err) {
      console.error("Error fetching reminders:", err);
    }
  };

  // Initial + periodic fetch
  useEffect(() => {
    fetchReminders();
    const interval = setInterval(fetchReminders, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdown if click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle dropdown + mark reminders as viewed
  const handleDropdownToggle = async () => {
    setDropdownOpen((prev) => !prev);

    if (hasNewReminders) {
      try {
        await API.post("/reminders/viewed");
        setHasNewReminders(false);
      } catch (err) {
        console.error("Error marking reminders as viewed:", err);
      }
    }
  };

  return (
    <nav className="bg-indigo-600 text-white p-4 flex justify-between items-center relative">
      <Link to="/" className="font-bold text-lg">
        Health & Wellness
      </Link>

      <div className="flex items-center space-x-4">
        {!user ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/nutrition">FoodLog</Link>
            <Link to="/workouts">Workouts</Link>
            <Link to="/mental">MentalHealth</Link>
            <Link to="/goals">Goals</Link>
            <Link to="/profile">Profile</Link>

            {/* Notifications */}
            <div className="relative" ref={dropdownRef}>
              <button onClick={handleDropdownToggle} className="relative">
                <Bell className="w-6 h-6 text-white" />
                {hasNewReminders && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-black shadow-lg rounded-lg p-3 z-50">
                  <h4 className="font-semibold mb-2">Reminders</h4>
                  {reminders.length === 0 ? (
                    <p className="text-sm text-gray-600">No reminders</p>
                  ) : (
                    <ul className="text-sm space-y-1">
                      {reminders.map((rem, i) => (
                        <li key={i} className="border-b last:border-none pb-1">
                          {rem}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={logout}
              className="ml-2 bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
