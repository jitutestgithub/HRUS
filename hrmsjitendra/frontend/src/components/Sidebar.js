import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menu = [
    { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { name: "Organization", path: "/organization", icon: "🏢" },
    { name: "Departments", path: "/departments", icon: "🗂️" },
    { name: "Employees", path: "/employees", icon: "👥" },
    { name: "Attendance", path: "/admin/attendance/list", icon: "⏱️" },
    { name: "Calendar", path: "/admin/attendance/calendar", icon: "🗓️" },
    { name: "Leave Approval", path: "/admin/leaves", icon: "✔️" },
    { name: "Settings", path: "/settings", icon: "⚙️" },
  ];

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const Sidebar = ({ mobile = false }) => (
    <aside
      className={`w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between
      ${mobile ? "" : "hidden md:flex fixed inset-y-0 left-0"}`}
    >
      <div>
        <h1 className="text-2xl font-extrabold mb-8">
          HR<span className="text-indigo-600">MS</span>
        </h1>

        <nav className="space-y-2">
          {menu.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition
                  ${active
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-700 hover:bg-slate-100"
                  }`}
              >
                <span>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        onClick={logout}
        className="mt-6 bg-red-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-red-700"
      >
        🚪 Logout
      </button>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex">

      {/* DESKTOP SIDEBAR */}
      <Sidebar />

      {/* MOBILE SIDEBAR */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <Sidebar mobile />
          <div
            className="flex-1 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* MAIN */}
      <div className="flex-1 md:ml-64 flex flex-col">

        {/* HEADER */}
        <header className="sticky top-0 z-30 bg-white border-b px-4 h-14 flex items-center justify-between">
          <button
            className="md:hidden text-xl"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <h2 className="text-sm font-semibold text-slate-700">
            Admin Panel
          </h2>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
