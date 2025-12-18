// src/hr/HrSidebar.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function HrSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const menu = [
    { name: "Dashboard", path: "/hr/dashboard", icon: "📊" },
    { name: "Employees", path: "/hr/employees", icon: "👥" },
    { name: "Attendance", path: "/hr/attendance", icon: "⏱️" },
    { name: "Leaves", path: "/hr/leaves", icon: "📝" },
    { name: "Reports", path: "/hr/reports", icon: "📑" },
  ];

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-wide">
          HR<span className="text-emerald-600">Panel</span>
        </h1>
        <p className="text-[11px] text-slate-400 mt-1">
          Manage people & policies
        </p>
      </div>

      <nav className="space-y-1 flex-1">
        {menu.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  active
                    ? "bg-emerald-600 text-white shadow"
                    : "text-slate-700 hover:bg-slate-100 hover:translate-x-1"
                }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={logout}
        className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium shadow hover:bg-red-700 transition"
      >
        🚪 Logout
      </button>
    </div>
  );
}
