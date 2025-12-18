import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { name: "Organization", path: "/organization", icon: "🏢" },
    { name: "Departments", path: "/departments", icon: "🗂️" },
    { name: "Employees", path: "/employees", icon: "👥" },

    { name: "Attendance", path: "/admin/attendance/list", icon: "⏱️" },
    { name: "Attendance Calendar", path: "/admin/attendance/calendar", icon: "🗓️" },

    { name: "Leaves", path: "/leaves", icon: "📝" },
    { name: "Leave Approval", path: "/admin/leaves", icon: "✔️" },

    { name: "Settings", path: "/settings", icon: "⚙️" },
  ];


  return (
    <div className="flex bg-slate-100 min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg border-r border-slate-200 p-6 hidden md:block">
        <h1 className="text-2xl font-bold text-slate-800 mb-8">
          HR<span className="text-indigo-600">MS</span>
        </h1>

        <nav className="space-y-2">
          {menu.map((item, i) => (
            <Link
              key={i}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                location.pathname === item.path
                  ? "bg-indigo-600 text-white"
                  : "text-slate-700 hover:bg-slate-200"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
