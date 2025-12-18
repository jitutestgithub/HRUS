import React, { useEffect, useState } from "react";
import api from "../api";
import EmployeeLayout from "./EmployeeLayout";

// Recharts Components
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md text-sm">
        <p className="font-semibold text-gray-800">{`Date: ${label}`}</p>
        <p className="text-blue-600">{`Hours: ${payload[0].value}h`}</p>
      </div>
    );
  }
  return null;
};

export default function EmployeeWorkAnalytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await api.get("/attendance/my/analytics");
        console.log("Backend Analytics:", res.data);

        const backend = res.data;

        // Convert backend fields → frontend fields
        const finalAnalytics = {
          total_hours: backend.total_work_minutes
            ? (backend.total_work_minutes / 60).toFixed(1)
            : 0,

          overtime_hours: backend.overtime_minutes
            ? (backend.overtime_minutes / 60).toFixed(1)
            : 0,

          late_arrivals: backend.late_arrivals ?? 0,
          early_checkouts: backend.early_checkouts ?? 0,

          best_streak: backend.best_streak ?? 0,
          worst_streak: backend.worst_streak ?? 0,

          daily_hours: Array.isArray(backend.daily_data)
            ? backend.daily_data.map((d) => ({
                date: d.date,
                hours: (d.minutes / 60).toFixed(1),
              }))
            : [],
        };

        setAnalytics(finalAnalytics);
      } catch (err) {
        console.error(err);
        setError("⚠️ Unable to fetch analytics. Unauthorized or server error.");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  return (
    <EmployeeLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* PAGE TITLE */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">🚀 My Work Analytics</h1>
          <p className="text-gray-500 mt-2">
            Monthly summary of your work performance.
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center py-10">
            <p className="text-lg text-blue-600">Loading analytics...</p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="text-center py-10 bg-red-50 border border-red-300 rounded-xl">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* DATA LOADED */}
        {!loading && !error && analytics && (
          <>
            {/* METRIC CARDS */}
            <div className="grid gap-6 mb-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              
              {/* Total Hours */}
              <div className="bg-white rounded-2xl p-6 border shadow">
                <p className="text-sm text-gray-500 uppercase">Total Hours</p>
                <p className="text-4xl font-bold mt-1">
                  {analytics.total_hours}
                  <span className="text-xl ml-1 text-gray-500">h</span>
                </p>
                <div className="w-full h-20 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[{ val: analytics.total_hours }]}>
                      <Line dataKey="val" stroke="#10b981" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Overtime */}
              <div className="bg-white rounded-2xl p-6 border shadow">
                <p className="text-sm text-gray-500 uppercase">Overtime</p>
                <p className="text-4xl font-bold mt-1 text-blue-600">
                  {analytics.overtime_hours}
                  <span className="text-xl ml-1 text-blue-400">h</span>
                </p>
                <div className="w-full h-20 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{ val: analytics.overtime_hours }]}>
                      <Bar dataKey="val" fill="#3b82f6" radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Late Arrivals */}
              <div className="bg-white rounded-2xl p-6 border shadow">
                <p className="text-sm text-gray-500 uppercase">Late Arrivals</p>
                <p className="text-4xl font-bold mt-1 text-red-600">
                  {analytics.late_arrivals}
                </p>
                <div className="w-full h-20 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{ val: analytics.late_arrivals }]}>
                      <Bar dataKey="val" fill="#ef4444" radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Early Checkouts */}
              <div className="bg-white rounded-2xl p-6 border shadow">
                <p className="text-sm text-gray-500 uppercase">Early Checkouts</p>
                <p className="text-4xl font-bold mt-1 text-orange-500">
                  {analytics.early_checkouts}
                </p>
                <div className="w-full h-20 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{ val: analytics.early_checkouts }]}>
                      <Bar dataKey="val" fill="#f97316" radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* STREAK CARDS */}
            <div className="grid gap-6 mb-8 grid-cols-1 sm:grid-cols-2">

              {/* Best Streak */}
              <div className="bg-white rounded-2xl p-6 border shadow flex items-center">
                <div className="bg-green-100 text-green-600 p-3 rounded-full">🏆</div>
                <div className="ml-4 flex-grow">
                  <p className="text-sm text-gray-500 uppercase">Best Streak</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {analytics.best_streak} days
                  </p>
                </div>
              </div>

              {/* Worst Streak */}
              <div className="bg-white rounded-2xl p-6 border shadow flex items-center">
                <div className="bg-red-100 text-red-600 p-3 rounded-full">⚠️</div>
                <div className="ml-4 flex-grow">
                  <p className="text-sm text-gray-500 uppercase">Worst Streak</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">
                    {analytics.worst_streak} days
                  </p>
                </div>
              </div>
            </div>

            {/* DAILY TREND CHART */}
            <div className="bg-white rounded-2xl p-6 border shadow mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Daily Work Hours Trend
              </h2>

              {analytics.daily_hours.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  No daily work hours available.
                </div>
              ) : (
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.daily_hours} barSize={14}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke="#6b7280"
                        angle={-15}
                        textAnchor="end"
                        height={45}
                      />
                      <YAxis stroke="#6b7280" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="hours" fill="#1d4ed8" radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </EmployeeLayout>
  );
}
