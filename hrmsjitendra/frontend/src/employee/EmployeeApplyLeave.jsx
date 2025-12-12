import React, { useMemo, useState } from "react";
import api from "../api";
import EmployeeLayout from "./EmployeeLayout";

export default function EmployeeApplyLeave() {
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(""); // "success" | "error" | ""
  const [errorText, setErrorText] = useState("");

  const leaveTypes = [
    "Casual Leave",
    "Sick Leave",
    "Paid Leave",
    "Work From Home",
    "Half Day",
    "Other",
  ];

  // Total days calculation (inclusive)
  const totalDays = useMemo(() => {
    if (!fromDate || !toDate) return 0;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
    const diff = end.getTime() - start.getTime();
    if (diff < 0) return 0;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  }, [fromDate, toDate]);

  const validateForm = () => {
    if (!leaveType || !fromDate || !toDate || !reason.trim()) {
      setErrorText("Please fill all required fields.");
      return false;
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (start > end) {
      setErrorText("From Date cannot be after To Date.");
      return false;
    }

    setErrorText("");
    return true;
  };

  const submitLeave = async (e) => {
    e.preventDefault();
    setMsg("");
    setErrorText("");

    if (!validateForm()) return;

    try {
      setLoading(true);

      await api.post("/leaves/apply", {
        leave_type: leaveType,
        from_date: fromDate,
        to_date: toDate,
        reason,
      });

      setMsg("success");
      setLeaveType("");
      setFromDate("");
      setToDate("");
      setReason("");
    } catch (err) {
      console.error("LEAVE APPLY ERROR:", err);
      setMsg("error");
      setErrorText(
        err?.response?.data?.message ||
          "Failed to submit leave request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <EmployeeLayout title="Apply for Leave">
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Apply for Leave
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Submit a leave request with proper dates and reason. Your manager
              will review and approve it.
            </p>
          </div>
        </div>

        {/* Status alert */}
        {msg && (
          <div
            className={`flex items-start gap-3 p-3 rounded-lg text-sm shadow-sm border ${
              msg === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-700"
            }`}
          >
            <span className="mt-0.5 text-lg">
              {msg === "success" ? "✅" : "⚠️"}
            </span>
            <div>
              <p className="font-medium">
                {msg === "success"
                  ? "Leave request submitted successfully!"
                  : "Failed to submit leave request."}
              </p>
              {msg === "error" && errorText && (
                <p className="text-xs mt-1 opacity-80">{errorText}</p>
              )}
            </div>
          </div>
        )}

        {/* Main layout: form + info */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] gap-6 items-start">
          {/* Form Card */}
          <form
            onSubmit={submitLeave}
            className="bg-white p-6 shadow-sm rounded-xl border border-slate-200 space-y-5"
          >
            {/* Leave Type with quick chips */}
            <div>
              <label className="block mb-1 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Leave Type
              </label>
              <select
                className="w-full border px-3 py-2 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none transition"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                required
              >
                <option value="">Select Leave Type</option>
                {leaveTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              {/* Quick select chips */}
              <div className="flex flex-wrap gap-2 mt-2">
                {leaveTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setLeaveType(type)}
                    className={`px-3 py-1 rounded-full text-xs border transition ${
                      leaveType === type
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  From Date
                </label>
                <input
                  type="date"
                  className="w-full border px-3 py-2 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none transition"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setMsg("");
                  }}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  To Date
                </label>
                <input
                  type="date"
                  className="w-full border px-3 py-2 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none transition"
                  value={toDate}
                  min={fromDate || undefined}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setMsg("");
                  }}
                  required
                />
              </div>
            </div>

            {/* Date info / total days */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <p className="text-slate-500">
                {fromDate && toDate && totalDays > 0 ? (
                  <>
                    You are applying for{" "}
                    <span className="font-semibold text-slate-800">
                      {totalDays} day{totalDays > 1 ? "s" : ""}
                    </span>{" "}
                    of leave.
                  </>
                ) : (
                  "Select both From Date and To Date to see total days."
                )}
              </p>

              {errorText && (
                <span className="text-rose-500 font-medium">
                  {errorText}
                </span>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="block mb-1 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Reason
              </label>
              <textarea
                className="w-full border px-3 py-2 rounded-md text-sm h-28 shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 outline-none transition resize-none"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setMsg("");
                }}
                placeholder="Write a clear and concise reason for your leave..."
                required
              ></textarea>
              <div className="mt-1 flex justify-between text-[11px] text-slate-400">
                <span>Example: Medical emergency, personal work, family function etc.</span>
                <span>{reason.length}/500</span>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium text-sm shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit Leave Request"}
            </button>
          </form>

          {/* Side Info Card */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <h2 className="text-sm font-semibold text-slate-800">
                Leave Guidelines
              </h2>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                <li>• Ensure dates are correct before submitting.</li>
                <li>• For urgent / sick leave, mention it clearly in reason.</li>
                <li>• Half day leave ke liye “Half Day” type select karein.</li>
                <li>• Manager approval ke baad hi leave confirm hoga.</li>
              </ul>
            </div>

            <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-4 text-xs text-slate-700">
              <h3 className="text-sm font-semibold text-indigo-800 mb-1.5">
                Tip
              </h3>
              <p className="mb-2">
                Attempt to apply for planned leaves at least{" "}
                <span className="font-semibold">2–3 days in advance</span> so
                that your team can adjust workload smoothly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}
