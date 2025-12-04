import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data);
    } catch (err) {
      console.log("EMP ERROR:", err);
    }
  };

  const loadCalendar = async () => {
    if (!selectedEmp) return alert("Select an employee first!");
    setLoading(true);

    try {
      const [y, m] = yearMonth.split("-");
      const res = await api.get("/attendance/admin/month", {
        params: { employee_id: selectedEmp, year: y, month: m },
      });

      setDaysData(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error("ADMIN CALENDAR ERROR:", err);
      setLoading(false);
    }
  };

  const buildCalendar = () => {
    const [y, m] = yearMonth.split("-");
    const year = Number(y);
    const month = Number(m) - 1;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const total = lastDay.getDate();
    const startWeekday = firstDay.getDay();

    const map = {};
    daysData.forEach((d) => (map[d.date] = d.status));

    const weeks = [];
    let week = new Array(startWeekday).fill(null);

    for (let day = 1; day <= total; day++) {
      const date = `${y}-${m}-${String(day).padStart(2, "0")}`;
      week.push({ day, date, status: map[date] || null });

      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }

    while (week.length && week.length < 7) week.push(null);
    if (week.length) weeks.push(week);

    return weeks;
  };

  const weeks = buildCalendar();

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Admin: Monthly Attendance Calendar</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="font-medium">Select Employee:</label>
          <select
            className="border p-2 rounded ml-2"
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

        <div>
          <label className="font-medium">Select Month:</label>
          <input
            type="month"
            value={yearMonth}
            className="border p-2 rounded ml-2"
            onChange={(e) => setYearMonth(e.target.value)}
          />
        </div>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={loadCalendar}
        >
          Load Calendar
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
      <div className="bg-white p-4 rounded shadow">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div>
            <div className="grid grid-cols-7 text-center font-semibold mb-2">
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
                    <div key={ci} className="h-20 border rounded bg-gray-50" />
                  ) : (
                    <div
                      key={ci}
                      className={`h-20 border rounded p-1 flex flex-col text-sm ${
                        cell.status ? STATUS_CLASSES[cell.status] : "bg-white"
                      }`}
                    >
                      <span className="font-semibold text-right">
                        {cell.day}
                      </span>

                      {cell.status && (
                        <span className="text-xs mt-auto">
                          {STATUS_LABELS[cell.status]}
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
    </Layout>
  );
}
