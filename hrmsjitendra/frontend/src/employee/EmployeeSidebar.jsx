import React, { useState } from "react";
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
  Menu,
  X
} from "lucide-react";

export default function EmployeeSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menu = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/employee/dashboard" },
    { name: "My Attendance", icon: <CalendarCheck size={18} />, path: "/employee/attendance" },
    { name: "Attendance Calendar", icon: <CalendarDays size={18} />, path: "/employee/attendance/calendar" },
    
    // ⭐ NEW Feature
    { name: "Work Analytics", icon: <BarChart3 size={18} />, path: "/employee/work-analytics" },

    { name: "Apply Leave", icon: <Pencil size={18} />, path: "/employee/leaves/apply" },
    { name: "My Leaves", icon: <FileText size={18} />, path: "/employee/leaves" },
    { name: "Profile", icon: <User size={18} />, path: "/employee/profile/overview" },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-green-600 text-white p-2 rounded-md shadow"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 h-screen w-64 bg-white shadow-xl border-r transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} 
        `}
      >
        <div className="p-5 text-xl font-bold border-b text-green-700 flex items-center gap-2">
          <LayoutDashboard size={22} /> Employee Panel
        </div>

        <nav className="p-4 space-y-1">
          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-all 
                ${
                  pathname === item.path
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-gray-700 hover:bg-green-100"
                }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t mt-auto">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md font-medium shadow hover:bg-red-700 transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
