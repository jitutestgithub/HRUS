import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
import EmployeeLayout from "./EmployeeLayout";

/* ================= STATUS CONFIG ================= */
const STATUS_LABELS = {
  present: "Present",
  absent: "Absent",
  leave: "Leave",
  weekend: "Weekend",
  holiday: "Holiday",
  half_day: "Half Day",
  late: "Late",
};

const STATUS_CLASSES = {
  present: "bg-green-100 text-green-800 border-green-300",
  absent: "bg-red-100 text-red-800 border-red-300",
  leave: "bg-blue-100 text-blue-800 border-blue-300",
  weekend: "bg-gray-100 text-gray-800 border-gray-300",
  holiday: "bg-yellow-100 text-yellow-800 border-yellow-300",
  half_day: "bg-orange-100 text-orange-800 border-orange-300",
  late: "bg-purple-100 text-purple-800 border-purple-300",
};

/* ================= MAIN COMPONENT ================= */
export default function EmployeeAttendanceCalendar() {
  const today = new Date();
  const [yearMonth, setYearMonth] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
  );
  const [daysData, setDaysData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonth();
  }, [yearMonth]);

  const loadMonth = async () => {
    try {
      setLoading(true);
      const [y, m] = yearMonth.split("-");
      const attendanceRes = await api.get("/attendance/month", {
        params: { year: y, month: m },
      });
      const attendanceData = attendanceRes.data || [];

      const leaveRes = await api.get("/leaves/my");
      const leaves = leaveRes.data || [];

      const leaveMap = {};
      leaves.forEach((l) => {
        const start = new Date(l.start_date);
        const end = new Date(l.end_date);
        let cur = new Date(start);
        while (cur <= end) {
          const ds = cur.toISOString().split("T")[0];
          leaveMap[ds] = { status: "leave" };
          cur.setDate(cur.getDate() + 1);
        }
      });

      const merged = attendanceData.map((d) =>
        leaveMap[d.date] ? { ...d, status: "leave" } : d
      );

      setDaysData(merged);
      setLoading(false);
    } catch (err) {
      console.error("CALENDAR ERROR:", err);
      setLoading(false);
    }
  };

  /* ================= BUILD CALENDAR ================= */
  const weeks = useMemo(() => {
    const [y, m] = yearMonth.split("-");
    const year = +y;
    const month = +m - 1;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const statusMap = {};
    daysData.forEach((d) => (statusMap[d.date] = d.status));

    const result = [];
    let week = Array(firstDay.getDay()).fill(null);

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const wd = new Date(ds).getDay();
      let status = statusMap[ds];
      if (!status && (wd === 0 || wd === 6)) status = "weekend";
      if (!status) status = "absent";

      week.push({ day: d, status, date: ds });

      if (week.length === 7) {
        result.push(week);
        week = [];
      }
    }

    if (week.length) {
      while (week.length < 7) week.push(null);
      result.push(week);
    }

    return result;
  }, [yearMonth, daysData]);

  /* ================= HELPER: Check if today ================= */
  const isToday = (dateStr) => {
    const todayStr = new Date().toISOString().split("T")[0];
    return dateStr === todayStr;
  };

  return (
    <EmployeeLayout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Attendance Calendar
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monthly attendance overview
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
              Select Month:
            </label>
            <input
              type="month"
              className="border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full sm:w-auto"
              value={yearMonth}
              onChange={(e) => setYearMonth(e.target.value)}
            />
          </div>
          <button
            onClick={loadMonth}
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* LEGEND */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-700-700 mb-3">Legend</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <span
                key={key}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${STATUS_CLASSES[key]}`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* CALENDAR GRID */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 sm:p-6">
            {/* Month Title */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {new Date(yearMonth + "-01").toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-bold text-slate-600 uppercase tracking-wider py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Weeks */}
            <div className="space-y-2">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-2">
                  {week.map((cell, cellIndex) => {
                    if (!cell) {
                      return (
                        <div
                          key={cellIndex}
                          className="aspect-square bg-slate-50 border border-slate-200 rounded-lg"
                        />
                      );
                    }

                    const todayHighlight = isToday(cell.date)
                      ? "ring-4 ring-indigo-400 ring-inset"
                      : "";

                    return (
                      <div
                        key={cellIndex}
                        className={`aspect-square border-2 rounded-lg flex flex-col justify-between p-2 text-xs font-medium transition-all ${STATUS_CLASSES[cell.status]} ${todayHighlight}`}
                      >
                        <span className="self-end font-bold text-lg leading-none">
                          {cell.day}
                        </span>
                        <span className="text-[10px] leading-tight opacity-90">
                          {STATUS_LABELS[cell.status]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center rounded-xl">
                <div className="text-slate-600">Loading calendar...</div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Tip */}
        <div className="sm:hidden text-center text-xs text-slate-500 mt-4">
          Tip: Rotate device for better view
        </div>
      </div>
    </EmployeeLayout>
  );
}