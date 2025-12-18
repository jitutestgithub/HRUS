// src/hr/HrLayout.jsx
import React from "react";
import HrSidebar from "./HrSidebar";

export default function HrLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 md:sticky md:top-0 md:h-screen flex-shrink-0">
        <HrSidebar />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wide text-slate-400">
              HR Portal
            </span>
            <h1 className="text-sm md:text-base font-semibold text-slate-800">
              {title || "Dashboard"}
            </h1>
            {subtitle && (
              <p className="text-[11px] text-slate-500 hidden md:block">
                {subtitle}
              </p>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
