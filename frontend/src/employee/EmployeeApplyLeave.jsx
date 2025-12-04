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
      const res = await api.post("/leaves/apply", {
        leave_type: leaveType,
        from_date: fromDate,
        to_date: toDate,
        reason,
      });

      setMsg("Leave request submitted successfully!");
      setLeaveType("");
      setFromDate("");
      setToDate("");
      setReason("");
    } catch (err) {
      console.log(err);
      setMsg("Failed to submit leave request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <EmployeeLayout>
      <h1 className="text-2xl font-bold mb-6">Apply for Leave</h1>

      {msg && (
        <p
          className={`p-3 mb-4 text-white rounded ${
            msg.includes("success")
              ? "bg-green-600"
              : "bg-red-600"
          }`}
        >
          {msg}
        </p>
      )}

      <form onSubmit={submitLeave} className="bg-white p-6 shadow rounded w-full max-w-xl">

        {/* Leave Type */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Leave Type</label>
          <select
            className="w-full border p-2 rounded"
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
        <div className="mb-4">
          <label className="block mb-1 font-medium">From Date</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            required
          />
        </div>

        {/* To Date */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">To Date</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            required
          />
        </div>

        {/* Reason */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Reason</label>
          <textarea
            className="w-full border p-2 rounded h-24"
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
          className="px-5 py-2 bg-blue-600 text-white rounded w-full"
        >
          {loading ? "Submitting..." : "Submit Leave Request"}
        </button>
      </form>
    </EmployeeLayout>
  );
}
