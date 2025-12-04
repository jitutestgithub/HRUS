import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function EmployeeSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menu = [
    { name: "Dashboard", path: "/employee/dashboard" },
    { name: "My Attendance", path: "/employee/attendance" },
    { name: "Attendance Calendar", path: "/employee/attendance/calendar" },
    { name: "Apply Leave", path: "/employee/leaves/apply" },
    { name: "My Leaves", path: "/employee/leaves" },
    { name: "Profile", path: "/employee/profile" },
  ];

  return (
    <aside className="w-64 bg-white shadow-md h-screen sticky top-0 flex flex-col justify-between">
      <div>
        <div className="p-5 text-xl font-bold border-b">
          Employee Panel
        </div>

        <nav className="p-4">
          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-2 rounded mb-2 
                ${
                  pathname === item.path
                    ? "bg-green-600 text-white"
                    : "hover:bg-green-100"
                }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* LOGOUT BUTTON */}
      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="w-full px-4 py-2 bg-red-600 text-white rounded"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
