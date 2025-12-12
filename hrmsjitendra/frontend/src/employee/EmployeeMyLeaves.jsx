import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
import EmployeeLayout from "./EmployeeLayout";

export default function EmployeeMyLeaves() {
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [date, setDate] = useState("");

  const [activeTab, setActiveTab] = useState("all"); // all | pending | approved | rejected

  // Pagination states
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

  const formatDate = (isoString) => {
    if (!isoString) return "-";
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toISOString().split("T")[0];
  };

  const statusColor = (status) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "rejected":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      default:
        // pending
        return "bg-amber-50 text-amber-700 border border-amber-200";
    }
  };

  const statusLabel = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "approved") return "Approved";
    if (s === "rejected") return "Rejected";
    return "Pending";
  };

  // Summary counts
  const summary = useMemo(() => {
    const total = filteredLeaves.length;
    const pending = filteredLeaves.filter(
      (l) => (l.status || "").toLowerCase() === "pending"
    ).length;
    const approved = filteredLeaves.filter(
      (l) => (l.status || "").toLowerCase() === "approved"
    ).length;
    const rejected = filteredLeaves.filter(
      (l) => (l.status || "").toLowerCase() === "rejected"
    ).length;

    return { total, pending, approved, rejected };
  }, [filteredLeaves]);

  // Tabs data
  const tabData = useMemo(() => {
    const norm = (s) => (s || "").toLowerCase();

    if (activeTab === "pending") {
      return filteredLeaves.filter((l) => norm(l.status) === "pending");
    }
    if (activeTab === "approved") {
      return filteredLeaves.filter((l) => norm(l.status) === "approved");
    }
    if (activeTab === "rejected") {
      return filteredLeaves.filter((l) => norm(l.status) === "rejected");
    }
    return filteredLeaves;
  }, [filteredLeaves, activeTab]);

  const totalPages = Math.max(1, Math.ceil(tabData.length / pageSize));

  const paginated = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    return tabData.slice(startIndex, startIndex + pageSize);
  }, [tabData, currentPage, totalPages]);

  // jab tab ya filter change ho to page reset
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  return (
    <EmployeeLayout title="My Leaves">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Leaves</h1>
            <p className="text-sm text-slate-500 mt-1">
              Track all your leave requests, approvals and rejections in one place.
            </p>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Total Requests"
            value={summary.total}
            icon="📋"
          />
          <SummaryCard
            label="Pending"
            value={summary.pending}
            icon="⏳"
            pillClass="bg-amber-50 text-amber-700"
          />
          <SummaryCard
            label="Approved"
            value={summary.approved}
            icon="✅"
            pillClass="bg-emerald-50 text-emerald-700"
          />
          <SummaryCard
            label="Rejected"
            value={summary.rejected}
            icon="❌"
            pillClass="bg-rose-50 text-rose-700"
          />
        </div>

        {/* Filter Card */}
        <div className="bg-white p-4 shadow-sm rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">
                Filter by Date (Start Date)
              </label>
              <input
                type="date"
                className="border px-3 py-2 rounded-md text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="flex gap-2 mt-1">
              <button
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-md shadow text-xs md:text-sm"
                onClick={filterByDate}
              >
                Apply Filter
              </button>

              <button
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 transition text-slate-700 rounded-md shadow text-xs md:text-sm"
                onClick={() => {
                  setDate("");
                  setFilteredLeaves(leaves);
                  setCurrentPage(1);
                }}
              >
                Reset
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Filter affects all tabs. You can view different statuses below.
          </div>
        </div>

        {/* Tabs + Table */}
        <div className="bg-white p-4 md:p-6 shadow-sm rounded-xl border border-slate-200">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 mb-4 text-xs">
            <TabButton
              active={activeTab === "all"}
              onClick={() => setActiveTab("all")}
              label="All"
              count={summary.total}
            />
            <TabButton
              active={activeTab === "pending"}
              onClick={() => setActiveTab("pending")}
              label="Pending"
              count={summary.pending}
            />
            <TabButton
              active={activeTab === "approved"}
              onClick={() => setActiveTab("approved")}
              label="Approved"
              count={summary.approved}
            />
            <TabButton
              active={activeTab === "rejected"}
              onClick={() => setActiveTab("rejected")}
              label="Rejected"
              count={summary.rejected}
            />
          </div>

          {/* Table */}
          {loading ? (
            <p className="text-center text-slate-500 py-6 text-sm">
              Loading your leave history...
            </p>
          ) : tabData.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">
              <p>No leave requests found in this filter.</p>
              <p className="text-xs mt-1">
                Try changing the date filter or status tab.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <Th>Leave Type</Th>
                      <Th>From</Th>
                      <Th>To</Th>
                      <Th className="w-2/5">Reason</Th>
                      <Th>Status</Th>
                      <Th>Remark</Th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginated.map((leave) => (
                      <tr
                        key={leave.id}
                        className="border-t hover:bg-slate-50 transition"
                      >
                        <Td>{leave.leave_type}</Td>
                        <Td>{formatDate(leave.start_date)}</Td>
                        <Td>{formatDate(leave.end_date)}</Td>

                        <Td>
                          <p className="line-clamp-2 text-xs md:text-sm text-slate-700">
                            {leave.reason}
                          </p>
                        </Td>

                        <Td>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold shadow-sm ${statusColor(
                              leave.status
                            )}`}
                          >
                            {statusLabel(leave.status)}
                          </span>
                        </Td>

                        <Td>
                          <span className="text-xs text-slate-600">
                            {leave.remark || (
                              <span className="italic text-slate-400">
                                No remark
                              </span>
                            )}
                          </span>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 text-xs text-slate-500 flex-wrap gap-2">
                <div>
                  Showing{" "}
                  <span className="font-semibold">
                    {tabData.length === 0
                      ? 0
                      : (currentPage - 1) * pageSize + 1}
                  </span>{" "}
                  –{" "}
                  <span className="font-semibold">
                    {Math.min(currentPage * pageSize, tabData.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold">{tabData.length}</span> records
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 transition rounded border border-slate-200 disabled:opacity-50 text-xs"
                    onClick={() =>
                      setCurrentPage((p) => Math.max(1, p - 1))
                    }
                  >
                    Prev
                  </button>

                  <span className="text-xs">
                    Page{" "}
                    <span className="font-semibold">{currentPage}</span> of{" "}
                    <span className="font-semibold">{totalPages}</span>
                  </span>

                  <button
                    disabled={currentPage >= totalPages}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 transition rounded border border-slate-200 disabled:opacity-50 text-xs"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </EmployeeLayout>
  );
}

/* --------- Small reusable parts --------- */

function SummaryCard({ label, value, icon, pillClass }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between">
      <div>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
      </div>
      <div
        className={`h-10 w-10 rounded-full flex items-center justify-center text-lg ${
          pillClass || "bg-slate-50 text-slate-700"
        }`}
      >
        {icon}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-[11px] font-medium transition ${
        active
          ? "bg-indigo-600 text-white border-indigo-600"
          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
      }`}
    >
      <span>{label}</span>
      <span
        className={`px-1.5 py-0.5 rounded-full text-[10px] ${
          active ? "bg-white/20" : "bg-slate-200 text-slate-700"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function Th({ children, className = "" }) {
  return (
    <th
      className={`p-3 border text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wide ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td className="p-3 border align-top text-xs md:text-sm text-slate-700">
      {children}
    </td>
  );
}
