// src/components/EmployeeWorkAnalytics.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
import EmployeeLayout from "./EmployeeLayout";
import jsPDF from "jspdf"; // npm i jspdf

export default function EmployeeWorkAnalytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");
  const [range, setRange] = useState("current_month"); // current_month | last_30

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/attendance/my/analytics", {
        params: { range },
      });

      const data = res.data || {};

      setAnalytics({
        total_hours: data.total_hours ?? 0,
        overtime_hours: data.overtime_hours ?? 0,
        late_arrivals: data.late_arrivals ?? 0,
        early_checkouts: data.early_checkouts ?? 0,
        best_streak: data.best_streak ?? 0,
        worst_streak: data.worst_streak ?? 0,
        daily_hours: Array.isArray(data.daily_hours) ? data.daily_hours : [],
        range_start: data.range_start,
        range_end: data.range_end,
      });
    } catch (err) {
      console.error("EMP WORK ANALYTICS ERROR:", err);
      setError("Failed to load analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [range]);

  const maxHours = useMemo(() => {
    if (!analytics || !analytics.daily_hours?.length) return 8;
    return Math.max(
      ...analytics.daily_hours.map((d) => d.hours || 0),
      8
    );
  }, [analytics]);

  const derived = useMemo(() => {
    if (!analytics || !analytics.daily_hours?.length) {
      return {
        avgHours: 0,
        totalDays: 0,
        bestDay: null,
      };
    }

    const days = analytics.daily_hours.length;
    const total = analytics.daily_hours.reduce(
      (sum, d) => sum + (d.hours || 0),
      0
    );

    const avg = total / days || 0;

    const sorted = [...analytics.daily_hours].filter((d) => d.hours != null);
    sorted.sort((a, b) => b.hours - a.hours);

    const bestDay = sorted[0] || null;

    return {
      avgHours: avg,
      totalDays: days,
      bestDay,
    };
  }, [analytics]);

  const formatHours = (h) => {
    if (!h || h <= 0) return "0 h";
    const v = Math.round(h * 10) / 10;
    return `${v} h`;
  };

  const rangeLabel =
    range === "last_30" ? "Last 30 Days" : "Current Month";

  /* --------- EXPORT: CSV --------- */

  const exportCsv = () => {
    if (!analytics) return;

    const headers = [
      "Date",
      "Hours",
      "Range Start",
      "Range End",
      "Total Hours",
      "Overtime Hours",
      "Late Arrivals",
      "Early Checkouts",
      "Best Streak",
      "Worst Streak",
    ];

    const lines = [];

    // data rows for each day
    (analytics.daily_hours || []).forEach((d) => {
      lines.push([
        d.date,
        d.hours ?? 0,
        analytics.range_start,
        analytics.range_end,
        analytics.total_hours,
        analytics.overtime_hours,
        analytics.late_arrivals,
        analytics.early_checkouts,
        analytics.best_streak,
        analytics.worst_streak,
      ]);
    });

    const csvContent =
      [headers, ...lines]
        .map((row) =>
          row
            .map((field) =>
              `"${String(field ?? "").replace(/"/g, '""')}"`
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
    const fileNameRange =
      range === "last_30" ? "last-30-days" : "current-month";
    link.setAttribute("download", `work-analytics-${fileNameRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /* --------- EXPORT: PDF --------- */

  const exportPdf = () => {
    if (!analytics) return;

    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("Work Hours Analytics Report", 10, 15);

    doc.setFontSize(10);
    doc.text(`Range: ${rangeLabel}`, 10, 22);
    if (analytics.range_start && analytics.range_end) {
      doc.text(
        `From ${analytics.range_start} to ${analytics.range_end}`,
        10,
        27
      );
    }

    let y = 35;

    const addLine = (label, value) => {
      doc.text(`${label}: ${value}`, 10, y);
      y += 6;
    };

    addLine("Total Hours", formatHours(analytics.total_hours));
    addLine("Overtime Hours", formatHours(analytics.overtime_hours));
    addLine("Late Arrivals", analytics.late_arrivals);
    addLine("Early Checkouts", analytics.early_checkouts);
    addLine("Best Streak (Present)", `${analytics.best_streak} days`);
    addLine("Worst Streak (Absent)", `${analytics.worst_streak} days`);
    addLine("Days with attendance", derived.totalDays);
    addLine("Average hours / day", formatHours(derived.avgHours));

    if (derived.bestDay) {
      addLine(
        "Most productive day",
        `${derived.bestDay.date} · ${formatHours(derived.bestDay.hours)}`
      );
    }

    y += 4;
    doc.setFontSize(11);
    doc.text("Daily Hours:", 10, y);
    y += 6;
    doc.setFontSize(9);

    (analytics.daily_hours || []).forEach((d) => {
      if (y > 280) {
        doc.addPage();
        y = 15;
      }
      doc.text(
        `${d.date} - ${formatHours(d.hours)}`,
        12,
        y
      );
      y += 5;
    });

    const fileNameRange =
      range === "last_30" ? "last-30-days" : "current-month";
    doc.save(`work-analytics-${fileNameRange}.pdf`);
  };

  return (
    <EmployeeLayout title="Work Analytics">
      {/* Header + Controls */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Work Hours Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Overview of your working hours, overtime and attendance streaks.
          </p>
          {analytics?.range_start && analytics?.range_end && (
            <p className="text-xs text-slate-400 mt-1">
              Data range:{" "}
              <span className="font-medium text-slate-600">
                {analytics.range_start} – {analytics.range_end}
              </span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Range selector */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 text-xs">
            <button
              type="button"
              className={`px-3 py-1 rounded-md ${
                range === "current_month"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
              onClick={() => setRange("current_month")}
            >
              Current Month
            </button>
            <button
              type="button"
              className={`px-3 py-1 rounded-md ${
                range === "last_30"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
              onClick={() => setRange("last_30")}
            >
              Last 30 Days
            </button>
          </div>

          {/* Export buttons */}
          <button
            type="button"
            onClick={exportCsv}
            disabled={!analytics}
            className="px-3 py-2 text-xs bg-slate-100 text-slate-700 rounded-lg border border-slate-300 hover:bg-slate-200 disabled:opacity-60"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={exportPdf}
            disabled={!analytics}
            className="px-3 py-2 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Loading / Error / Content */}

      {loading && (
        <div className="space-y-5">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 animate-pulse"
              >
                <div className="h-3 w-24 bg-slate-100 rounded mb-3" />
                <div className="h-6 w-16 bg-slate-100 rounded mb-2" />
                <div className="h-2 w-32 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 animate-pulse"
              >
                <div className="h-3 w-40 bg-slate-100 rounded mb-3" />
                <div className="h-7 w-20 bg-slate-100 rounded mb-2" />
                <div className="h-2 w-28 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 animate-pulse">
            <div className="h-4 w-40 bg-slate-100 rounded mb-4" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-slate-100 rounded mb-2" />
            ))}
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-md mb-4 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={loadAnalytics}
            className="text-xs font-semibold px-3 py-1 rounded-md border border-rose-300 hover:bg-rose-100"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && !analytics && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">No analytics data available.</p>
        </div>
      )}

      {!loading && !error && analytics && (
        <AnalyticsContent
          analytics={analytics}
          maxHours={maxHours}
          derived={derived}
          formatHours={formatHours}
        />
      )}
    </EmployeeLayout>
  );
}

/* ---------- Content split for clarity ---------- */

function AnalyticsContent({ analytics, maxHours, derived, formatHours }) {
  return (
    <>
      {/* Top metric cards */}
      <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Working Hours"
          value={formatHours(analytics.total_hours)}
          subtitle="Sum of all recorded hours in selected range"
          accent="border-l-4 border-emerald-500"
          icon="⏱️"
        />

        <MetricCard
          label="Overtime Hours"
          value={formatHours(analytics.overtime_hours)}
          subtitle="Extra hours beyond 8h/day"
          valueClass="text-indigo-600"
          accent="border-l-4 border-indigo-500"
          icon="🔥"
        />

        <MetricCard
          label="Late Arrivals"
          value={analytics.late_arrivals}
          subtitle="Days you checked in after start time"
          valueClass="text-rose-600"
          accent="border-l-4 border-rose-500"
          icon="⏰"
        />

        <MetricCard
          label="Early Checkouts"
          value={analytics.early_checkouts}
          subtitle="Days you left before end time"
          valueClass="text-amber-500"
          accent="border-l-4 border-amber-500"
          icon="🏃‍♂️"
        />
      </div>

      {/* Streaks + summary */}
      <div className="grid gap-4 mb-6 grid-cols-1 lg:grid-cols-3">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Best Attendance Streak
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {analytics.best_streak} days
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Longest continuous present streak.
            </p>
          </div>
          <div className="mt-3 inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
            <span>✅</span>
            <span>Great consistency!</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Worst Absent Streak
            </p>
            <p className="mt-2 text-2xl font-bold text-rose-500">
              {analytics.worst_streak} days
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Longest back-to-back absence.
            </p>
          </div>
          <div className="mt-3 inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-rose-50 text-rose-700">
            <span>⚠️</span>
            <span>Try to avoid long absence streaks.</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Range Summary
          </p>
          <div className="mt-3 space-y-2 text-sm">
            <Row label="Days with attendance" value={derived.totalDays} />
            <Row
              label="Avg hours per day"
              value={formatHours(derived.avgHours)}
            />
            {derived.bestDay && (
              <Row
                label="Most productive day"
                value={`${derived.bestDay.date} · ${formatHours(
                  derived.bestDay.hours
                )}`}
              />
            )}
          </div>
          <div className="mt-3 inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-slate-50 text-slate-600">
            <span>📊</span>
            <span>Based on selected range only.</span>
          </div>
        </div>
      </div>

      {/* Daily Hours Bar Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Daily Work Hours
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Each bar is relative to your max working hours in this range.
            </p>
          </div>
          <div className="text-xs text-slate-500">
            Max in chart:{" "}
            <span className="font-semibold text-slate-800">
              {formatHours(maxHours)}
            </span>
          </div>
        </div>

        {analytics.daily_hours.length === 0 ? (
          <p className="text-sm text-slate-500">
            No attendance recorded in selected range.
          </p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {analytics.daily_hours.map((day) => {
              const hours = day.hours || 0;
              const percent = maxHours
                ? Math.min((hours / maxHours) * 100, 100)
                : 0;

              let barColor = "bg-indigo-500";
              if (hours >= 9) barColor = "bg-emerald-500";
              else if (hours > 0 && hours < 6) barColor = "bg-amber-400";

              return (
                <div
                  key={day.date}
                  className="flex items-center gap-3 text-xs"
                >
                  <div className="w-24 text-[11px] text-slate-500">
                    {day.date}
                  </div>

                  <div className="flex-1">
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-3 rounded-full ${barColor} transition-all`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="w-24 flex items-center justify-end gap-2">
                    <span className="text-[11px] text-slate-700">
                      {formatHours(hours)}
                    </span>
                    {hours >= 9 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px]">
                        High
                      </span>
                    )}
                    {hours > 0 && hours < 6 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-[10px]">
                        Low
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function MetricCard({ label, value, subtitle, accent, valueClass = "", icon }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col justify-between ${accent}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            {label}
          </p>
          <p
            className={`mt-2 text-2xl font-bold text-slate-800 ${valueClass}`}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-[11px] text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center text-lg">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500 text-xs">{label}</span>
      <span className="font-semibold text-slate-800 text-xs">{value}</span>
    </div>
  );
}
