import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
import EmployeeLayout from "./EmployeeLayout";

export default function EmployeeMyLeaves() {
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [date, setDate] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/leaves/my");
      const data = Array.isArray(res.data) ? res.data : [];
      setLeaves(data);
      setFilteredLeaves(data);
    } catch (err) {
      console.error("MY LEAVES ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterByDate = async () => {
    if (!date) {
      setFilteredLeaves(leaves);
      setCurrentPage(1);
      return;
    }
    try {
      const res = await api.get(`/leaves/my/${date}`);
      const data = Array.isArray(res.data) ? res.data : [];
      setFilteredLeaves(data);
      setCurrentPage(1);
    } catch (err) {
      console.error("MY LEAVES DATE FILTER ERROR:", err);
    }
  };

  // Better date format: 18 Dec 2025
  const formatDate = (isoString) => {
    if (!isoString) return "-";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).replace(/,/, ""); // Removes comma → "18 Dec 2025"
  };

  const getStatusConfig = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "approved")
      return { label: "Approved", class: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    if (s === "rejected")
      return { label: "Rejected", class: "bg-rose-100 text-rose-800 border-rose-300" };
    return { label: "Pending", class: "bg-amber-100 text-amber-800 border-amber-300" };
  };

  // Summary
  const summary = useMemo(() => {
    const total = filteredLeaves.length;
    const pending = filteredLeaves.filter((l) => (l.status || "").toLowerCase() === "pending").length;
    const approved = filteredLeaves.filter((l) => (l.status || "").toLowerCase() === "approved").length;
    const rejected = filteredLeaves.filter((l) => (l.status || "").toLowerCase() === "rejected").length;
    return { total, pending, approved, rejected };
  }, [filteredLeaves]);

  // Tab filtered data
  const tabData = useMemo(() => {
    if (activeTab === "pending") return filteredLeaves.filter((l) => (l.status || "").toLowerCase() === "pending");
    if (activeTab === "approved") return filteredLeaves.filter((l) => (l.status || "").toLowerCase() === "approved");
    if (activeTab === "rejected") return filteredLeaves.filter((l) => (l.status || "").toLowerCase() === "rejected");
    return filteredLeaves;
  }, [filteredLeaves, activeTab]);

  const totalPages = Math.max(1, Math.ceil(tabData.length / pageSize));
  const paginated = useMemo(() => {
    const start = (Math.min(currentPage, totalPages) - 1) * pageSize;
    return tabData.slice(start, start + pageSize);
  }, [tabData, currentPage, totalPages]);

  // Reset page on tab/filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filteredLeaves]);

  return (
    <EmployeeLayout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">My Leaves</h1>
          <p className="text-sm text-slate-500 mt-2">
            Track all your leave requests, approvals, and rejections in one place.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard label="Total Requests" value={summary.total} icon="📋" color="bg-slate-100" />
          <SummaryCard label="Pending" value={summary.pending} icon="⏳" color="bg-amber-100" />
          <SummaryCard label="Approved" value={summary.approved} icon="✅" color="bg-emerald-100" />
          <SummaryCard label="Rejected" value={summary.rejected} icon="❌" color="bg-rose-100" />
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter by Start Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={filterByDate}
                className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
              >
                Apply Filter
              </button>
              <button
                onClick={() => {
                  setDate("");
                  setFilteredLeaves(leaves);
                  setCurrentPage(1);
                }}
                className="px-6 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition"
              >
                Reset
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">This filter applies to all tabs below.</p>
        </div>

        {/* Tabs + Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex flex-wrap gap-3">
              <TabButton active={activeTab === "all"} onClick={() => setActiveTab("all")} label="All" count={summary.total} />
              <TabButton active={activeTab === "pending"} onClick={() => setActiveTab("pending")} label="Pending" count={summary.pending} />
              <TabButton active={activeTab === "approved"} onClick={() => setActiveTab("approved")} label="Approved" count={summary.approved} />
              <TabButton active={activeTab === "rejected"} onClick={() => setActiveTab("rejected")} label="Rejected" count={summary.rejected} />
            </div>
          </div>

          {/* List / Table */}
          <div className="p-5">
            {loading ? (
              <div className="text-center py-12 text-slate-500">Loading your leave requests...</div>
            ) : tabData.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg font-medium text-slate-600">No leave requests found</p>
                <p className="text-sm text-slate-500 mt-2">Try adjusting the date filter or switching tabs.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        <th className="pb-4">Type</th>
                        <th className="pb-4">From</th>
                        <th className="pb-4">To</th>
                        <th className="pb-4">Reason</th>
                        <th className="pb-4">Status</th>
                        <th className="pb-4">Remark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginated.map((leave) => {
                        const status = getStatusConfig(leave.status);
                        return (
                          <tr key={leave.id} className="hover:bg-slate-50 transition">
                            <td className="py-4 font-medium">{leave.leave_type || "-"}</td>
                            <td className="py-4">{formatDate(leave.start_date)}</td>
                            <td className="py-4">{formatDate(leave.end_date)}</td>
                            <td className="py-4 max-w-xs">
                              <p className="text-slate-600 line-clamp-2">{leave.reason || "-"}</p>
                            </td>
                            <td className="py-4">
                              <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold border ${status.class}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="py-4 text-slate-600">
                              {leave.remark || <span className="italic text-slate-400">No remark</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  {paginated.map((leave) => {
                    const status = getStatusConfig(leave.status);
                    return (
                      <div key={leave.id} className="border border-slate-200 rounded-xl p-5 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-slate-800 text-lg">{leave.leave_type || "Leave Request"}</p>
                            <p className="text-sm text-slate-500 mt-1">
                              {formatDate(leave.start_date)} → {formatDate(leave.end_date)}
                            </p>
                          </div>
                          <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${status.class}`}>
                            {status.label}
                          </span>
                        </div>

                        {leave.reason && (
                          <div>
                            <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Reason</p>
                            <p className="text-sm text-slate-700 mt-1">{leave.reason}</p>
                          </div>
                        )}

                        {leave.remark && (
                          <div>
                            <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Admin Remark</p>
                            <p className="text-sm text-slate-700 mt-1">{leave.remark}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
                    <p className="text-slate-600">
                      Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{" "}
                      <strong>{Math.min(currentPage * pageSize, tabData.length)}</strong> of{" "}
                      <strong>{tabData.length}</strong> requests
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}

/* Reusable Components */
function SummaryCard({ label, value, icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <p className="text-3xl font-bold text-slate-800 mt-3">{value}</p>
      </div>
      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
        active
          ? "bg-indigo-600 text-white shadow-md"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {label}
      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${active ? "bg-white/30" : "bg-slate-300"}`}>
        {count}
      </span>
    </button>
  );
}