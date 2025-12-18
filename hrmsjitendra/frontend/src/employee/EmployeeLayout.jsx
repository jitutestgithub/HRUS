import React, { useEffect, useState } from "react";
import EmployeeSidebar from "./EmployeeSidebar";
import api from "../api";

export default function EmployeeLayout({ children, title }) {
  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await api.get("/auth/me");
        setMe(res.data || null);
      } catch (err) {
        console.error("EMPLOYEE /auth/me ERROR:", err);
      } finally {
        setLoadingMe(false);
      }
    };
    loadMe();
  }, []);

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
    <div className="min-h-screen bg-slate-50 flex">

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 fixed inset-y-0 left-0">
        <EmployeeSidebar />
      </aside>

      {/* MOBILE SIDEBAR */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <aside className="w-64 bg-white border-r border-slate-200">
            <EmployeeSidebar onClose={() => setSidebarOpen(false)} />
          </aside>
          <div
            className="flex-1 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* MAIN AREA */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">

        {/* HEADER */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
          <div className="h-14 md:h-16 px-4 md:px-6 flex items-center justify-between">

            {/* LEFT */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden h-9 w-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                ☰
              </button>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {headerTitle}
                </p>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Attendance · Leaves · Profile
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-slate-800">
                  {loadingMe ? "Loading..." : displayName}
                </p>
                <p className="text-[11px] text-slate-500 uppercase">
                  {me?.role || "employee"}
                </p>
              </div>

              <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700">
                {getInitials(displayName)}
              </div>
            </div>

          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-6">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>

        {/* FOOTER */}
        <footer className="py-3 text-[11px] text-slate-400 text-center border-t">
          © {new Date().getFullYear()} HRMS · Employee Panel
        </footer>
      </div>
    </div>
  );
}
