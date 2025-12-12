import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const menu = [
    { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { name: "Organization", path: "/organization", icon: "🏢" },
    { name: "Departments", path: "/departments", icon: "🗂️" },
    { name: "Employees", path: "/employees", icon: "👥" },

    { name: "Attendance", path: "/admin/attendance/list", icon: "⏱️" },
    { name: "Attendance Calendar", path: "/admin/attendance/calendar", icon: "🗓️" },

    { name: "Leave Approval", path: "/admin/leaves", icon: "✔️" },

    { name: "Settings", path: "/settings", icon: "⚙️" },
  ];

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex bg-slate-100 min-h-screen">

      {/* SIDEBAR */}
      <aside className="
        w-64 bg-white shadow-lg border-r border-slate-200 p-6
        hidden md:flex flex-col justify-between sticky top-0 h-screen
      ">
        {/* TOP LOGO + MENU */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-8 tracking-wide">
            HR<span className="text-indigo-600">MS</span>
          </h1>

          <nav className="space-y-2">
            {menu.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                    ${active 
                      ? "bg-indigo-600 text-white shadow-md" 
                      : "text-slate-700 hover:bg-slate-100 hover:translate-x-1"
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          onClick={logout}
          className="
            flex items-center justify-center gap-2 px-4 py-3 mt-6
            bg-red-600 text-white rounded-lg shadow hover:bg-red-700
            transition-all font-medium text-sm
          "
        >
          🚪 Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:ml-0 ml-0">
        {children}
      </main>
    </div>
  );
}
