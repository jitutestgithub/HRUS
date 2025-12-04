import React, { useEffect, useState } from "react";
import api from "../api";
import EmployeeLayout from "./EmployeeLayout";

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

export default function EmployeeAttendanceCalendar() {
  const today = new Date();
  const [yearMonth, setYearMonth] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
  );

  const [daysData, setDaysData] = useState([]); // attendance + leave merged
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonth();
    // eslint-disable-next-line
  }, [yearMonth]);

  const loadMonth = async () => {
    try {
      setLoading(true);

      const [y, m] = yearMonth.split("-");

      // 1️⃣ Attendance
      const attendanceRes = await api.get(`/attendance/month`, {
        params: { year: y, month: m },
      });

      const attendanceData = attendanceRes.data || [];

      // 2️⃣ Leaves (full month)
      const leaveRes = await api.get(`/leaves/my`);
      const leaves = leaveRes.data || [];

      // Leave map
      const leaveMap = {};

      leaves.forEach((l) => {
        const start = new Date(l.start_date);
        const end = new Date(l.end_date);

        const current = new Date(start);

        while (current <= end) {
          const ds = current.toISOString().split("T")[0];

          leaveMap[ds] = {
            status: "leave",
            remark: l.remark || "",
          };

          current.setDate(current.getDate() + 1);
        }
      });

      // Merge attendance + leaves
      const merged = attendanceData.map((d) => {
        if (leaveMap[d.date]) {
          return {
            ...d,
            status: "leave",
            remark: leaveMap[d.date].remark,
          };
        }
        return d;
      });

      setDaysData(merged);
      setLoading(false);
    } catch (err) {
      console.error("CALENDAR ERROR:", err);
      setLoading(false);
    }
  };

  // Build full calendar structure
  const buildCalendar = () => {
    const [y, m] = yearMonth.split("-");
    const year = Number(y);
    const month = Number(m) - 1;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    const startWeekday = firstDay.getDay();

    const statusMap = {};
    daysData.forEach((d) => {
      statusMap[d.date] = d.status;
    });

    const weeks = [];
    let currentWeek = new Array(startWeekday).fill(null);

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;

      const status = statusMap[dateStr] || null;

      currentWeek.push({ day, dateStr, status });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const weeks = buildCalendar();

  return (
    <EmployeeLayout>
      <h1 className="text-2xl font-bold mb-4">Monthly Attendance Calendar</h1>

      {/* Month Picker */}
      <div className="mb-6 flex items-center gap-4">
        <label className="font-medium">Select Month:</label>
        <input
          type="month"
          className="border p-2 rounded"
          value={yearMonth}
          onChange={(e) => setYearMonth(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={loadMonth}
        >
          Refresh
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <div
            key={key}
            className={`px-3 py-1 rounded border text-sm ${STATUS_CLASSES[key]}`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="bg-white p-4 rounded shadow overflow-auto">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div>
            {/* Week Headers */}
            <div className="grid grid-cols-7 text-center font-semibold mb-2">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Calendar Rows */}
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-2 mb-2">
                {week.map((cell, ci) =>
                  !cell ? (
                    <div key={ci} className="h-20 border rounded bg-gray-50" />
                  ) : (
                    <div
                      key={ci}
                      className={`h-20 border rounded p-1 text-sm flex flex-col ${
                        cell.status
                          ? STATUS_CLASSES[cell.status] || ""
                          : "bg-white"
                      }`}
                    >
                      <span className="font-semibold text-right">
                        {cell.day}
                      </span>

                      {cell.status && (
                        <span className="mt-auto text-xs font-medium">
                          {STATUS_LABELS[cell.status] || cell.status}
                        </span>
                      )}
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </EmployeeLayout>
  );
}
