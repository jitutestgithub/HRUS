import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
import EmployeeLayout from "./EmployeeLayout";

/* ---------- Shared helpers ---------- */
// (सारे helpers same as before - normalizeDate, buildMonthCalendar, etc.)
// ... [unchanged helpers - normalizeDate, buildMonthCalendar, CAL_STATUS_STYLE, CAL_STATUS_LABEL]

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
  const startWeekday = firstDay.getDay();

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
    if (!status && (weekday === 0 || weekday === 6)) status = "weekend";
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

/* ---------- Main Component ---------- */

export default function EmployeeAttendance() {
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [singleDate, setSingleDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [month, setMonth] = useState("");

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

  const filteredRecords = useMemo(() => {
    let result = allRecords || [];

    if (singleDate) {
      result = result.filter((r) => normalizeDate(r.date) === singleDate);
    } else if (fromDate || toDate) {
      const from = fromDate || "0000-01-01";
      const to = toDate || "9999-12-31";
      result = result.filter((r) => {
        const d = normalizeDate(r.date);
        return d >= from && d <= to;
      });
    } else if (month) {
      result = result.filter((r) => normalizeDate(r.date).startsWith(`${month}-`));
    }

    return result;
  }, [allRecords, singleDate, fromDate, toDate, month]);

  useEffect(() => {
    setPage(1);
  }, [singleDate, fromDate, toDate, month]);

  const totalPages = Math.max(1, Math.ceil((filteredRecords?.length || 0) / perPage));
  const currentPageRecords = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredRecords.slice(start, start + perPage);
  }, [filteredRecords, page]);

  const summary = useMemo(() => {
    if (!filteredRecords.length) {
      return { days: 0, totalMinutes: 0, breakMinutes: 0, avgMinutes: 0 };
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

  const formatTime = (value) => (!value ? "--" : new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  const formatDatePretty = (value) => (!value ? "--" : new Date(value).toLocaleDateString());
  const formatMinutes = (mins) => {
    if (!mins || mins <= 0) return "0 min";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h ? (m ? `${h} hr ${m} min` : `${h} hr`) : `${m} min`;
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
    const iso = new Date().toISOString().slice(0, 10);
    setSingleDate(iso);
    setFromDate(""); setToDate(""); setMonth("");
  };

  const handleClearFilters = () => {
    setSingleDate(""); setFromDate(""); setToDate(""); setMonth("");
  };

  const exportCsv = (data, filename) => {
    if (!data?.length) return;
    const headers = ["Date", "Check In", "Check Out", "Work Minutes", "Break Minutes", "Status"];
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
    const csv = [headers, ...rows].map(row => row.map(f => `"${String(f).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const calendarMonth = useMemo(() => {
    return month || (filteredRecords[0] ? normalizeDate(filteredRecords[0].date).slice(0, 7) :
            allRecords[0] ? normalizeDate(allRecords[0].date).slice(0, 7) : new Date().toISOString().slice(0, 7));
  }, [month, filteredRecords, allRecords]);

  const calendarWeeks = useMemo(() => buildMonthCalendar(calendarMonth, allRecords), [calendarMonth, allRecords]);

  const calendarSummary = useMemo(() => {
    const stats = { present: 0, absent: 0, weekend: 0 };
    calendarWeeks.flat().forEach(cell => cell && stats[cell.status] !== undefined && stats[cell.status]++);
    return stats;
  }, [calendarWeeks]);

  if (loading) {
    return (
      <EmployeeLayout>
        <div className="space-y-6 p-4">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 bg-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout>
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">My Attendance</h1>
            <p className="text-sm text-slate-500 mt-1">View your attendance history with daily work hours and breaks.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => exportCsv(filteredRecords, "attendance_filtered.csv")}
              disabled={!filteredRecords.length}
              className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg border border-slate-300 hover:bg-slate-200 disabled:opacity-50"
            >
              Export Filtered
            </button>
            <button
              onClick={() => exportCsv(allRecords, "attendance_all.csv")}
              disabled={!allRecords.length}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              Export All
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg px-4 py-3 text-sm border bg-rose-50 text-rose-700 border-rose-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span>{error}</span>
            <button onClick={load} className="px-4 py-2 text-sm font-medium bg-rose-100 rounded hover:bg-rose-200">
              Retry
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard label="Days in View" value={summary.days} subtitle="Based on current filters" />
          <SummaryCard label="Total Work Time" value={formatMinutes(summary.totalMinutes)} subtitle={`${summary.breakMinutes || 0} min break`} />
          <SummaryCard label="Average / Day" value={formatMinutes(Math.round(summary.avgMinutes))} subtitle="Effective work time" />
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Single Date</label>
                <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={singleDate}
                  onChange={(e) => { setSingleDate(e.target.value); setFromDate(""); setToDate(""); setMonth(""); }} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">From Date</label>
                  <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={fromDate}
                    onChange={(e) => { setFromDate(e.target.value); setSingleDate(""); setMonth(""); }} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">To Date</label>
                  <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={toDate}
                    onChange={(e) => { setToDate(e.target.value); setSingleDate(""); setMonth(""); }} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Month</label>
                <input type="month" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={month}
                  onChange={(e) => { setMonth(e.target.value); setSingleDate(""); setFromDate(""); setToDate(""); }} />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-between items-center pt-2 border-t border-slate-200">
              <div className="flex gap-2">
                <button onClick={handleToday} className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg">Today</button>
                <button onClick={handleClearFilters} className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg">Clear</button>
              </div>
              <p className="text-xs text-slate-500">
                Showing <strong>{filteredRecords.length}</strong> of <strong>{allRecords.length}</strong> records
              </p>
            </div>
          </div>
        </div>

        {/* Attendance Records - Responsive Table / Cards */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {filteredRecords.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No attendance records found for the selected filter.</div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Check In</th>
                      <th className="px-4 py-3">Check Out</th>
                      <th className="px-4 py-3">Work Time</th>
                      <th className="px-4 py-3">Break Time</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentPageRecords.map((r) => {
                      const status = getStatus(r);
                      return (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-slate-800">{formatDatePretty(r.date)}</div>
                              <div className="text-xs text-slate-500">{normalizeDate(r.date)}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">{formatTime(r.check_in)}</td>
                          <td className="px-4 py-3">{formatTime(r.check_out)}</td>
                          <td className="px-4 py-3">{formatMinutes(r.total_minutes)}</td>
                          <td className="px-4 py-3">{formatMinutes(r.break_minutes)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${status.className}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {currentPageRecords.map((r) => {
                  const status = getStatus(r);
                  return (
                    <div key={r.id} className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-slate-800">{formatDatePretty(r.date)}</div>
                          <div className="text-xs text-slate-500">{normalizeDate(r.date)}</div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs border ${status.className}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-slate-500 text-xs">Check In</div>
                          <div>{formatTime(r.check_in)}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-xs">Check Out</div>
                          <div>{formatTime(r.check_out)}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-xs">Work</div>
                          <div>{formatMinutes(r.total_minutes)}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-xs">Break</div>
                          <div>{formatMinutes(r.break_minutes)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
                  <span className="text-slate-600">
                    Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                  </span>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Monthly Calendar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Monthly Overview</h2>
            <p className="text-sm text-slate-500">
              {new Date(calendarMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mb-4 text-xs">
            {Object.entries(calendarSummary).map(([key, count]) => (
              <span key={key} className={`px-3 py-1.5 rounded-full border ${CAL_STATUS_STYLE[key]}`}>
                {CAL_STATUS_LABEL[key]}: <strong>{count}</strong>
              </span>
            ))}
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[280px]">
              <div className="grid grid-cols-7 text-center text-xs font-medium text-slate-500 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d}>{d}</div>)}
              </div>
              {calendarWeeks.map((week, i) => (
                <div key={i} className="grid grid-cols-7 gap-1 mb-1">
                  {week.map((cell, j) => (
                    <div
                      key={j}
                      className={`h-10 flex items-start justify-end p-1.5 text-xs font-medium border rounded-lg ${
                        cell ? `${CAL_STATUS_STYLE[cell.status]} ${cell.isToday ? "ring-2 ring-indigo-500 ring-offset-2" : ""}` : "bg-slate-50"
                      }`}
                    >
                      {cell?.day}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}

function SummaryCard({ label, value, subtitle }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
}