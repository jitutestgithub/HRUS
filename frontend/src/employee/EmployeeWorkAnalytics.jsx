// src/components/EmployeeWorkAnalytics.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import EmployeeLayout from "./EmployeeLayout";

export default function EmployeeWorkAnalytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/attendance/my/analytics");
        setAnalytics(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const getMaxHours = () => {
    if (!analytics || !analytics.daily_hours.length) return 0;
    return Math.max(...analytics.daily_hours.map((d) => d.hours), 8);
  };

  const maxHours = getMaxHours();

  return (
    <EmployeeLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Work Hours Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of your working hours, overtime, and attendance streaks
            (current month).
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Loading analytics...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4 text-sm">
          {error}
        </div>
      ) : !analytics ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">No data available.</p>
        </div>
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Hours */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Total Working Hours
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-800">
                {analytics.total_hours}h
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Sum of all recorded working hours this month
              </p>
            </div>

            {/* Overtime */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Overtime Hours
              </p>
              <p className="mt-2 text-2xl font-bold text-blue-600">
                {analytics.overtime_hours}h
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Extra hours worked beyond 8h / day
              </p>
            </div>

            {/* Late Arrivals */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Late Arrivals
              </p>
              <p className="mt-2 text-2xl font-bold text-red-600">
                {analytics.late_arrivals}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Number of days you checked in late
              </p>
            </div>

            {/* Early Checkouts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Early Checkouts
              </p>
              <p className="mt-2 text-2xl font-bold text-orange-500">
                {analytics.early_checkouts}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Days you left before shift end
              </p>
            </div>
          </div>

          {/* Streaks */}
          <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Best Attendance Streak
              </p>
              <p className="mt-2 text-2xl font-bold text-green-600">
                {analytics.best_streak} days
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Your longest continuous present days
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Worst Absent Streak
              </p>
              <p className="mt-2 text-2xl font-bold text-red-500">
                {analytics.worst_streak} days
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Longest continuous absent days
              </p>
            </div>
          </div>

          {/* Daily Hours Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Daily Work Hours (This Month)
              </h2>
              <p className="text-xs text-gray-500">
                Bar size is relative to max hours in this month.
              </p>
            </div>

            {analytics.daily_hours.length === 0 ? (
              <p className="text-sm text-gray-500">No attendance recorded.</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {analytics.daily_hours.map((day) => {
                  const percent = maxHours
                    ? Math.min((day.hours / maxHours) * 100, 100)
                    : 0;
                  return (
                    <div key={day.date} className="flex items-center gap-3">
                      <div className="w-20 text-xs text-gray-500">
                        {day.date}
                      </div>
                      <div className="flex-1">
                        <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-3 rounded-full bg-blue-500 transition-all"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-12 text-xs text-right text-gray-700">
                        {day.hours}h
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </EmployeeLayout>
  );
}
