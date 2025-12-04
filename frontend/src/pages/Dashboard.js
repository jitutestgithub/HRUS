import React, { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const meRes = await api.get("/auth/me");
        setMe(meRes.data);

        const statsRes = await api.get("/admin/stats");
        setStats(statsRes.data);

        setLoading(false);
      } catch (err) {
        console.error("Dashboard error:", err);
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return (
      <div className="text-center py-10 text-slate-500">
        Loading dashboard...
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Top Welcome Section */}
      {me && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-2xl font-semibold text-slate-800">
            Welcome, {me.name} 👋
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage your HR operations and organization details
          </p>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Total Employees"
          value={stats?.totalEmployees || 0}
          icon="👥"
          color="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          label="Departments"
          value={stats?.totalDepartments || 0}
          icon="🏢"
          color="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          label="Pending Leave Requests"
          value={stats?.totalLeavePending || 0}
          icon="📝"
          color="bg-rose-100 text-rose-600"
        />
      </div>

      {/* Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">
            Recent Activity
          </h3>

          <ul className="space-y-4">
            <ActivityItem text="New employee added in Sales Department" time="2 hrs ago" />
            <ActivityItem text="New leave request submitted" time="5 hrs ago" />
            <ActivityItem text="Admin updated organization settings" time="1 day ago" />
          </ul>
        </div>

        {/* Weekly Overview Graph */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">
            Weekly Overview
          </h3>

          <GraphPlaceholder />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Components ---------------- */

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
      </div>

      <div className={`h-14 w-14 rounded-xl flex items-center justify-center text-3xl ${color}`}>
        {icon}
      </div>
    </div>
  );
}

function ActivityItem({ text, time }) {
  return (
    <li className="flex justify-between border-b border-slate-100 pb-3">
      <p className="text-sm text-slate-700">{text}</p>
      <p className="text-xs text-slate-400">{time}</p>
    </li>
  );
}

function GraphPlaceholder() {
  return (
    <div className="h-40 bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg animate-pulse flex items-center justify-center text-slate-500 text-sm">
      📊 Graph will go here
    </div>
  );
}
