import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
import EmployeeLayout from "./EmployeeLayout";

/* ---------- Shared helpers ---------- */

function normalizeDate(value) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string") return value.slice(0, 10);
  return "";
}

function buildMonthCalendar(monthValue, records) {
  if (!monthValue) return [];

  const [y, m] = monthValue.split("-");
  const year = Number(y);
  const monthIndex = Number(m) - 1;

  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const total = lastDay.getDate();
  const startWeekday = firstDay.getDay(); // 0=Sun

  const map = {};
  (records || []).forEach((r) => {
    const d = normalizeDate(r.date);
    if (!d.startsWith(monthValue)) return;
    const workMin = r.total_minutes ?? r.work_minutes ?? r.work_hours ?? 0;
    map[d] = workMin > 0 ? "present" : "nodata";
  });

  const today = new Date();
  const todayStr = normalizeDate(today);

  const weeks = [];
  let week = new Array(startWeekday).fill(null);

  for (let day = 1; day <= total; day++) {
    const dateStr = `${y}-${m}-${String(day).padStart(2, "0")}`;
    const dObj = new Date(dateStr);
    const weekday = dObj.getDay();

    let status = map[dateStr];

    if (!status && (weekday === 0 || weekday === 6)) {
      status = "weekend";
    }

    if (!status) status = "absent";
    if (status === "nodata") status = "absent";

    week.push({
      day,
      date: dateStr,
      status,
      isToday: dateStr === todayStr,
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

const CAL_STATUS_STYLE = {
  present: "bg-emerald-100 text-emerald-800 border-emerald-300",
  absent: "bg-rose-100 text-rose-800 border-rose-300",
  weekend: "bg-slate-100 text-slate-700 border-slate-300",
};

const CAL_STATUS_LABEL = {
  present: "Present",
  absent: "Absent / No Data",
  weekend: "Weekend",
};

/* ---------- Component ---------- */

export default function EmployeeAttendance() {
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filters
  const [singleDate, setSingleDate] = useState(""); // exact date
  const [fromDate, setFromDate] = useState(""); // range from
  const [toDate, setToDate] = useState(""); // range to
  const [month, setMonth] = useState(""); // YYYY-MM

  // pagination
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/attendance/history");
      setAllRecords(res.data || []);
      setLoading(false);
      setPage(1);
    } catch (err) {
      console.error("EMP ATTENDANCE LOAD ERROR:", err);
      setError("Failed to load attendance. Please try again.");
      setLoading(false);
    }
  };

  // Filters ke hisaab se records
  const filteredRecords = useMemo(() => {
    let result = allRecords || [];

    if (singleDate) {
      const target = singleDate;
      result = result.filter((r) => normalizeDate(r.date) === target);
    } else if (fromDate || toDate) {
      const from = fromDate || "0000-01-01";
      const to = toDate || "9999-12-31";
      result = result.filter((r) => {
        const d = normalizeDate(r.date);
        return d >= from && d <= to;
      });
    } else if (month) {
      result = result.filter((r) =>
        normalizeDate(r.date).startsWith(`${month}-`)
      );
    }

    return result;
  }, [allRecords, singleDate, fromDate, toDate, month]);

  // filters change -> page 1
  useEffect(() => {
    setPage(1);
  }, [singleDate, fromDate, toDate, month]);

  /* ---------- Pagination ---------- */

  const totalPages = Math.max(
    1,
    Math.ceil((filteredRecords?.length || 0) / perPage)
  );

  const currentPageRecords = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredRecords.slice(start, start + perPage);
  }, [filteredRecords, page]);

  /* ---------- Summary (based on filtered records) ---------- */

  const summary = useMemo(() => {
    if (!filteredRecords || filteredRecords.length === 0) {
      return {
        days: 0,
        totalMinutes: 0,
        breakMinutes: 0,
        avgMinutes: 0,
      };
    }

    const days = filteredRecords.length;
    let totalMinutes = 0;
    let breakMinutes = 0;

    filteredRecords.forEach((r) => {
      totalMinutes += r.total_minutes || 0;
      breakMinutes += r.break_minutes || 0;
    });

    const avgMinutes = totalMinutes / days || 0;

    return { days, totalMinutes, breakMinutes, avgMinutes };
  }, [filteredRecords]);

  const formatTime = (value) => {
    if (!value) return "--";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDatePretty = (value) => {
    if (!value) return "--";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString();
  };

  const formatMinutes = (mins) => {
    if (!mins || mins <= 0) return "0 min";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (!h) return `${m} min`;
    if (!m) return `${h} hr`;
    return `${h} hr ${m} min`;
  };

  const getStatus = (r) => {
    if (!r.check_in && !r.check_out && (!r.total_minutes || r.total_minutes === 0)) {
      return { label: "No Data", className: "bg-slate-100 text-slate-600 border-slate-200" };
    }
    if (r.check_in && !r.check_out) {
      return { label: "In Progress", className: "bg-amber-100 text-amber-800 border-amber-300" };
    }
    if ((r.total_minutes || 0) >= 8 * 60) {
      return { label: "Full Day", className: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    }
    if ((r.total_minutes || 0) > 0) {
      return { label: "Partial Day", className: "bg-blue-100 text-blue-800 border-blue-300" };
    }
    return { label: "Recorded", className: "bg-slate-100 text-slate-600 border-slate-200" };
  };

  const handleToday = () => {
    const t = new Date();
    const iso = t.toISOString().slice(0, 10);
    setSingleDate(iso);
    setFromDate("");
    setToDate("");
    setMonth("");
  };

  const handleClearFilters = () => {
    setSingleDate("");
    setFromDate("");
    setToDate("");
    setMonth("");
  };

  /* ---------- Export to CSV ---------- */

  const exportCsv = (data, filename) => {
    if (!data || data.length === 0) return;

    const headers = [
      "Date",
      "Check In",
      "Check Out",
      "Work Minutes",
      "Break Minutes",
      "Status",
    ];

    const rows = data.map((r) => {
      const status = getStatus(r);
      return [
        normalizeDate(r.date),
        formatTime(r.check_in),
        formatTime(r.check_out),
        r.total_minutes || 0,
        r.break_minutes || 0,
        status.label,
      ];
    });

    const csvContent =
      [headers, ...rows]
        .map((row) =>
          row
            .map((field) =>
              `"${String(field).replace(/"/g, '""')}"`
            )
            .join(",")
        )
        .join("\r\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /* ---------- Calendar data ---------- */

  const calendarMonth = useMemo(() => {
    if (month) return month;
    if (filteredRecords.length > 0) {
      return normalizeDate(filteredRecords[0].date).slice(0, 7);
    }
    if (allRecords.length > 0) {
      return normalizeDate(allRecords[0].date).slice(0, 7);
    }
    return new Date().toISOString().slice(0, 7);
  }, [month, filteredRecords, allRecords]);

  const calendarWeeks = useMemo(
    () => buildMonthCalendar(calendarMonth, allRecords),
    [calendarMonth, allRecords]
  );

  const calendarSummary = useMemo(() => {
    const stats = { present: 0, absent: 0, weekend: 0 };
    calendarWeeks.forEach((week) => {
      week.forEach((cell) => {
        if (!cell) return;
        const s = cell.status;
        if (stats[s] !== undefined) stats[s]++;
      });
    });
    return stats;
  }, [calendarWeeks]);

  /* ---------- Loading UI ---------- */

  if (loading) {
    return (
      <EmployeeLayout>
        <div className="space-y-6">
          <div className="h-7 w-40 bg-slate-100 rounded-md animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
          </div>
          <div className="h-10 bg-slate-100 rounded-md animate-pulse" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-slate-100 rounded-md animate-pulse" />
            ))}
          </div>
        </div>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              My Attendance
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              View your attendance history with daily work hours and breaks.
            </p>
          </div>

          {/* Export buttons */}
          <div className="flex gap-2">
            <button
              className="px-3 py-2 text-xs bg-slate-100 text-slate-700 rounded-lg border border-slate-300 hover:bg-slate-200 disabled:opacity-60"
              type="button"
              disabled={filteredRecords.length === 0}
              onClick={() =>
                exportCsv(filteredRecords, "attendance_filtered.csv")
              }
            >
              Export Filtered CSV
            </button>
            <button
              className="px-3 py-2 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
              type="button"
              disabled={allRecords.length === 0}
              onClick={() =>
                exportCsv(allRecords, "attendance_all.csv")
              }
            >
              Export All CSV
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-lg px-4 py-3 text-sm border bg-rose-50 text-rose-700 border-rose-200 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={load}
              className="text-xs font-semibold px-3 py-1 rounded-md border border-rose-300 hover:bg-rose-100"
            >
              Retry
            </button>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard
            label="Days in View"
            value={summary.days}
            subtitle="Based on current filters"
          />
          <SummaryCard
            label="Total Work Time"
            value={formatMinutes(summary.totalMinutes)}
            subtitle={`${summary.breakMinutes || 0} min break taken`}
          />
          <SummaryCard
            label="Average / Day"
            value={formatMinutes(Math.round(summary.avgMinutes))}
            subtitle="Average effective work time"
          />
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 md:items-end md:justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
              {/* Single date */}
              <div>
                <label className="text-xs text-slate-600 font-semibold mb-1 block">
                  Single Date
                </label>
                <input
                  type="date"
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                  value={singleDate}
                  onChange={(e) => {
                    setSingleDate(e.target.value);
                    setFromDate("");
                    setToDate("");
                    setMonth("");
                  }}
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Exact date filter. Clears other filters.
                </p>
              </div>

              {/* Range */}
              <div>
                <label className="text-xs text-slate-600 font-semibold mb-1 block">
                  From - To
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    className="flex-1 border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setSingleDate("");
                      setMonth("");
                    }}
                  />
                  <input
                    type="date"
                    className="flex-1 border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setSingleDate("");
                      setMonth("");
                    }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Show records between these dates.
                </p>
              </div>

              {/* Month wise */}
              <div>
                <label className="text-xs text-slate-600 font-semibold mb-1 block">
                  Month (YYYY-MM)
                </label>
                <input
                  type="month"
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                  value={month}
                  onChange={(e) => {
                    setMonth(e.target.value);
                    setSingleDate("");
                    setFromDate("");
                    setToDate("");
                  }}
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Filter by whole month.
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                className="px-3 py-2 bg-slate-100 text-slate-700 text-xs rounded-lg hover:bg-slate-200"
                type="button"
                onClick={handleToday}
              >
                Today
              </button>
              <button
                className="px-3 py-2 bg-slate-100 text-slate-700 text-xs rounded-lg hover:bg-slate-200"
                type="button"
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500 text-right">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredRecords.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {allRecords.length}
            </span>{" "}
            records
          </div>
        </div>

        {/* Attendance Table + Pagination */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-left text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="p-2 border-b border-slate-200">Date</th>
                  <th className="p-2 border-b border-slate-200">Check In</th>
                  <th className="p-2 border-b border-slate-200">Check Out</th>
                  <th className="p-2 border-b border-slate-200">Work Time</th>
                  <th className="p-2 border-b border-slate-200">Break Time</th>
                  <th className="p-2 border-b border-slate-200">Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-4 text-center text-slate-500 text-sm"
                    >
                      No attendance found for selected filter.
                    </td>
                  </tr>
                )}

                {filteredRecords.length > 0 &&
                  currentPageRecords.map((r) => {
                    const status = getStatus(r);

                    return (
                      <tr
                        key={r.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="p-2 align-middle">
                          <div className="flex flex-col">
                            <span className="text-sm text-slate-800">
                              {formatDatePretty(r.date)}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {normalizeDate(r.date)}
                            </span>
                          </div>
                        </td>
                        <td className="p-2 align-middle">
                          {formatTime(r.check_in)}
                        </td>
                        <td className="p-2 align-middle">
                          {formatTime(r.check_out)}
                        </td>
                        <td className="p-2 align-middle">
                          {formatMinutes(r.total_minutes)}
                        </td>
                        <td className="p-2 align-middle">
                          {formatMinutes(r.break_minutes)}
                        </td>
                        <td className="p-2 align-middle">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border ${status.className}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current mr-1.5" />
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {filteredRecords.length > 0 && (
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>
                Page{" "}
                <span className="font-semibold text-slate-800">{page}</span> of{" "}
                <span className="font-semibold text-slate-800">
                  {totalPages}
                </span>
              </span>

              <div className="flex gap-1">
                <button
                  className="px-3 py-1 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 disabled:opacity-50"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </button>
                <button
                  className="px-3 py-1 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 disabled:opacity-50"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Small Month Calendar (employee view) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Monthly Overview
              </h2>
              <p className="text-[11px] text-slate-500">
                Highlights for{" "}
                <span className="font-semibold">
                  {new Date(calendarMonth + "-01").toLocaleDateString(
                    "en-US",
                    { month: "long", year: "numeric" }
                  )}
                </span>
              </p>
            </div>
          </div>

          {/* Legend + stats */}
          <div className="flex flex-wrap gap-2 text-[11px]">
            {["present", "absent", "weekend"].map((key) => (
              <span
                key={key}
                className={`px-2 py-1 rounded-full border ${CAL_STATUS_STYLE[key]}`}
              >
                {CAL_STATUS_LABEL[key]}:{" "}
                <span className="font-semibold">
                  {calendarSummary[key]}
                </span>{" "}
                day(s)
              </span>
            ))}
          </div>

          {/* Calendar grid */}
          <div>
            <div className="grid grid-cols-7 text-center font-semibold mb-2 text-[11px] text-slate-500">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {calendarWeeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
                {week.map((cell, ci) =>
                  !cell ? (
                    <div
                      key={ci}
                      className="h-10 border rounded bg-slate-50"
                    />
                  ) : (
                    <div
                      key={ci}
                      className={`h-10 border rounded px-1 pt-0.5 pb-1 flex flex-col text-[10px] ${
                        CAL_STATUS_STYLE[cell.status]
                      } ${cell.isToday ? "ring-2 ring-indigo-400" : ""}`}
                    >
                      <span className="font-semibold self-end">
                        {cell.day}
                      </span>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}

/* ---------- Small summary card component ---------- */

function SummaryCard({ label, value, subtitle }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-1">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-xl font-bold text-slate-800">{value}</p>
      {subtitle && (
        <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}
