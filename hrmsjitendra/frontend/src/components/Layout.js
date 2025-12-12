// src/components/Layout.jsx
import React from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children, title, subtitle, rightContent }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col sm:flex-row">
      {/* LEFT / TOP: SIDEBAR */}
      <aside
        className="
          w-full sm:w-64
          bg-white
          border-b sm:border-b-0 sm:border-r border-slate-200
          sm:sticky sm:top-0 sm:h-screen
          flex-shrink-0
        "
      >
        <Sidebar />
      </aside>

      {/* RIGHT: MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER BAR */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wide text-slate-400">
              Admin Panel
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

          {/* RIGHT SIDE (EXTRA ACTIONS / USER INFO) */}
          <div className="flex items-center gap-3">
            {rightContent}

            {/* Simple placeholder avatar chip (optional) */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
              <div className="h-7 w-7 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-semibold">
                A
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-700">
                  Admin
                </span>
                <span className="text-[10px] text-slate-400">
                  Organization Admin
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT SCROLL AREA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* full width – no max-w, no center gap */}
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
