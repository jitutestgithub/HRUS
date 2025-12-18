import React, { useState } from "react";
import api from "../api";
import EmployeeLayout from "./EmployeeLayout";

export default function EmployeeApplyLeave() {
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const leaveTypes = [
    "Casual Leave",
    "Sick Leave",
    "Paid Leave",
    "Work From Home",
    "Half Day",
    "Other",
  ];

  const submitLeave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
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
      console.error(err);
      setMsg("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <EmployeeLayout>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Apply for Leave</h1>

      {/* Message */}
      {msg && (
        <div
          className={`p-4 mb-5 rounded-md text-sm font-medium shadow-sm ${
            msg === "success"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {msg === "success"
            ? "Leave request submitted successfully!"
            : "Failed to submit leave request."}
        </div>
      )}

      {/* Form Card */}
      <form
        onSubmit={submitLeave}
        className="bg-white p-6 shadow-md rounded-xl border border-gray-100 w-full max-w-xl"
      >
        {/* Leave Type */}
        <div className="mb-5">
          <label className="block mb-1 text-sm font-semibold text-gray-700">
            Leave Type
          </label>
          <select
            className="w-full border px-3 py-2 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none transition"
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
        </div>

        {/* From Date */}
        <div className="mb-5">
          <label className="block mb-1 text-sm font-semibold text-gray-700">
            From Date
          </label>
          <input
            type="date"
            className="w-full border px-3 py-2 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none transition"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            required
          />
        </div>

        {/* To Date */}
        <div className="mb-5">
          <label className="block mb-1 text-sm font-semibold text-gray-700">
            To Date
          </label>
          <input
            type="date"
            className="w-full border px-3 py-2 rounded-md text-sm shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none transition"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            required
          />
        </div>

        {/* Reason */}
        <div className="mb-5">
          <label className="block mb-1 text-sm font-semibold text-gray-700">
            Reason
          </label>
          <textarea
            className="w-full border px-3 py-2 rounded-md text-sm h-28 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none transition"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Write the reason for your leave..."
            required
          ></textarea>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-sm shadow-md transition disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Leave Request"}
        </button>
      </form>
    </EmployeeLayout>
  );
}
