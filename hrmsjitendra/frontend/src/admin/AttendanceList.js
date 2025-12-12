import React, { useEffect, useMemo, useState } from "react";
import api from "../api";

export default function AttendanceList() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | present | absent | late | half-day
  const [rangeFilter, setRangeFilter] = useState("7"); // 1 | 7 | 30 | all

  const loadData = async () => {
    try {
      setLoading(true);
      setListError("");

      const res = await api.get("/admin/attendance/list");
      setRecords(res.data || []);

      setLoading(false);
    } catch (err) {
      console.error("ADMIN ATTENDANCE ERROR:", err);
      setListError("Failed to load attendance records. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isWithinRange = (dateStr, range) => {
    if (range === "all") return true;
    if (!dateStr) return false;

    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffMs = today.getTime() - d.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    return diffDays <= Number(range) && diffDays >= 0;
  };

  const filteredRecords = useMemo(() => {
    return (records || [])
      .filter((r) => {
        if (!search.trim()) return true;
        const term = search.toLowerCase();
        const fullName = `${r.first_name || ""} ${r.last_name || ""}`.toLowerCase();
        return (
          fullName.includes(term) ||
          r.date?.toLowerCase().includes(term) ||
          r.status?.toLowerCase().includes(term)
        );
      })
      .filter((r) => {
        if (statusFilter === "all") return true;
        return (r.status || "").toLowerCase() === statusFilter;
      })
      .filter((r) => isWithinRange(r.date, rangeFilter));
  }, [records, search, statusFilter, rangeFilter]);

  const summary = useMemo(() => {
    const total = filteredRecords.length;
    let present = 0;
    let absent = 0;
    let late = 0;

    filteredRecords.forEach((r) => {
      const s = (r.status || "").toLowerCase();
      if (s === "present") present++;
      else if (s === "absent") absent++;
      else if (s === "late") late++;
    });

    return { total, present, absent, late };
  }, [filteredRecords]);

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value; // if already formatted string
    return d.toLocaleDateString();
  };

  const formatTime = (value) => {
    if (!value) return "-";
    // if only "HH:MM:SS"
    if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatName = (r) => {
    const full = `${r.first_name || ""} ${r.last_name || ""}`.trim();
    return full || "Unknown";
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Attendance Records
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track employee daily check-ins, check-outs and attendance status.
          </p>
        </div>
      </div>

      {/* Error message */}
      {listError && (
        <div className="rounded-lg px-4 py-3 text-sm border bg-rose-50 text-rose-700 border-rose-200 flex items-center justify-between">
          <span>{listError}</span>
          <button
            onClick={loadData}
            className="text-xs font-semibold px-3 py-1 rounded-md border border-rose-300 hover:bg-rose-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Records"
          value={summary.total}
          subtitle="After filters"
        />
        <SummaryCard
          label="Present"
          value={summary.present}
          subtitle="Status: present"
          pillClass="bg-emerald-50 text-emerald-700 border-emerald-200"
        />
        <SummaryCard
          label="Absent"
          value={summary.absent}
          subtitle="Status: absent"
          pillClass="bg-rose-50 text-rose-700 border-rose-200"
        />
        <SummaryCard
          label="Late"
          value={summary.late}
          subtitle="Status: late"
          pillClass="bg-amber-50 text-amber-700 border-amber-200"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by employee, date or status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>
          </div>

          {/* Status filter */}
          <div className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-600 inline-flex items-center gap-2 bg-white">
            <span className="hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent outline-none text-sm"
            >
              <option value="all">All</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
          </div>

          {/* Range filter */}
          <div className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-600 inline-flex items-center gap-2 bg-white">
            <span className="hidden sm:inline">Range:</span>
            <select
              value={rangeFilter}
              onChange={(e) => setRangeFilter(e.target.value)}
              className="bg-transparent outline-none text-sm"
            >
              <option value="1">Today</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-700">
            {filteredRecords.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-700">
            {records.length}
          </span>{" "}
          records
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <Th>Employee</Th>
              <Th>Date</Th>
              <Th>Check-In</Th>
              <Th>Check-Out</Th>
              <Th>Hours</Th>
              <Th>Status</Th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <tr key={i} className="border-t">
                    <Td colSpan={6} className="py-3">
                      <div className="h-6 bg-slate-100 rounded-md animate-pulse" />
                    </Td>
                  </tr>
                ))}
              </>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <Td colSpan={6} className="text-center py-8 text-slate-400">
                  No attendance records found for selected filters.
                </Td>
              </tr>
            ) : (
              filteredRecords.map((r) => (
                <tr key={r.id} className="border-t hover:bg-slate-50">
                  {/* Employee */}
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700">
                        {formatName(r)
                          .split(" ")
                          .map((x) => x[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {formatName(r)}
                        </p>
                        {r.employee_code && (
                          <p className="text-[11px] text-slate-400">
                            Code: {r.employee_code}
                          </p>
                        )}
                      </div>
                    </div>
                  </Td>

                  {/* Date */}
                  <Td>{formatDate(r.date)}</Td>

                  {/* Check-in */}
                  <Td>{formatTime(r.check_in)}</Td>

                  {/* Check-out */}
                  <Td>{formatTime(r.check_out)}</Td>

                  {/* Hours */}
                  <Td>{r.work_hours != null ? r.work_hours : "-"}</Td>

                  {/* Status */}
                  <Td>
                    <StatusBadge status={r.status} />
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Small reusable components ---------- */

function Th({ children }) {
  return (
    <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

function Td({ children, colSpan, className = "" }) {
  return (
    <td
      colSpan={colSpan}
      className={`px-4 py-2 text-sm text-slate-700 align-middle ${className}`}
    >
      {children}
    </td>
  );
}

function StatusBadge({ status }) {
  const s = (status || "unknown").toLowerCase();

  let cfg = {
    label: status || "N/A",
    className: "bg-slate-50 text-slate-600 border-slate-200",
  };

  if (s === "present") {
    cfg = {
      label: "Present",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  } else if (s === "absent") {
    cfg = {
      label: "Absent",
      className: "bg-rose-50 text-rose-700 border-rose-200",
    };
  } else if (s === "late") {
    cfg = {
      label: "Late",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border ${cfg.className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current mr-1.5" />
      {cfg.label}
    </span>
  );
}

function SummaryCard({ label, value, subtitle, pillClass }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-1">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      {subtitle && (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border mt-1 ${
            pillClass ||
            "bg-slate-50 text-slate-500 border-slate-200"
          }`}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
}
