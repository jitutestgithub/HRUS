import React, { useEffect, useState } from "react";
import EmployeeSidebar from "./EmployeeSidebar";
import api from "../api";

export default function EmployeeLayout({ children, title }) {
  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await api.get("/auth/me");
        setMe(res.data || null);
      } catch (err) {
        console.error("EMPLOYEE LAYOUT /auth/me ERROR:", err);
      } finally {
        setLoadingMe(false);
      }
    };
    loadMe();
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return "E";
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const displayName = me?.name || me?.first_name || "Employee";

  const headerTitle = title || "Employee Portal";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* DESKTOP SIDEBAR (fixed) */}
        <div className="hidden md:block fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200">
          <EmployeeSidebar />
        </div>

        {/* MOBILE SIDEBAR (drawer) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="w-64 bg-white border-r border-slate-200">
              <EmployeeSidebar />
            </div>
            <div
              className="flex-1 bg-black/40"
              onClick={() => setSidebarOpen(false)}
            />
          </div>
        )}

        {/* MAIN AREA */}
        <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
          {/* TOP BAR */}
          <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
            <div className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6">
              <div className="flex items-center gap-3">
                {/* Mobile menu button */}
                <button
                  className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                  onClick={() => setSidebarOpen(true)}
                >
                  <span className="sr-only">Open menu</span>
                  <span className="text-lg">☰</span>
                </button>

                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-800">
                    {headerTitle}
                  </span>
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    {title
                      ? "Employee Portal · " + title
                      : "Attendance · Leaves · Profile"}
                  </span>
                </div>
              </div>

              {/* Right side user chip */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-800">
                    {loadingMe ? "Loading..." : displayName}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {(me?.role || "employee").toString().toUpperCase()}
                  </p>
                </div>
                <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700">
                  {getInitials(displayName)}
                </div>
              </div>
            </div>
          </header>

          {/* SCROLLABLE CONTENT */}
          <main className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-6">
            <div className="max-w-6xl mx-auto">{children}</div>
          </main>

          {/* FOOTER */}
          <footer className="py-3 text-[11px] text-slate-400 text-center border-t border-slate-100">
            © {new Date().getFullYear()} HRMS · Employee Panel
          </footer>
        </div>
      </div>
    </div>
  );
}
