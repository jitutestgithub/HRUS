import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  CalendarCheck,
  BarChart3,
  Pencil,
  FileText,
  User,
  LogOut,
} from "lucide-react";

export default function EmployeeSidebar({ onClose }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menu = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      path: "/employee/dashboard",
    },
    {
      name: "My Attendance",
      icon: <CalendarCheck size={18} />,
      path: "/employee/attendance",
    },
    {
      name: "Attendance Calendar",
      icon: <CalendarDays size={18} />,
      path: "/employee/attendance/calendar",
    },
    {
      name: "Work Analytics",
      icon: <BarChart3 size={18} />,
      path: "/employee/work-analytics",
    },
    {
      name: "Apply Leave",
      icon: <Pencil size={18} />,
      path: "/employee/leaves/apply",
    },
    {
      name: "My Leaves",
      icon: <FileText size={18} />,
      path: "/employee/leaves",
    },
    {
      name: "Profile",
      icon: <User size={18} />,
      path: "/employee/profile/overview",
    },
  ];

  return (
    <aside className="h-full w-64 bg-white border-r border-slate-200 flex flex-col">

      {/* HEADER */}
      <div className="h-16 px-5 flex items-center gap-2 border-b font-bold text-green-700">
        <LayoutDashboard size={22} />
        Employee Panel
      </div>

      {/* MENU */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menu.map((item) => {
          const active = pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition
                ${
                  active
                    ? "bg-green-600 text-white shadow"
                    : "text-slate-700 hover:bg-green-100"
                }
              `}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2
          bg-red-600 text-white rounded-lg font-medium shadow
          hover:bg-red-700 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
