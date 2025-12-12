import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
import Layout from "../components/Layout";

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

export default function AdminAttendanceCalendar() {
  const today = new Date();
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState("");
  const [yearMonth, setYearMonth] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
  );
  const [daysData, setDaysData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data || []);
    } catch (err) {
      console.log("EMP ERROR:", err);
      setPageError("Failed to load employees list.");
    }
  };

  const loadCalendar = async () => {
    if (!selectedEmp) {
      setPageError("Please select an employee first.");
      return;
    }

    try {
      setLoading(true);
      setPageError("");

      const [y, m] = yearMonth.split("-");
      const res = await api.get("/admin/attendance/month", {
        params: { employee_id: selectedEmp, year: y, month: m },
      });

      setDaysData(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error("ADMIN CALENDAR ERROR:", err);
      setPageError("Failed to load attendance calendar. Please try again.");
      setLoading(false);
    }
  };

  // Month navigation
  const changeMonth = (delta) => {
    const [y, m] = yearMonth.split("-");
    const year = Number(y);
    const monthIndex = Number(m) - 1;

    const newDate = new Date(year, monthIndex + delta, 1);
    const newY = newDate.getFullYear();
    const newM = String(newDate.getMonth() + 1).padStart(2, "0");

    setYearMonth(`${newY}-${newM}`);
  };

  const selectedEmployeeObj = useMemo(
    () => employees.find((e) => String(e.id) === String(selectedEmp)),
    [employees, selectedEmp]
  );

  const monthSummary = useMemo(() => {
    const summary = {
      present: 0,
      absent: 0,
      leave: 0,
      weekend: 0,
      holiday: 0,
      half_day: 0,
      late: 0,
    };

    daysData.forEach((d) => {
      const s = d.status;
      if (summary[s] !== undefined) summary[s]++;
    });

    return summary;
  }, [daysData]);

  const weeks = useMemo(() => buildCalendar(yearMonth, daysData), [yearMonth, daysData]);

  const currentMonthLabel = useMemo(() => {
    const [y, m] = yearMonth.split("-");
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [yearMonth]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Monthly Attendance Calendar
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              View attendance for a specific employee, month-wise.
            </p>
          </div>

          <div className="text-right text-xs text-slate-500">
            <p>Month: <span className="font-semibold text-slate-700">{currentMonthLabel}</span></p>
            {selectedEmployeeObj && (
              <p>
                Employee:{" "}
                <span className="font-semibold text-slate-700">
                  {selectedEmployeeObj.first_name}{" "}
                  {selectedEmployeeObj.last_name}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Error / Info */}
        {pageError && (
          <div className="rounded-lg px-4 py-3 text-sm border bg-rose-50 text-rose-700 border-rose-200 flex items-center justify-between">
            <span>{pageError}</span>
            <button
              onClick={loadCalendar}
              className="text-xs font-semibold px-3 py-1 rounded-md border border-rose-300 hover:bg-rose-100"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Select Employee
              </label>
              <select
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                value={selectedEmp}
                onChange={(e) => setSelectedEmp(e.target.value)}
              >
                <option value="">-- Select --</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.first_name} {e.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-[200px]">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Select Month
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  className="px-3 rounded-lg border border-slate-300 bg-slate-50 text-sm hover:bg-slate-100"
                >
                  ←
                </button>
                <input
                  type="month"
                  value={yearMonth}
                  className="flex-1 border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                  onChange={(e) => setYearMonth(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  className="px-3 rounded-lg border border-slate-300 bg-slate-50 text-sm hover:bg-slate-100"
                >
                  →
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              type="button"
              onClick={() => {
                setDaysData([]);
                setPageError("");
              }}
            >
              Clear
            </button>
            <button
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-60"
              onClick={loadCalendar}
              type="button"
              disabled={loading}
            >
              {loading && (
                <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? "Loading..." : "Load Calendar"}
            </button>
          </div>
        </div>

        {/* Legend + summary */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <div
                key={key}
                className={`px-3 py-1 rounded border text-xs ${STATUS_CLASSES[key]}`}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-slate-600">
            {Object.entries(monthSummary)
              .filter(([, count]) => count > 0)
              .map(([key, count]) => (
                <span
                  key={key}
                  className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200"
                >
                  {STATUS_LABELS[key]}:{" "}
                  <span className="font-semibold text-slate-800">{count}</span>{" "}
                  day(s)
                </span>
              ))}
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          {!selectedEmp && !loading && (
            <p className="text-sm text-slate-400 text-center py-8">
              Select an employee and month, then click{" "}
              <span className="font-semibold text-slate-600">
                Load Calendar
              </span>
              .
            </p>
          )}

          {loading && (
            <div className="space-y-3">
              <div className="grid grid-cols-7 text-center font-semibold mb-2 text-slate-500">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (d) => (
                    <div key={d}>{d}</div>
                  )
                )}
              </div>

              {[1, 2, 3, 4, 5].map((row) => (
                <div
                  key={row}
                  className="grid grid-cols-7 gap-2 mb-2"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((col) => (
                    <div
                      key={col}
                      className="h-20 border rounded bg-slate-100 animate-pulse"
                    />
                  ))}
                </div>
              ))}
            </div>
          )}

          {!loading && selectedEmp && weeks.length > 0 && (
            <div>
              <div className="grid grid-cols-7 text-center font-semibold mb-2 text-slate-500">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-2 mb-2">
                  {week.map((cell, ci) =>
                    !cell ? (
                      <div
                        key={ci}
                        className="h-20 border rounded bg-slate-50"
                      />
                    ) : (
                      <div
                        key={ci}
                        className={`h-20 border rounded p-1 flex flex-col text-xs ${
                          cell.status
                            ? STATUS_CLASSES[cell.status] || "bg-slate-50"
                            : "bg-white"
                        } ${
                          cell.isToday
                            ? "ring-2 ring-indigo-400 ring-offset-2"
                            : ""
                        }`}
                      >
                        <span className="font-semibold text-right text-slate-700">
                          {cell.day}
                        </span>

                        {cell.status && (
                          <span className="mt-auto text-[11px]">
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

          {!loading && selectedEmp && weeks.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">
              No attendance records found for this month.
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}

/* -------- Helper to build calendar weeks -------- */

function buildCalendar(yearMonth, daysData) {
  if (!yearMonth) return [];

  const [y, m] = yearMonth.split("-");
  const year = Number(y);
  const month = Number(m) - 1;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const total = lastDay.getDate();
  const startWeekday = firstDay.getDay(); // 0 = Sun

  const map = {};
  daysData.forEach((d) => {
    // assuming d.date is "YYYY-MM-DD"
    map[d.date] = d.status;
  });

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const weeks = [];
  let week = new Array(startWeekday).fill(null);

  for (let day = 1; day <= total; day++) {
    const date = `${y}-${m}-${String(day).padStart(2, "0")}`;

    week.push({
      day,
      date,
      status: map[date] || null,
      isToday: date === todayStr,
    });

    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  while (week.length && week.length < 7) week.push(null);
  if (week.length) weeks.push(week);

  return weeks;
}
