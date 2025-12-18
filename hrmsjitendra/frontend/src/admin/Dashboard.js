import React, { useEffect, useState, useMemo } from "react";
import api from "../api";

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [weeklyOverview, setWeeklyOverview] = useState([]);
  const [range, setRange] = useState("week"); // week | month | quarter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [meRes, dashboardRes] = await Promise.all([
          api.get("/auth/me"),
          api.get(`/admin/dashboard?range=${range}`),
        ]);

        setMe(meRes.data || null);

        const d = dashboardRes.data || {};
        setStats(d.stats || null);
        setRecentActivity(d.recentActivity || []);
        setWeeklyOverview(d.weeklyOverview || []);

        setLoading(false);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Kuchh galat ho gaya. Please page refresh kare ya Retry dabaye.");
        setLoading(false);
      }
    };

    load();
  }, [range]);

  const maxWeeklyValue = useMemo(
    () =>
      weeklyOverview.length
        ? Math.max(...weeklyOverview.map((d) => d.value || 0))
        : 0,
    [weeklyOverview]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-28 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-28 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-28 bg-slate-100 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Error banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <p className="text-sm">{error}</p>
          <button
            onClick={() => setRange((r) => r)} // simply re-trigger effect
            className="text-xs font-semibold border border-rose-300 rounded-md px-3 py-1 hover:bg-rose-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* Top Welcome Section */}
      {me && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800">
              Welcome, {me.name} 👋
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage your HR operations, employees & organization insights at a
              glance.
            </p>
            {me.role && (
              <p className="inline-flex items-center text-xs mt-3 px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                Role: <span className="ml-1 font-medium">{me.role}</span>
              </p>
            )}
          </div>

          {/* Range Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 mr-1">Show data for:</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
              {["week", "month", "quarter"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1 rounded-md capitalize transition ${
                    range === r
                      ? "bg-white shadow-sm text-slate-900"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard
          label="Total Employees"
          value={stats?.totalEmployees ?? 0}
          icon="👥"
          color="bg-indigo-100 text-indigo-600"
          subtitle="Active in organization"
        />
        <StatCard
          label="Departments"
          value={stats?.totalDepartments ?? 0}
          icon="🏢"
          color="bg-emerald-100 text-emerald-600"
          subtitle="Functional units"
        />
        <StatCard
          label="Pending Leave Requests"
          value={stats?.totalLeavePending ?? 0}
          icon="📝"
          color="bg-rose-100 text-rose-600"
          subtitle="Waiting for approval"
        />
        <StatCard
          label="Present Today"
          value={stats?.todaysPresent ?? 0}
          icon="✅"
          color="bg-amber-100 text-amber-600"
          subtitle={`Absent: ${stats?.todaysAbsent ?? 0}`}
        />
      </div>

      {/* Activity + Graph */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 xl:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-700">
              Recent Activity
            </h3>
            <span className="text-xs text-slate-400">
              Last {range === "week" ? "7" : range === "month" ? "30" : "90"}{" "}
              days
            </span>
          </div>

          {recentActivity.length === 0 ? (
            <p className="text-sm text-slate-400">
              No recent activity found for this period.
            </p>
          ) : (
            <ul className="space-y-4 max-h-64 overflow-y-auto pr-1">
              {recentActivity.map((item) => (
                <ActivityItem
                  key={item.id}
                  text={item.text}
                  time={item.timeAgo}
                  type={item.type}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Weekly Overview Graph */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-700">
              {range === "week"
                ? "Weekly Attendance Overview"
                : range === "month"
                ? "Monthly Attendance Overview"
                : "Quarterly Attendance Overview"}
            </h3>
            <p className="text-xs text-slate-400">
              Present trend ({weeklyOverview.length} points)
            </p>
          </div>

          <WeeklyOverviewChart
            data={weeklyOverview}
            maxValue={maxWeeklyValue}
          />

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-slate-800/70" />
              Present
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Components ---------------- */

function StatCard({ label, value, icon, color, subtitle }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-1 truncate max-w-[180px]">
            {subtitle}
          </p>
        )}
      </div>

      <div
        className={`h-14 w-14 rounded-xl flex items-center justify-center text-3xl ${color}`}
      >
        {icon}
      </div>
    </div>
  );
}

function ActivityItem({ text, time, type }) {
  const badge = getActivityBadge(type);

  return (
    <li className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {badge && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.className}`}
            >
              {badge.label}
            </span>
          )}
          <p className="text-sm text-slate-700">{text}</p>
        </div>
      </div>
      <p className="text-xs text-slate-400 whitespace-nowrap">{time}</p>
    </li>
  );
}

function getActivityBadge(type) {
  switch (type) {
    case "employee":
      return {
        label: "Employee",
        className: "bg-indigo-50 text-indigo-600",
      };
    case "leave":
      return {
        label: "Leave",
        className: "bg-rose-50 text-rose-600",
      };
    case "settings":
      return {
        label: "Settings",
        className: "bg-amber-50 text-amber-600",
      };
    default:
      return null;
  }
}

function WeeklyOverviewChart({ data, maxValue }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-40 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 text-sm">
        No data available for this range.
      </div>
    );
  }

  const safeMax = maxValue || 1;

  return (
    <div className="h-48 flex items-end gap-3 border border-slate-100 rounded-lg px-4 py-3 bg-gradient-to-b from-white to-slate-50">
      {data.map((d) => {
        const heightPercent = Math.round(((d.value || 0) / safeMax) * 100);

        return (
          <div
            key={d.label}
            className="flex-1 flex flex-col items-center justify-end gap-2"
          >
            <div className="flex flex-col items-center gap-1">
              <div className="text-xs font-semibold text-slate-700">
                {d.value ?? 0}
              </div>
              <div className="w-7 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="w-full rounded-full bg-slate-800/70 transition-all duration-500"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
            </div>
            <span className="text-[11px] text-slate-400 mt-1">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
